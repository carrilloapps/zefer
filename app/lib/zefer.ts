import { encrypt, decrypt, encryptBytes, decryptBytes, combineDualKeys, hashAnswer } from "./crypto";
import { compress, decompress, type CompressionMethod } from "./compression";
import { bindToInstance } from "./instance";

const MAGIC = "ZEFER3";

// ─── Public header ───

export interface ZeferHeader {
  iterations: number;
  compression: CompressionMethod;
  hint: string | null;
  note: string | null;
  mode: "text" | "file";
}

// ─── Encrypted metadata (inside cipher, invisible) ───

export interface ZeferMeta {
  v: 3;
  fileName: string | null;
  fileType: string | null;  // MIME type for file mode
  fileSize: number;         // original size in bytes
  expiresAt: number;
  createdAt: number;
  answerHash: string | null;
  allowedIps: string[];
  question: string | null;
  maxAttempts: number;
  strict: boolean;
}

// ─── Decoded result ───

export interface ZeferPayload {
  meta: ZeferMeta;
  content: string | null;       // text mode
  fileData: ArrayBuffer | null; // file mode
}

// ─── Encode options ───

export interface EncodeOptions {
  // Content — one of these must be provided
  content?: string;
  fileData?: ArrayBuffer;

  passphrase: string;
  secondPassphrase?: string;
  revealKey?: string;
  fileName: string | null;
  fileType?: string;
  expiresAt: number;
  hint?: string;
  note?: string;
  question?: string;
  questionAnswer?: string;
  maxAttempts?: number;
  iterations?: number;
  dualKey?: boolean;
  compression?: CompressionMethod;
  allowedIps?: string[];
  strict?: boolean;
  instanceHash?: string;
}

// ─── Encode ───

export async function encodeZefer(opts: EncodeOptions): Promise<string> {
  const iterations = opts.iterations || 600_000;
  const compressionMethod = opts.compression || "none";
  const dualKey = opts.dualKey || false;
  const strict = opts.strict || false;
  const hasRevealKey = !!opts.revealKey?.trim();
  const isFile = !!opts.fileData;

  const header: ZeferHeader = {
    iterations,
    compression: compressionMethod,
    hint: opts.hint?.trim() || null,
    note: opts.note?.trim() || null,
    mode: isFile ? "file" : "text",
  };

  let answerHash: string | null = null;
  if (opts.question && opts.questionAnswer) {
    answerHash = await hashAnswer(opts.questionAnswer);
  }

  const rawData = isFile ? opts.fileData! : new TextEncoder().encode(opts.content || "").buffer as ArrayBuffer;

  const meta: ZeferMeta = {
    v: 3,
    fileName: opts.fileName,
    fileType: opts.fileType || null,
    fileSize: rawData.byteLength,
    expiresAt: opts.expiresAt,
    createdAt: Date.now(),
    answerHash,
    allowedIps: opts.allowedIps || [],
    question: opts.question?.trim() || null,
    maxAttempts: opts.maxAttempts || 0,
    strict,
  };

  // Compress text content (skip compression for binary files — already compressed formats like zip/jpg)
  let dataToEncrypt: ArrayBuffer;
  if (!isFile && compressionMethod !== "none") {
    const compressed = await compress(opts.content || "", compressionMethod);
    dataToEncrypt = new TextEncoder().encode(compressed).buffer as ArrayBuffer;
  } else {
    dataToEncrypt = rawData;
  }

  // Combine: meta JSON + separator + data bytes
  const metaBytes = new TextEncoder().encode(JSON.stringify(meta));
  const separator = new Uint8Array([0]); // null byte separator
  const combined = new Uint8Array(metaBytes.length + 1 + dataToEncrypt.byteLength);
  combined.set(metaBytes, 0);
  combined.set(separator, metaBytes.length);
  combined.set(new Uint8Array(dataToEncrypt), metaBytes.length + 1);

  // Build passphrase
  let mainPassphrase = dualKey && opts.secondPassphrase
    ? combineDualKeys(opts.passphrase, opts.secondPassphrase)
    : opts.passphrase;
  if (strict && opts.instanceHash) mainPassphrase = bindToInstance(mainPassphrase, opts.instanceHash);

  const mainEncrypted = await encryptBytes(combined.buffer as ArrayBuffer, mainPassphrase, iterations);
  const lines = [MAGIC, JSON.stringify(header), mainEncrypted];

  if (hasRevealKey) {
    let revealPass = opts.revealKey!;
    if (strict && opts.instanceHash) revealPass = bindToInstance(revealPass, opts.instanceHash);
    lines.push(await encryptBytes(combined.buffer as ArrayBuffer, revealPass, iterations));
  }

  return lines.join("\n");
}

// ─── Decode ───

export type DecodeError =
  | "invalid_format"
  | "wrong_passphrase"
  | "expired"
  | "wrong_answer"
  | "max_attempts"
  | "ip_blocked"
  | "needs_answer";

export type DecodeResult =
  | { ok: true; payload: ZeferPayload; header: ZeferHeader }
  | { ok: false; error: DecodeError };

export interface ParsedFile {
  header: ZeferHeader;
  encryptedLines: string[];
}

export function parseFile(fileContent: string): ParsedFile | null {
  const lines = fileContent.trim().split("\n");
  if (lines.length < 3) return null;

  // Support ZEFER2 and ZEFER3
  if (lines[0] !== MAGIC && lines[0] !== "ZEFER2") return null;

  try {
    const header = JSON.parse(lines[1]) as ZeferHeader;
    if (!header.mode) header.mode = "text"; // ZEFER2 backward compat
    return { header, encryptedLines: lines.slice(2) };
  } catch {
    return null;
  }
}

async function tryDecryptCombined(
  encryptedLines: string[],
  passphrase: string,
  header: ZeferHeader
): Promise<{ meta: ZeferMeta; rawData: ArrayBuffer } | null> {
  for (const line of encryptedLines) {
    try {
      const decryptedBuf = await decryptBytes(line, passphrase, header.iterations);
      const decryptedArr = new Uint8Array(decryptedBuf);

      // Find the null byte separator
      const sepIndex = decryptedArr.indexOf(0);
      if (sepIndex === -1) {
        // Fallback: ZEFER2 format (entire content is JSON text)
        const text = new TextDecoder().decode(decryptedBuf);
        const raw = header.compression === "none" ? text : await decompress(text, header.compression);
        const legacy = JSON.parse(raw);
        // Convert v2 payload to v3 meta
        const meta: ZeferMeta = {
          v: 3,
          fileName: legacy.fileName,
          fileType: null,
          fileSize: 0,
          expiresAt: legacy.expiresAt,
          createdAt: legacy.createdAt,
          answerHash: legacy.answerHash,
          allowedIps: legacy.allowedIps || [],
          question: legacy.question || null,
          maxAttempts: legacy.maxAttempts || 0,
          strict: legacy.strict || false,
        };
        const contentBytes = new TextEncoder().encode(legacy.content);
        return { meta, rawData: contentBytes.buffer as ArrayBuffer };
      }

      const metaBytes = decryptedArr.slice(0, sepIndex);
      const dataBytes = decryptedArr.slice(sepIndex + 1);
      const meta = JSON.parse(new TextDecoder().decode(metaBytes)) as ZeferMeta;

      return { meta, rawData: dataBytes.buffer as ArrayBuffer };
    } catch {
      continue;
    }
  }
  return null;
}

export async function decodeZefer(
  fileContent: string,
  passphrase: string,
  options?: {
    secondPassphrase?: string;
    questionAnswer?: string;
    instanceHash?: string;
  }
): Promise<DecodeResult> {
  const parsed = parseFile(fileContent);
  if (!parsed) return { ok: false, error: "invalid_format" };

  const { header, encryptedLines } = parsed;
  const { secondPassphrase, questionAnswer, instanceHash } = options || {};

  // Build candidates
  const candidates: string[] = [];
  candidates.push(passphrase);
  if (instanceHash) candidates.push(bindToInstance(passphrase, instanceHash));
  if (secondPassphrase) {
    const dual = combineDualKeys(passphrase, secondPassphrase);
    candidates.push(dual);
    if (instanceHash) candidates.push(bindToInstance(dual, instanceHash));
  }

  let result: { meta: ZeferMeta; rawData: ArrayBuffer } | null = null;
  for (const candidate of candidates) {
    result = await tryDecryptCombined(encryptedLines, candidate, header);
    if (result) break;
  }

  if (!result) return { ok: false, error: "wrong_passphrase" };

  const { meta, rawData } = result;

  // Max attempts
  if (meta.maxAttempts > 0) {
    const fileKey = `zefer_attempts_${encryptedLines[0].substring(0, 40)}`;
    const attempts = parseInt(localStorage.getItem(fileKey) || "0", 10) + 1;
    localStorage.setItem(fileKey, String(attempts));
    if (attempts > meta.maxAttempts) return { ok: false, error: "max_attempts" };
  }

  // Secret question
  if (meta.answerHash && meta.question) {
    if (!questionAnswer) return { ok: false, error: "needs_answer" };
    const hash = await hashAnswer(questionAnswer);
    if (hash !== meta.answerHash) return { ok: false, error: "wrong_answer" };
  }

  // Expiration
  if (meta.expiresAt > 0 && Date.now() > meta.expiresAt) return { ok: false, error: "expired" };

  // Clear attempts on success
  if (meta.maxAttempts > 0) {
    const fileKey = `zefer_attempts_${encryptedLines[0].substring(0, 40)}`;
    localStorage.removeItem(fileKey);
  }

  // Build payload
  let content: string | null = null;
  let fileData: ArrayBuffer | null = null;

  if (header.mode === "file") {
    fileData = rawData;
  } else {
    const text = new TextDecoder().decode(rawData);
    content = header.compression !== "none" ? await decompress(text, header.compression) : text;
  }

  return { ok: true, payload: { meta, content, fileData }, header };
}

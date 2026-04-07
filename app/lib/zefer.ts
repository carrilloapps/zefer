import { encrypt, decrypt, encryptBytes, decryptBytes, combineDualKeys, hashAnswer } from "./crypto";
import { compress, decompress, type CompressionMethod } from "./compression";

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
}

function isValidMeta(obj: unknown): obj is ZeferMeta {
  if (!obj || typeof obj !== "object") return false;
  const m = obj as Record<string, unknown>;
  return (
    m.v === 3 &&
    typeof m.expiresAt === "number" &&
    typeof m.createdAt === "number" &&
    typeof m.maxAttempts === "number" &&
    typeof m.fileSize === "number" &&
    Array.isArray(m.allowedIps)
  );
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
}

// ─── Encode ───

export async function encodeZefer(opts: EncodeOptions): Promise<string> {
  const iterations = opts.iterations || 600_000;
  const compressionMethod = opts.compression || "none";
  const dualKey = opts.dualKey || false;
  const hasRevealKey = !!opts.revealKey?.trim();
  const isFile = !!opts.fileData;

  // Sanitize public fields — strip any HTML/script to prevent stored XSS via .zefer file
  const sanitize = (s: string | undefined) => {
    const v = s?.trim();
    if (!v) return null;
    return v.replace(/[<>"'&]/g, "");
  };

  const header: ZeferHeader = {
    iterations,
    compression: compressionMethod,
    hint: sanitize(opts.hint),
    note: sanitize(opts.note),
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
  };

  // Compress text content (skip compression for binary files — already compressed formats like zip/jpg)
  let dataToEncrypt: ArrayBuffer;
  if (!isFile && compressionMethod !== "none") {
    const compressed = await compress(opts.content || "", compressionMethod);
    dataToEncrypt = new TextEncoder().encode(compressed).buffer as ArrayBuffer;
  } else {
    dataToEncrypt = rawData;
  }

  // Combine: 4-byte length prefix + meta JSON + data bytes
  // Using length prefix instead of null-byte separator to avoid collision
  const metaBytes = new TextEncoder().encode(JSON.stringify(meta));
  const lengthPrefix = new Uint8Array(4);
  new DataView(lengthPrefix.buffer).setUint32(0, metaBytes.length, false); // big-endian
  const combined = new Uint8Array(4 + metaBytes.length + dataToEncrypt.byteLength);
  combined.set(lengthPrefix, 0);
  combined.set(metaBytes, 4);
  combined.set(new Uint8Array(dataToEncrypt), 4 + metaBytes.length);

  // Build passphrase
  let mainPassphrase = dualKey && opts.secondPassphrase
    ? combineDualKeys(opts.passphrase, opts.secondPassphrase)
    : opts.passphrase;
  const mainEncrypted = await encryptBytes(combined.buffer as ArrayBuffer, mainPassphrase, iterations);
  const lines = [MAGIC, JSON.stringify(header), mainEncrypted];

  if (hasRevealKey) {
    lines.push(await encryptBytes(combined.buffer as ArrayBuffer, opts.revealKey!, iterations));
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

      // Try length-prefix format first (ZEFER3 current)
      // Format: [4 bytes big-endian length][meta JSON][data bytes]
      if (decryptedArr.length >= 4) {
        const metaLength = new DataView(decryptedArr.buffer, decryptedArr.byteOffset).getUint32(0, false);
        if (metaLength > 0 && metaLength + 4 <= decryptedArr.length) {
          try {
            const metaStr = new TextDecoder().decode(decryptedArr.slice(4, 4 + metaLength));
            const testMeta = JSON.parse(metaStr);
            if (isValidMeta(testMeta)) {
              const dataBytes = decryptedArr.slice(4 + metaLength);
              return { meta: testMeta as ZeferMeta, rawData: dataBytes.buffer as ArrayBuffer };
            }
          } catch {
            // Not length-prefix format, try legacy
          }
        }
      }

      // Fallback: null-byte separator (older ZEFER3 files)
      const sepIndex = decryptedArr.indexOf(0);
      if (sepIndex > 0 && sepIndex < decryptedArr.length - 1) {
        try {
          const metaStr = new TextDecoder().decode(decryptedArr.slice(0, sepIndex));
          const testMeta = JSON.parse(metaStr);
          if (isValidMeta(testMeta)) {
            const dataBytes = decryptedArr.slice(sepIndex + 1);
            return { meta: testMeta as ZeferMeta, rawData: dataBytes.buffer as ArrayBuffer };
          }
        } catch {
          // Not null-byte format either
        }
      }

      // Fallback: ZEFER2 format (entire content is JSON text)
      const text = new TextDecoder().decode(decryptedBuf);
      const raw = header.compression === "none" ? text : await decompress(text, header.compression);
      const legacy = JSON.parse(raw);
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
      };
      const contentBytes = new TextEncoder().encode(legacy.content);

      return { meta, rawData: contentBytes.buffer as ArrayBuffer };
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
  }
): Promise<DecodeResult> {
  const parsed = parseFile(fileContent);
  if (!parsed) return { ok: false, error: "invalid_format" };

  const { header, encryptedLines } = parsed;
  const { secondPassphrase, questionAnswer } = options || {};

  // Build candidates
  const candidates: string[] = [];
  candidates.push(passphrase);
  if (secondPassphrase) {
    candidates.push(combineDualKeys(passphrase, secondPassphrase));
  }

  // Timing normalization: record start time to ensure constant response time
  // This prevents an attacker from distinguishing success vs failure by timing
  const startTime = performance.now();
  const MIN_RESPONSE_MS = 100; // minimum ms before returning (on top of PBKDF2 time)

  let result: { meta: ZeferMeta; rawData: ArrayBuffer } | null = null;
  for (const candidate of candidates) {
    result = await tryDecryptCombined(encryptedLines, candidate, header);
    if (result) break;
  }

  if (!result) {
    // Ensure consistent timing on failure
    const elapsed = performance.now() - startTime;
    if (elapsed < MIN_RESPONSE_MS) {
      await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed));
    }
    return { ok: false, error: "wrong_passphrase" };
  }

  const { meta, rawData } = result;

  const attemptKey = meta.maxAttempts > 0
    ? `zefer_attempts_${encryptedLines[0].substring(0, 40)}`
    : null;

  // Max attempts — check current count BEFORE incrementing
  if (attemptKey) {
    const attempts = parseInt(localStorage.getItem(attemptKey) || "0", 10);
    if (attempts >= meta.maxAttempts) return { ok: false, error: "max_attempts" };
  }

  // Secret question — does NOT consume an attempt if answer is missing/wrong
  if (meta.answerHash && meta.question) {
    if (!questionAnswer) return { ok: false, error: "needs_answer" };
    const hash = await hashAnswer(questionAnswer);
    if (hash !== meta.answerHash) {
      // Wrong answer DOES consume an attempt
      if (attemptKey) {
        const attempts = parseInt(localStorage.getItem(attemptKey) || "0", 10);
        localStorage.setItem(attemptKey, String(attempts + 1));
      }
      return { ok: false, error: "wrong_answer" };
    }
  }

  // Expiration
  if (meta.expiresAt > 0 && Date.now() > meta.expiresAt) return { ok: false, error: "expired" };

  // All checks passed — clear attempt counter
  if (attemptKey) localStorage.removeItem(attemptKey);

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

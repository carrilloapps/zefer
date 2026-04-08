import { decryptFromBase64, combineDualKeys, hashAnswer } from "./crypto";
import { chunkedEncrypt, chunkedDecryptToBuffer, CHUNK_SIZE } from "./chunked-crypto";
import { compressBytes, decompressBytes, type CompressionMethod } from "./compression";

const MAGIC_TEXT = "ZEFER3";
const MAGIC_BIN = new Uint8Array([0x5A, 0x45, 0x46, 0x42, 0x33]); // "ZEFB3" — binary format
const MAGIC_BIN_REVEAL = new Uint8Array([0x5A, 0x45, 0x46, 0x52, 0x33]); // "ZEFR3" — binary with reveal key

// ─── Public header ───

export interface ZeferHeader {
  iterations: number;
  compression: CompressionMethod;
  hint: string | null;
  note: string | null;
  mode: "text" | "file";
}

// ─── Encrypted metadata ───

export interface ZeferMeta {
  v: 3;
  fileName: string | null;
  fileType: string | null;
  fileSize: number;
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
  content: string | null;
  fileData: ArrayBuffer | null;
}

// ─── Encode options ───

export interface EncodeOptions {
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
  onProgress?: {
    compressing: (percent: number) => void;
    compressingDone: () => void;
    deriving: () => void;
    derivingDone: () => void;
    encrypting: (chunkIndex: number, totalChunks: number) => void;
    packaging: () => void;
  };
}

// ─── Encode ───

export async function encodeZefer(opts: EncodeOptions): Promise<Blob> {
  const iterations = opts.iterations || 600_000;
  const compressionMethod = opts.compression || "none";
  const dualKey = opts.dualKey || false;
  const hasRevealKey = !!opts.revealKey?.trim();
  const isFile = !!opts.fileData;

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

  // Compress ALL content if compression is enabled — no exceptions
  opts.onProgress?.compressing(0);
  let dataToEncrypt: ArrayBuffer;
  if (compressionMethod !== "none") {
    const compressed = await compressBytes(new Uint8Array(rawData), compressionMethod);
    dataToEncrypt = compressed.buffer as ArrayBuffer;
  } else {
    dataToEncrypt = rawData;
  }
  opts.onProgress?.compressingDone();

  // Pack: 4-byte length prefix + meta JSON + data bytes
  const metaBytes = new TextEncoder().encode(JSON.stringify(meta));
  const lengthPrefix = new Uint8Array(4);
  new DataView(lengthPrefix.buffer).setUint32(0, metaBytes.length, false);
  const combined = new Uint8Array(4 + metaBytes.length + dataToEncrypt.byteLength);
  combined.set(lengthPrefix, 0);
  combined.set(metaBytes, 4);
  combined.set(new Uint8Array(dataToEncrypt), 4 + metaBytes.length);

  const mainPassphrase = dualKey && opts.secondPassphrase
    ? combineDualKeys(opts.passphrase, opts.secondPassphrase)
    : opts.passphrase;

  const headerJson = JSON.stringify(header);

  // All modes use binary chunked format (ZEFB3 / ZEFR3)
  const estimatedChunks = Math.ceil(combined.byteLength / CHUNK_SIZE);
  const grandTotal = estimatedChunks * (hasRevealKey ? 2 : 1);

  opts.onProgress?.deriving();
  const result = await chunkedEncrypt(
    combined.buffer as ArrayBuffer,
    mainPassphrase,
    iterations,
    (chunkIndex, totalChunks) => {
      if (chunkIndex === 1) opts.onProgress?.derivingDone();
      opts.onProgress?.encrypting(chunkIndex, grandTotal);
    }
  );

  // Encrypt with reveal key if provided (same payload, different passphrase)
  const revealResult = hasRevealKey
    ? await chunkedEncrypt(
        combined.buffer as ArrayBuffer,
        opts.revealKey!.trim(),
        iterations,
        (chunkIndex) => {
          opts.onProgress?.encrypting(estimatedChunks + chunkIndex, grandTotal);
        }
      )
    : null;

  opts.onProgress?.packaging();
  const headerBytesEnc = new TextEncoder().encode(headerJson);
  const headerLenBuf = new Uint8Array(4);
  new DataView(headerLenBuf.buffer).setUint32(0, headerBytesEnc.length, false);

  const magic = revealResult ? MAGIC_BIN_REVEAL : MAGIC_BIN;
  const parts: BlobPart[] = [
    magic.buffer as ArrayBuffer,
    headerLenBuf.buffer as ArrayBuffer,
    headerBytesEnc.buffer as ArrayBuffer,
  ];

  if (revealResult) {
    // Dual-block format: [mainBlockSize][mainBlock][revealBlock]
    let mainBlockSize = 32 + 12; // salt + baseIv
    for (const chunk of result.chunks) mainBlockSize += chunk.byteLength;

    const mainBlockSizeBuf = new Uint8Array(4);
    new DataView(mainBlockSizeBuf.buffer).setUint32(0, mainBlockSize, false);
    parts.push(mainBlockSizeBuf.buffer as ArrayBuffer);

    parts.push(result.salt.buffer as ArrayBuffer);
    parts.push(result.baseIv.buffer as ArrayBuffer);
    for (const chunk of result.chunks) parts.push(chunk.buffer as ArrayBuffer);

    parts.push(revealResult.salt.buffer as ArrayBuffer);
    parts.push(revealResult.baseIv.buffer as ArrayBuffer);
    for (const chunk of revealResult.chunks) parts.push(chunk.buffer as ArrayBuffer);
  } else {
    // Single-block format (original)
    parts.push(result.salt.buffer as ArrayBuffer);
    parts.push(result.baseIv.buffer as ArrayBuffer);
    for (const chunk of result.chunks) parts.push(chunk.buffer as ArrayBuffer);
  }

  return new Blob(parts, { type: "application/octet-stream" });
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
  binary: boolean;
  // Text format fields
  encryptedLines?: string[];
  // Binary format fields
  binaryData?: Uint8Array;
  revealBinaryData?: Uint8Array;
}

export function parseFile(fileContent: string, rawBytes?: ArrayBuffer): ParsedFile | null {
  // Check for binary format first
  if (rawBytes && rawBytes.byteLength >= 5) {
    const magic = new Uint8Array(rawBytes, 0, 5);
    const isBinary = magic[0] === 0x5A && magic[1] === 0x45 && magic[2] === 0x46 && magic[4] === 0x33;
    const isRevealFormat = magic[3] === 0x52; // 'R' in ZEFR3
    if (isBinary && (magic[3] === 0x42 || isRevealFormat)) {
      // ZEFB3 / ZEFR3 binary format
      const view = new DataView(rawBytes, 5);
      const headerLen = view.getUint32(0, false);
      const headerStr = new TextDecoder().decode(new Uint8Array(rawBytes, 9, headerLen));
      try {
        const header = JSON.parse(headerStr) as ZeferHeader;
        if (!header.mode) header.mode = "file";
        const dataOffset = 9 + headerLen;
        if (isRevealFormat) {
          const mainBlockSize = new DataView(rawBytes, dataOffset).getUint32(0, false);
          const mainStart = dataOffset + 4;
          return {
            header,
            binary: true,
            binaryData: new Uint8Array(rawBytes, mainStart, mainBlockSize),
            revealBinaryData: new Uint8Array(rawBytes, mainStart + mainBlockSize),
          };
        }
        return {
          header,
          binary: true,
          binaryData: new Uint8Array(rawBytes, dataOffset),
        };
      } catch {
        return null;
      }
    }
  }

  // Text format
  const lines = fileContent.trim().split("\n");
  if (lines.length < 3) return null;
  if (lines[0] !== MAGIC_TEXT && lines[0] !== "ZEFER2") return null;

  try {
    const header = JSON.parse(lines[1]) as ZeferHeader;
    if (!header.mode) header.mode = "text";
    return { header, binary: false, encryptedLines: lines.slice(2) };
  } catch {
    return null;
  }
}

async function tryDecryptText(
  encryptedLines: string[],
  passphrase: string,
  header: ZeferHeader
): Promise<{ meta: ZeferMeta; rawData: ArrayBuffer } | null> {
  for (const line of encryptedLines) {
    try {
      const decryptedBuf = await decryptFromBase64(line, passphrase, header.iterations);
      return extractPayload(new Uint8Array(decryptedBuf), header);
    } catch {
      continue;
    }
  }
  return null;
}

async function tryDecryptBinary(
  data: Uint8Array,
  passphrase: string,
  header: ZeferHeader,
  onChunkProgress?: (chunkIndex: number, totalChunks: number) => void
): Promise<{ meta: ZeferMeta; rawData: ArrayBuffer } | null> {
  if (data.length < 44) return null;
  const salt = data.slice(0, 32);
  const baseIv = data.slice(32, 44);
  const encryptedChunks = data.slice(44);

  try {
    const decryptedBuf = await chunkedDecryptToBuffer(encryptedChunks, salt, baseIv, passphrase, header.iterations, onChunkProgress);
    return await extractPayload(new Uint8Array(decryptedBuf), header);
  } catch {
    return null;
  }
}

async function extractPayload(
  decryptedArr: Uint8Array,
  header: ZeferHeader
): Promise<{ meta: ZeferMeta; rawData: ArrayBuffer } | null> {
  // Try length-prefix format (ZEFER3 current)
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
      } catch { /* try next */ }
    }
  }

  // Fallback: null-byte separator (older files)
  const sepIndex = decryptedArr.indexOf(0);
  if (sepIndex > 0 && sepIndex < decryptedArr.length - 1) {
    try {
      const metaStr = new TextDecoder().decode(decryptedArr.slice(0, sepIndex));
      const testMeta = JSON.parse(metaStr);
      if (isValidMeta(testMeta)) {
        const dataBytes = decryptedArr.slice(sepIndex + 1);
        return { meta: testMeta as ZeferMeta, rawData: dataBytes.buffer as ArrayBuffer };
      }
    } catch { /* try next */ }
  }

  // Fallback: ZEFER2 format (compression not supported — decodeZefer handles it separately)
  try {
    const text = new TextDecoder().decode(decryptedArr);
    const legacy = JSON.parse(text);
    const meta: ZeferMeta = {
      v: 3, fileName: legacy.fileName, fileType: null, fileSize: 0,
      expiresAt: legacy.expiresAt, createdAt: legacy.createdAt,
      answerHash: legacy.answerHash, allowedIps: legacy.allowedIps || [],
      question: legacy.question || null, maxAttempts: legacy.maxAttempts || 0,
    };
    const contentBytes = new TextEncoder().encode(legacy.content);
    return { meta, rawData: contentBytes.buffer as ArrayBuffer };
  } catch {
    return null;
  }
}

export async function decodeZefer(
  fileContent: string,
  passphrase: string,
  options?: {
    secondPassphrase?: string;
    questionAnswer?: string;
    rawBytes?: ArrayBuffer;
    onProgress?: {
      deriving: () => void;
      derivingDone: () => void;
      decrypting: (chunkIndex: number, totalChunks: number) => void;
      decompressing: () => void;
      verifying: () => void;
    };
  }
): Promise<DecodeResult> {
  const parsed = parseFile(fileContent, options?.rawBytes);
  if (!parsed) return { ok: false, error: "invalid_format" };

  const { header } = parsed;
  const { secondPassphrase, questionAnswer } = options || {};

  const candidates: string[] = [];
  candidates.push(passphrase);
  if (secondPassphrase) {
    candidates.push(combineDualKeys(passphrase, secondPassphrase));
  }

  const startTime = performance.now();
  const MIN_RESPONSE_MS = 100;

  let result: { meta: ZeferMeta; rawData: ArrayBuffer } | null = null;

  options?.onProgress?.deriving();

  for (const candidate of candidates) {
    if (parsed.binary && parsed.binaryData) {
      result = await tryDecryptBinary(parsed.binaryData, candidate, header, (ci, tc) => {
        if (ci === 1) options?.onProgress?.derivingDone();
        options?.onProgress?.decrypting(ci, tc);
      });
      if (!result && parsed.revealBinaryData) {
        result = await tryDecryptBinary(parsed.revealBinaryData, candidate, header, (ci, tc) => {
          if (ci === 1) options?.onProgress?.derivingDone();
          options?.onProgress?.decrypting(ci, tc);
        });
      }
    } else if (parsed.encryptedLines) {
      result = await tryDecryptText(parsed.encryptedLines, candidate, header);
      if (result) options?.onProgress?.derivingDone();
    }
    if (result) break;
  }

  if (!result) {
    const elapsed = performance.now() - startTime;
    if (elapsed < MIN_RESPONSE_MS) await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed));
    return { ok: false, error: "wrong_passphrase" };
  }

  const { meta, rawData } = result;

  const attemptKey = meta.maxAttempts > 0
    ? `zefer_attempts_${(parsed.encryptedLines?.[0] || "bin").substring(0, 40)}`
    : null;

  if (attemptKey) {
    const attempts = parseInt(localStorage.getItem(attemptKey) || "0", 10);
    if (attempts >= meta.maxAttempts) return { ok: false, error: "max_attempts" };
  }

  if (meta.answerHash && meta.question) {
    if (!questionAnswer) return { ok: false, error: "needs_answer" };
    const hash = await hashAnswer(questionAnswer);
    if (hash !== meta.answerHash) {
      if (attemptKey) {
        const attempts = parseInt(localStorage.getItem(attemptKey) || "0", 10);
        localStorage.setItem(attemptKey, String(attempts + 1));
      }
      return { ok: false, error: "wrong_answer" };
    }
  }

  if (meta.expiresAt > 0 && Date.now() > meta.expiresAt) return { ok: false, error: "expired" };

  if (attemptKey) localStorage.removeItem(attemptKey);

  // Decompress if compression was applied
  options?.onProgress?.decompressing();
  let finalData: ArrayBuffer;
  if (header.compression !== "none") {
    const decompressed = await decompressBytes(new Uint8Array(rawData), header.compression);
    finalData = decompressed.buffer as ArrayBuffer;
  } else {
    finalData = rawData;
  }

  let content: string | null = null;
  let fileData: ArrayBuffer | null = null;

  if (header.mode === "file") {
    fileData = finalData;
  } else {
    content = new TextDecoder().decode(finalData);
  }

  return { ok: true, payload: { meta, content, fileData }, header };
}

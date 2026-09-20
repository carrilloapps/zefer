import { decryptFromBase64, combineDualKeys, hashAnswer } from "./crypto";
import { chunkedEncryptBlob, chunkedDecryptToBuffer, chunkedDecryptBlob, CHUNK_SIZE, type ChunkedEncryptResult } from "./chunked-crypto";
import { compressBlob, decompressBytes, decompressBlob, type CompressionMethod } from "./compression";

const MAGIC_TEXT = "ZEFER3";
const MAGIC_BIN = new Uint8Array([0x5A, 0x45, 0x46, 0x42, 0x33]); // "ZEFB3" — binary format
const MAGIC_BIN_REVEAL = new Uint8Array([0x5A, 0x45, 0x46, 0x52, 0x33]); // "ZEFR3" — binary with reveal key

// Wire layout of one encrypted block, before the framed chunks start.
const SALT_BYTES = 32;
const IV_BYTES = 12;
const BLOCK_PREFIX_BYTES = SALT_BYTES + IV_BYTES;
// magic (5) + header length (4)
const HEADER_OFFSET = 9;

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
  // ArrayBuffer for the in-memory path; Blob for the streaming large-file path.
  // Both are valid BlobParts, so consumers wrap them the same way.
  fileData: ArrayBuffer | Blob | null;
}

// ─── Encode options ───

export interface EncodeOptions {
  content?: string;
  fileData?: ArrayBuffer;
  /** Large-file path: stream the file from disk in slices instead of holding
   *  it in memory as an ArrayBuffer. Takes precedence over fileData. */
  fileBlob?: Blob;
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

/** Public-header text: trimmed, emptied to null, stripped of markup characters. */
function sanitizeHeaderText(s: string | undefined): string | null {
  const v = s?.trim();
  if (!v) return null;
  return v.replace(/[<>"'&]/g, "");
}

function buildHeader(opts: EncodeOptions, isFile: boolean): ZeferHeader {
  return {
    iterations: opts.iterations || 600_000,
    compression: opts.compression || "none",
    hint: sanitizeHeaderText(opts.hint),
    note: sanitizeHeaderText(opts.note),
    mode: isFile ? "file" : "text",
  };
}

function buildMeta(opts: EncodeOptions, fileSize: number, answerHash: string | null): ZeferMeta {
  return {
    v: 3,
    fileName: opts.fileName,
    fileType: opts.fileType || null,
    fileSize,
    expiresAt: opts.expiresAt,
    createdAt: Date.now(),
    answerHash,
    allowedIps: opts.allowedIps || [],
    question: opts.question?.trim() || null,
    maxAttempts: opts.maxAttempts || 0,
  };
}

/**
 * Content as a Blob so large files stream from disk and are never held in a
 * single contiguous buffer (the ~2 GB per-ArrayBuffer cap). fileBlob wins;
 * fileData (in-memory ArrayBuffer) and text are wrapped cheaply by reference.
 */
function contentBlob(opts: EncodeOptions): Blob {
  if (opts.fileBlob) return opts.fileBlob;
  if (opts.fileData) return new Blob([opts.fileData]);
  return new Blob([new TextEncoder().encode(opts.content || "")]);
}

/**
 * Pack: 4-byte length prefix + meta JSON + data bytes. The prefix and meta
 * are tiny; the (large) content stays a Blob — new Blob() composes by
 * reference, so nothing is copied into one buffer.
 */
function packPayload(meta: ZeferMeta, data: Blob): Blob {
  const metaBytes = new TextEncoder().encode(JSON.stringify(meta));
  const lengthPrefix = new Uint8Array(4);
  new DataView(lengthPrefix.buffer).setUint32(0, metaBytes.length, false);
  return new Blob([lengthPrefix, metaBytes, data]);
}

/** One encrypted block on the wire: salt (32B) + baseIv (12B) + framed chunks. */
function blockParts(block: ChunkedEncryptResult): BlobPart[] {
  return [
    block.salt.buffer as ArrayBuffer,
    block.baseIv.buffer as ArrayBuffer,
    ...block.chunks.map((chunk) => chunk.buffer as ArrayBuffer),
  ];
}

function blockSize(block: ChunkedEncryptResult): number {
  return SALT_BYTES + IV_BYTES + block.chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
}

/** Assemble the final ZEFB3 (single block) or ZEFR3 (main + reveal) file. */
function packageZefer(
  headerJson: string,
  main: ChunkedEncryptResult,
  reveal: ChunkedEncryptResult | null
): Blob {
  const headerBytes = new TextEncoder().encode(headerJson);
  const headerLenBuf = new Uint8Array(4);
  new DataView(headerLenBuf.buffer).setUint32(0, headerBytes.length, false);

  const magic = reveal ? MAGIC_BIN_REVEAL : MAGIC_BIN;
  const parts: BlobPart[] = [
    magic.buffer as ArrayBuffer,
    headerLenBuf.buffer as ArrayBuffer,
    headerBytes.buffer as ArrayBuffer,
  ];

  if (reveal) {
    // Dual-block format: [mainBlockSize][mainBlock][revealBlock]
    const mainBlockSizeBuf = new Uint8Array(4);
    new DataView(mainBlockSizeBuf.buffer).setUint32(0, blockSize(main), false);
    parts.push(mainBlockSizeBuf.buffer as ArrayBuffer, ...blockParts(main), ...blockParts(reveal));
  } else {
    // Single-block format (original)
    parts.push(...blockParts(main));
  }

  return new Blob(parts, { type: "application/octet-stream" });
}

export async function encodeZefer(opts: EncodeOptions): Promise<Blob> {
  const isFile = !!opts.fileBlob || !!opts.fileData;
  const header = buildHeader(opts, isFile);
  const hasRevealKey = !!opts.revealKey?.trim();

  const answerHash = opts.question && opts.questionAnswer
    ? await hashAnswer(opts.questionAnswer)
    : null;

  const rawContent = contentBlob(opts);
  const meta = buildMeta(opts, rawContent.size, answerHash);

  // Compress ALL content if compression is enabled — no exceptions.
  // Streams through CompressionStream into a (possibly disk-backed) Blob.
  opts.onProgress?.compressing(0);
  const dataToEncrypt = header.compression !== "none"
    ? await compressBlob(rawContent, header.compression)
    : rawContent;
  opts.onProgress?.compressingDone();

  const combined = packPayload(meta, dataToEncrypt);

  const mainPassphrase = opts.dualKey && opts.secondPassphrase
    ? combineDualKeys(opts.passphrase, opts.secondPassphrase)
    : opts.passphrase;

  // All modes use binary chunked format (ZEFB3 / ZEFR3)
  const estimatedChunks = Math.ceil(combined.size / CHUNK_SIZE);
  const grandTotal = estimatedChunks * (hasRevealKey ? 2 : 1);

  opts.onProgress?.deriving();
  const result = await chunkedEncryptBlob(
    combined,
    mainPassphrase,
    header.iterations,
    (chunkIndex) => {
      if (chunkIndex === 1) opts.onProgress?.derivingDone();
      opts.onProgress?.encrypting(chunkIndex, grandTotal);
    }
  );

  // Encrypt with reveal key if provided (same payload, different passphrase)
  const revealResult = hasRevealKey
    ? await chunkedEncryptBlob(
        combined,
        opts.revealKey!.trim(),
        header.iterations,
        (chunkIndex) => {
          opts.onProgress?.encrypting(estimatedChunks + chunkIndex, grandTotal);
        }
      )
    : null;

  opts.onProgress?.packaging();
  return packageZefer(JSON.stringify(header), result, revealResult);
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
  /** Legacy text format: base64 lines. Always `[]` for binary containers. */
  encryptedLines: string[];
  // Binary format fields
  binaryData?: Uint8Array;
  revealBinaryData?: Uint8Array;
}

/** True for the 5-byte "ZEFB3"/"ZEFR3" magic of the binary formats. */
function isBinaryMagic(magic: Uint8Array): boolean {
  const zef = magic[0] === 0x5a && magic[1] === 0x45 && magic[2] === 0x46 && magic[4] === 0x33;
  return zef && (magic[3] === 0x42 || magic[3] === 0x52); // 'B' in ZEFB3, 'R' in ZEFR3
}

/** ZEFB3 / ZEFR3 binary format, already known to carry the right magic. */
function parseBinaryFile(rawBytes: ArrayBuffer): ParsedFile | null {
  const isRevealFormat = new Uint8Array(rawBytes, 3, 1)[0] === 0x52; // 'R' in ZEFR3
  const headerLen = new DataView(rawBytes, 5).getUint32(0, false);
  const headerStr = new TextDecoder().decode(new Uint8Array(rawBytes, HEADER_OFFSET, headerLen));
  try {
    const header = JSON.parse(headerStr) as ZeferHeader;
    if (!header.mode) header.mode = "file";
    const dataOffset = HEADER_OFFSET + headerLen;
    if (!isRevealFormat) {
      return { header, binary: true, encryptedLines: [], binaryData: new Uint8Array(rawBytes, dataOffset) };
    }
    const mainBlockSize = new DataView(rawBytes, dataOffset).getUint32(0, false);
    const mainStart = dataOffset + 4;
    return {
      header,
      binary: true,
      encryptedLines: [],
      binaryData: new Uint8Array(rawBytes, mainStart, mainBlockSize),
      revealBinaryData: new Uint8Array(rawBytes, mainStart + mainBlockSize),
    };
  } catch {
    return null;
  }
}

/** Legacy ZEFER3 / ZEFER2 line format. */
function parseTextFile(fileContent: string): ParsedFile | null {
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

export function parseFile(fileContent: string, rawBytes?: ArrayBuffer): ParsedFile | null {
  // Check for binary format first
  if (rawBytes && rawBytes.byteLength >= 5 && isBinaryMagic(new Uint8Array(rawBytes, 0, 5))) {
    return parseBinaryFile(rawBytes);
  }
  return parseTextFile(fileContent);
}

type BufferPayload = { meta: ZeferMeta; rawData: ArrayBuffer };
type AnyPayload = { meta: ZeferMeta; rawData: ArrayBuffer | Blob };
type ChunkProgress = (chunkIndex: number, totalChunks: number) => void;

async function tryDecryptText(
  encryptedLines: string[],
  passphrase: string,
  header: ZeferHeader
): Promise<BufferPayload | null> {
  for (const line of encryptedLines) {
    try {
      const decryptedBuf = await decryptFromBase64(line, passphrase, header.iterations);
      return extractPayload(new Uint8Array(decryptedBuf));
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
  onChunkProgress?: ChunkProgress
): Promise<BufferPayload | null> {
  if (data.length < BLOCK_PREFIX_BYTES) return null;
  const salt = data.slice(0, SALT_BYTES);
  const baseIv = data.slice(SALT_BYTES, BLOCK_PREFIX_BYTES);
  const encryptedChunks = data.slice(BLOCK_PREFIX_BYTES);

  try {
    const decryptedBuf = await chunkedDecryptToBuffer(encryptedChunks, salt, baseIv, passphrase, header.iterations, onChunkProgress);
    return extractPayload(new Uint8Array(decryptedBuf));
  } catch {
    return null;
  }
}

/**
 * Decrypted bytes are attacker-influenced, so every payload form has to survive
 * malformed JSON. One total parser keeps that failure in a single place.
 */
function parseJsonOrNull(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Length-prefix payload form (ZEFB3/ZEFR3/ZEFER3 current). */
function readLengthPrefixed(decryptedArr: Uint8Array): BufferPayload | null {
  if (decryptedArr.length < 4) return null;
  const metaLength = new DataView(decryptedArr.buffer, decryptedArr.byteOffset).getUint32(0, false);
  if (metaLength <= 0 || metaLength + 4 > decryptedArr.length) return null;

  const meta = parseJsonOrNull(new TextDecoder().decode(decryptedArr.slice(4, 4 + metaLength)));
  if (!isValidMeta(meta)) return null;
  return { meta, rawData: decryptedArr.slice(4 + metaLength).buffer as ArrayBuffer };
}

/** Null-byte separator payload form (older files). */
function readNullSeparated(decryptedArr: Uint8Array): BufferPayload | null {
  const sepIndex = decryptedArr.indexOf(0);
  if (sepIndex <= 0 || sepIndex >= decryptedArr.length - 1) return null;

  const meta = parseJsonOrNull(new TextDecoder().decode(decryptedArr.slice(0, sepIndex)));
  if (!isValidMeta(meta)) return null;
  return { meta, rawData: decryptedArr.slice(sepIndex + 1).buffer as ArrayBuffer };
}

interface LegacyZefer2 {
  fileName: string | null;
  expiresAt: number;
  createdAt: number;
  answerHash: string | null;
  allowedIps?: string[];
  question?: string | null;
  maxAttempts?: number;
  content: string;
}

/** ZEFER2 form: the whole plaintext is one JSON document. */
function readLegacyJson(decryptedArr: Uint8Array): BufferPayload | null {
  const legacy = parseJsonOrNull(new TextDecoder().decode(decryptedArr)) as LegacyZefer2 | null;
  if (!legacy) return null;

  const meta: ZeferMeta = {
    v: 3, fileName: legacy.fileName, fileType: null, fileSize: 0,
    expiresAt: legacy.expiresAt, createdAt: legacy.createdAt,
    answerHash: legacy.answerHash, allowedIps: legacy.allowedIps || [],
    question: legacy.question || null, maxAttempts: legacy.maxAttempts || 0,
  };
  const contentBytes = new TextEncoder().encode(legacy.content);
  return { meta, rawData: contentBytes.buffer as ArrayBuffer };
}

/** Try each payload form, newest first, and take the first that validates. */
function extractPayload(decryptedArr: Uint8Array): BufferPayload | null {
  return readLengthPrefixed(decryptedArr)
    ?? readNullSeparated(decryptedArr)
    ?? readLegacyJson(decryptedArr);
}

export async function decodeZefer(
  fileContent: string,
  passphrase: string,
  options?: {
    secondPassphrase?: string;
    questionAnswer?: string;
    rawBytes?: ArrayBuffer;
    /** Large-file path: the .zefer File/Blob, read in slices instead of loaded
     *  whole. Takes precedence over rawBytes for binary (ZEFB3/ZEFR3) files. */
    fileBlob?: Blob;
    onProgress?: {
      deriving: () => void;
      derivingDone: () => void;
      decrypting: (chunkIndex: number, totalChunks: number) => void;
      decompressing: () => void;
      verifying: () => void;
    };
  }
): Promise<DecodeResult> {
  const source = await resolveSource(fileContent, options);
  if (!source) return { ok: false, error: "invalid_format" };
  const header = source.header;

  const candidates = options?.secondPassphrase
    ? [passphrase, combineDualKeys(passphrase, options.secondPassphrase)]
    : [passphrase];

  const startTime = performance.now();

  options?.onProgress?.deriving();
  const progress: ChunkProgress = (ci, tc) => {
    if (ci === 1) options?.onProgress?.derivingDone();
    options?.onProgress?.decrypting(ci, tc);
  };
  const derivingDone = () => options?.onProgress?.derivingDone();

  let result: AnyPayload | null = null;
  for (const candidate of candidates) {
    result = await decryptWithCandidate(source, candidate, progress, derivingDone);
    if (result) break;
  }
  if (!result) return wrongPassphrase(startTime);

  const { meta, rawData } = result;

  const attemptKey = attemptKeyFor(meta, source.parsed);
  const policyError = await checkPolicies(meta, attemptKey, options?.questionAnswer);
  if (policyError) return { ok: false, error: policyError };

  // Decompress if compression was applied (streaming Blob or in-memory buffer).
  options?.onProgress?.decompressing();
  const payload = await finalizeContent(header, meta, rawData);

  return { ok: true, payload: { meta, ...payload }, header };
}

// ─── decodeZefer helpers ───

interface DecodeSource {
  header: ZeferHeader;
  /** Streaming path: regions of a binary (ZEFB3/ZEFR3) File/Blob, read in slices. */
  streaming: { mainRegion: Blob; revealRegion: Blob | null } | null;
  /** In-memory path: rawBytes/text string (legacy + tests + small files). */
  parsed: ParsedFile | null;
}

/**
 * Pick the decryption strategy. The streaming path only applies to binary
 * (ZEFB3/ZEFR3) blobs; anything else (legacy text, no blob) falls back to the
 * in-memory parseFile path with fileContent.
 */
async function resolveSource(
  fileContent: string,
  options?: { rawBytes?: ArrayBuffer; fileBlob?: Blob }
): Promise<DecodeSource | null> {
  if (options?.fileBlob) {
    const streaming = await parseBinaryHeaderBlob(options.fileBlob);
    if (streaming) {
      return {
        header: streaming.header,
        streaming: { mainRegion: streaming.mainRegion, revealRegion: streaming.revealRegion },
        parsed: null,
      };
    }
  }
  const parsed = parseFile(fileContent, options?.rawBytes);
  return parsed ? { header: parsed.header, streaming: null, parsed } : null;
}

/** Main block first, then the reveal block if the file carries one. */
async function decryptRegions(
  main: Blob,
  reveal: Blob | null,
  candidate: string,
  header: ZeferHeader,
  progress: ChunkProgress
): Promise<AnyPayload | null> {
  const fromMain = await tryDecryptBinaryBlob(main, candidate, header, progress);
  if (fromMain || !reveal) return fromMain;
  return tryDecryptBinaryBlob(reveal, candidate, header, progress);
}

async function decryptBlocks(
  main: Uint8Array,
  reveal: Uint8Array | undefined,
  candidate: string,
  header: ZeferHeader,
  progress: ChunkProgress
): Promise<AnyPayload | null> {
  const fromMain = await tryDecryptBinary(main, candidate, header, progress);
  if (fromMain || !reveal) return fromMain;
  return tryDecryptBinary(reveal, candidate, header, progress);
}

async function decryptWithCandidate(
  source: DecodeSource,
  candidate: string,
  progress: ChunkProgress,
  onTextDecrypted: () => void
): Promise<AnyPayload | null> {
  if (source.streaming) {
    const { mainRegion, revealRegion } = source.streaming;
    return decryptRegions(mainRegion, revealRegion, candidate, source.header, progress);
  }

  const parsed = source.parsed!;
  if (parsed.binary) {
    return decryptBlocks(parsed.binaryData!, parsed.revealBinaryData, candidate, source.header, progress);
  }
  const result = await tryDecryptText(parsed.encryptedLines, candidate, source.header);
  if (result) onTextDecrypted();
  return result;
}

const MIN_RESPONSE_MS = 100;

/**
 * Pad every failed attempt to a constant floor so response time does not leak
 * how far the decryption got.
 */
async function wrongPassphrase(startTime: number): Promise<DecodeResult> {
  const elapsed = performance.now() - startTime;
  if (elapsed < MIN_RESPONSE_MS) await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed));
  return { ok: false, error: "wrong_passphrase" };
}

function attemptKeyFor(meta: ZeferMeta, parsed: ParsedFile | null): string | null {
  if (meta.maxAttempts <= 0) return null;
  return `zefer_attempts_${(parsed?.encryptedLines[0] || "bin").substring(0, 40)}`;
}

/** Decompress if needed, then shape the plaintext as text or file data. */
async function finalizeContent(
  header: ZeferHeader,
  meta: ZeferMeta,
  rawData: ArrayBuffer | Blob
): Promise<{ content: string | null; fileData: ArrayBuffer | Blob | null }> {
  if (rawData instanceof Blob) {
    // Cap decompression at the authenticated original size (+1 KB margin) to
    // reject decompression bombs; meta.fileSize lives inside the AES-GCM payload.
    const finalBlob = header.compression !== "none"
      ? await decompressBlob(rawData, header.compression, meta.fileSize + 1024)
      : rawData;
    return header.mode === "file"
      ? { content: null, fileData: finalBlob }
      : { content: await finalBlob.text(), fileData: null };
  }

  const finalData = header.compression !== "none"
    ? (await decompressBytes(new Uint8Array(rawData), header.compression)).buffer as ArrayBuffer
    : rawData;
  return header.mode === "file"
    ? { content: null, fileData: finalData }
    : { content: new TextDecoder().decode(finalData), fileData: null };
}

// ─── Shared post-decrypt policy checks (used by both paths) ───

function readAttempts(attemptKey: string): number {
  return Number.parseInt(localStorage.getItem(attemptKey) || "0", 10);
}

async function checkPolicies(
  meta: ZeferMeta,
  attemptKey: string | null,
  questionAnswer: string | undefined
): Promise<DecodeError | null> {
  if (attemptKey) {
    if (readAttempts(attemptKey) >= meta.maxAttempts) return "max_attempts";
  }

  if (meta.answerHash && meta.question) {
    if (!questionAnswer) return "needs_answer";
    const hash = await hashAnswer(questionAnswer);
    if (hash !== meta.answerHash) {
      if (attemptKey) {
        localStorage.setItem(attemptKey, String(readAttempts(attemptKey) + 1));
      }
      return "wrong_answer";
    }
  }

  if (meta.expiresAt > 0 && Date.now() > meta.expiresAt) return "expired";

  if (attemptKey) localStorage.removeItem(attemptKey);
  return null;
}

// ─── Streaming binary decode helpers (large-file path) ───

async function parseBinaryHeaderBlob(
  file: Blob
): Promise<{ header: ZeferHeader; mainRegion: Blob; revealRegion: Blob | null } | null> {
  if (file.size < HEADER_OFFSET) return null;
  const head = new Uint8Array(await file.slice(0, HEADER_OFFSET).arrayBuffer());
  if (!isBinaryMagic(head)) return null;
  const isReveal = head[3] === 0x52; // 'R' in ZEFR3

  const headerLen = new DataView(head.buffer, head.byteOffset + 5).getUint32(0, false);
  try {
    const headerStr = new TextDecoder().decode(await file.slice(HEADER_OFFSET, HEADER_OFFSET + headerLen).arrayBuffer());
    const header = JSON.parse(headerStr) as ZeferHeader;
    if (!header.mode) header.mode = "file";
    const dataOffset = HEADER_OFFSET + headerLen;

    if (isReveal) {
      const mbsBuf = await file.slice(dataOffset, dataOffset + 4).arrayBuffer();
      const mainBlockSize = new DataView(mbsBuf).getUint32(0, false);
      const mainStart = dataOffset + 4;
      return {
        header,
        mainRegion: file.slice(mainStart, mainStart + mainBlockSize),
        revealRegion: file.slice(mainStart + mainBlockSize),
      };
    }
    return { header, mainRegion: file.slice(dataOffset), revealRegion: null };
  } catch {
    return null;
  }
}

async function tryDecryptBinaryBlob(
  region: Blob,
  passphrase: string,
  header: ZeferHeader,
  onProgress?: ChunkProgress
): Promise<{ meta: ZeferMeta; rawData: Blob } | null> {
  if (region.size < BLOCK_PREFIX_BYTES) return null;
  const salt = new Uint8Array(await region.slice(0, SALT_BYTES).arrayBuffer());
  const baseIv = new Uint8Array(await region.slice(SALT_BYTES, BLOCK_PREFIX_BYTES).arrayBuffer());
  const chunks = region.slice(BLOCK_PREFIX_BYTES);
  try {
    const decrypted = await chunkedDecryptBlob(chunks, salt, baseIv, passphrase, header.iterations, onProgress);
    return await extractPayloadBlob(decrypted);
  } catch {
    return null;
  }
}

async function extractPayloadBlob(
  decrypted: Blob
): Promise<{ meta: ZeferMeta; rawData: Blob } | null> {
  // New (ZEFB3/ZEFR3) files always use the 4-byte length-prefix payload form.
  if (decrypted.size < 4) return null;
  const metaLength = new DataView(await decrypted.slice(0, 4).arrayBuffer()).getUint32(0, false);
  if (metaLength > 0 && metaLength + 4 <= decrypted.size) {
    try {
      const metaStr = new TextDecoder().decode(await decrypted.slice(4, 4 + metaLength).arrayBuffer());
      const testMeta = JSON.parse(metaStr);
      if (isValidMeta(testMeta)) {
        return { meta: testMeta as ZeferMeta, rawData: decrypted.slice(4 + metaLength) };
      }
    } catch { /* not this form */ }
  }
  return null;
}

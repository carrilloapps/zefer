/**
 * Chunked encryption/decryption for large files.
 *
 * Splits the input into chunks, encrypts each with AES-256-GCM
 * using a derived key + unique IV per chunk. This keeps memory usage
 * constant regardless of file size.
 *
 * Format per chunk: [4 bytes: chunk ciphertext length][ciphertext + 16 byte auth tag]
 * Each chunk gets its own 12-byte IV derived from the base IV + chunk index.
 */

const SALT_LENGTH = 32;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;
const CHUNK_SIZE = 16 * 1024 * 1024; // 16 MB per chunk

export interface ChunkedEncryptResult {
  salt: Uint8Array;
  baseIv: Uint8Array;
  totalChunks: number;
  chunks: Uint8Array[];
}

async function deriveKey(
  passphrase: string,
  salt: ArrayBuffer,
  iterations: number
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Derive a unique IV for each chunk to avoid nonce reuse.
 * Takes the base IV and XORs the last 4 bytes with the chunk index.
 */
function chunkIv(baseIv: Uint8Array, index: number): Uint8Array {
  const iv = new Uint8Array(baseIv);
  const view = new DataView(iv.buffer, iv.byteOffset);
  view.setUint32(8, view.getUint32(8, false) ^ index, false);
  return iv;
}

/**
 * Encrypt a Blob/File in chunks, reading one 16 MB window at a time via
 * Blob.slice(). The full payload is NEVER materialized in a single buffer, so
 * this works for multi-GB files that would otherwise blow past the browser's
 * per-ArrayBuffer allocation cap (~2 GB). Peak input memory is ~1 chunk.
 *
 * Produces byte-identical output to encrypting the same bytes in one buffer
 * (same chunk boundaries, same per-chunk IV), so files stay cross-compatible
 * with the CLI and decrypt unchanged.
 */
export async function chunkedEncryptBlob(
  source: Blob,
  passphrase: string,
  iterations: number,
  onProgress?: (chunkIndex: number, totalChunks: number) => void
): Promise<ChunkedEncryptResult> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const baseIv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt.buffer as ArrayBuffer, iterations);

  const totalSize = source.size;
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
  const chunks: Uint8Array[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalSize);
    const chunkData = await source.slice(start, end).arrayBuffer();

    const iv = chunkIv(baseIv, i);
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      chunkData
    );

    // Prepend 4-byte length
    const encBytes = new Uint8Array(encrypted);
    const withLen = new Uint8Array(4 + encBytes.length);
    new DataView(withLen.buffer).setUint32(0, encBytes.length, false);
    withLen.set(encBytes, 4);

    chunks.push(withLen);

    onProgress?.(i + 1, totalChunks);

    // Yield to UI thread between chunks
    if (i < totalChunks - 1) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return { salt, baseIv, totalChunks, chunks };
}

/**
 * Encrypt an in-memory ArrayBuffer. Thin wrapper over chunkedEncryptBlob so
 * both paths share one implementation and produce identical output.
 */
export async function chunkedEncrypt(
  data: ArrayBuffer,
  passphrase: string,
  iterations: number,
  onProgress?: (chunkIndex: number, totalChunks: number) => void
): Promise<ChunkedEncryptResult> {
  return chunkedEncryptBlob(new Blob([data]), passphrase, iterations, onProgress);
}

/** Read a big-endian uint32 from a 4-byte window of a Blob. */
async function readU32(source: Blob, offset: number): Promise<number> {
  const buf = await source.slice(offset, offset + 4).arrayBuffer();
  return new DataView(buf).getUint32(0, false);
}

/**
 * Decrypt a chunk-framed region read from a Blob, one chunk at a time via
 * Blob.slice(). The encrypted input is NEVER held in a single buffer, so this
 * decrypts multi-GB files without hitting the per-ArrayBuffer cap. Returns a
 * Blob (browser-managed, disk-backable) so the plaintext is not held in RAM
 * as one allocation either.
 *
 * `encrypted` is the region AFTER salt+baseIv: a sequence of
 * [4-byte length][ciphertext+tag] chunks.
 */
export async function chunkedDecryptBlob(
  encrypted: Blob,
  salt: Uint8Array,
  baseIv: Uint8Array,
  passphrase: string,
  iterations: number,
  onProgress?: (chunkIndex: number, totalChunks: number) => void
): Promise<Blob> {
  const key = await deriveKey(passphrase, salt.buffer as ArrayBuffer, iterations);
  const total = encrypted.size;

  // First pass: count chunks by walking the 4-byte length prefixes.
  let offset = 0;
  let chunkCount = 0;
  while (offset + 4 <= total) {
    const chunkLen = await readU32(encrypted, offset);
    offset += 4 + chunkLen;
    chunkCount++;
  }

  // Second pass: decrypt chunk by chunk, accumulate as Blob parts.
  const blobParts: BlobPart[] = [];
  offset = 0;
  let chunkIndex = 0;
  while (offset + 4 <= total) {
    const chunkLen = await readU32(encrypted, offset);
    offset += 4;
    const chunkCiphertext = await encrypted.slice(offset, offset + chunkLen).arrayBuffer();
    offset += chunkLen;

    const iv = chunkIv(baseIv, chunkIndex);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      chunkCiphertext
    );

    blobParts.push(decrypted);
    chunkIndex++;

    onProgress?.(chunkIndex, chunkCount);

    if (chunkIndex < chunkCount) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return new Blob(blobParts);
}

/**
 * Decrypt an in-memory chunk-framed region. Thin wrapper over
 * chunkedDecryptBlob so both paths share one implementation.
 */
export async function chunkedDecrypt(
  encryptedData: Uint8Array,
  salt: Uint8Array,
  baseIv: Uint8Array,
  passphrase: string,
  iterations: number,
  onProgress?: (chunkIndex: number, totalChunks: number) => void
): Promise<Blob> {
  return chunkedDecryptBlob(
    new Blob([encryptedData.buffer.slice(encryptedData.byteOffset, encryptedData.byteOffset + encryptedData.byteLength) as ArrayBuffer]),
    salt,
    baseIv,
    passphrase,
    iterations,
    onProgress
  );
}

/**
 * Convenience: decrypt and return as ArrayBuffer (for small payloads / metadata extraction).
 * Only use this when you know the result fits in memory.
 */
export async function chunkedDecryptToBuffer(
  encryptedData: Uint8Array,
  salt: Uint8Array,
  baseIv: Uint8Array,
  passphrase: string,
  iterations: number,
  onProgress?: (chunkIndex: number, totalChunks: number) => void
): Promise<ArrayBuffer> {
  const blob = await chunkedDecrypt(encryptedData, salt, baseIv, passphrase, iterations, onProgress);
  return blob.arrayBuffer();
}

export { CHUNK_SIZE };

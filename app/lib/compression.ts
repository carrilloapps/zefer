export type CompressionMethod = "none" | "gzip" | "deflate" | "deflate-raw";

const MAX_DECOMPRESS_SIZE = 512 * 1024 * 1024;

async function streamToUint8Array(
  stream: ReadableStream<Uint8Array>,
  maxSize: number = Infinity
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalLength += value.length;
    if (totalLength > maxSize) {
      reader.cancel();
      throw new Error(`Output exceeds maximum allowed size (${Math.floor(maxSize / 1024 / 1024)} MB)`);
    }
    chunks.push(value);
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

// ─── String compression (for text mode, backward compat) ───

export async function compress(
  data: string,
  method: CompressionMethod
): Promise<string> {
  if (method === "none") return data;
  const encoded = new TextEncoder().encode(data);
  const compressed = await compressBytes(encoded, method);
  let binary = "";
  for (let i = 0; i < compressed.length; i++) {
    binary += String.fromCharCode(compressed[i]);
  }
  return btoa(binary);
}

export async function decompress(
  base64Data: string,
  method: CompressionMethod
): Promise<string> {
  if (method === "none") return base64Data;
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decompressed = await decompressBytes(bytes, method);
  return new TextDecoder().decode(decompressed);
}

// ─── Binary compression (for any data) ───

export async function compressBytes(
  data: Uint8Array,
  method: CompressionMethod
): Promise<Uint8Array> {
  if (method === "none") return data;

  const cs = new CompressionStream(method as CompressionFormat);
  const writer = cs.writable.getWriter();
  writer.write(data as unknown as ArrayBuffer);
  writer.close();

  return streamToUint8Array(cs.readable);
}

/**
 * Compress a Blob/File into a new Blob without ever holding the full input
 * (or output) in a single contiguous buffer. The browser streams the source
 * through CompressionStream and accumulates the result in a Blob, which it can
 * back on disk — so this stays memory-safe for multi-GB files. The decompressed
 * result is identical regardless of how the input was chunked, so files stay
 * cross-compatible with the CLI and the one-shot compressBytes path.
 */
export async function compressBlob(
  input: Blob,
  method: CompressionMethod
): Promise<Blob> {
  if (method === "none") return input;
  const cs = new CompressionStream(method as CompressionFormat);
  return new Response(input.stream().pipeThrough(cs)).blob();
}

export async function decompressBytes(
  data: Uint8Array,
  method: CompressionMethod
): Promise<Uint8Array> {
  if (method === "none") return data;

  const ds = new DecompressionStream(method as CompressionFormat);
  const writer = ds.writable.getWriter();
  writer.write(data as unknown as ArrayBuffer);
  writer.close();

  return streamToUint8Array(ds.readable, MAX_DECOMPRESS_SIZE);
}

/**
 * Decompress a Blob into a new Blob without holding the full input or output
 * in a single contiguous buffer — the multi-GB counterpart of decompressBytes.
 *
 * `maxBytes` guards against a decompression bomb: callers pass the expected
 * plaintext size (meta.fileSize, which is authenticated inside the AES-GCM
 * payload), so a crafted/corrupt stream that expands beyond it is aborted
 * instead of exhausting memory or disk.
 */
export async function decompressBlob(
  input: Blob,
  method: CompressionMethod,
  maxBytes: number = Infinity
): Promise<Blob> {
  if (method === "none") return input;
  const ds = new DecompressionStream(method as CompressionFormat);
  const reader = input.stream().pipeThrough(ds).getReader();
  const parts: BlobPart[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error(`Decompressed output exceeds the expected size (${maxBytes} bytes)`);
    }
    parts.push(value);
  }
  return new Blob(parts);
}

/**
 * Try to compress data. If the compressed version is smaller, return it.
 * If compression makes it bigger (already compressed formats), return original.
 * Returns { data, wasCompressed }.
 */
export async function smartCompress(
  data: Uint8Array,
  method: CompressionMethod
): Promise<{ data: Uint8Array; wasCompressed: boolean }> {
  if (method === "none") return { data, wasCompressed: false };

  try {
    const compressed = await compressBytes(data, method);

    // Only use compressed if it's actually smaller
    if (compressed.length < data.length) {
      return { data: compressed, wasCompressed: true };
    }

    // Compression made it bigger or same — skip
    return { data, wasCompressed: false };
  } catch {
    // Compression failed — use original
    return { data, wasCompressed: false };
  }
}

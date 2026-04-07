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
  writer.write(data.buffer as ArrayBuffer);
  writer.close();

  return streamToUint8Array(cs.readable);
}

export async function decompressBytes(
  data: Uint8Array,
  method: CompressionMethod
): Promise<Uint8Array> {
  if (method === "none") return data;

  const ds = new DecompressionStream(method as CompressionFormat);
  const writer = ds.writable.getWriter();
  writer.write(data.buffer as ArrayBuffer);
  writer.close();

  return streamToUint8Array(ds.readable, MAX_DECOMPRESS_SIZE);
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

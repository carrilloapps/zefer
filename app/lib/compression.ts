export type CompressionMethod = "none" | "gzip" | "deflate" | "deflate-raw";

async function streamToUint8Array(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

export async function compress(
  data: string,
  method: CompressionMethod
): Promise<string> {
  if (method === "none") return data;

  const encoded = new TextEncoder().encode(data);
  const cs = new CompressionStream(method as CompressionFormat);
  const writer = cs.writable.getWriter();
  writer.write(encoded);
  writer.close();

  const compressed = await streamToUint8Array(cs.readable);

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

  const ds = new DecompressionStream(method as CompressionFormat);
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();

  const decompressed = await streamToUint8Array(ds.readable);
  return new TextDecoder().decode(decompressed);
}

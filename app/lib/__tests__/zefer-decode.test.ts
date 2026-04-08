import { describe, it, expect, vi, beforeAll } from "vitest";
import { encodeZefer, decodeZefer } from "../zefer";

const LOW_ITERATIONS = 1000;

// Node.js CompressionStream/DecompressionStream accept TypedArray but not
// bare ArrayBuffer. The production code passes `data.buffer` (an ArrayBuffer)
// which works fine in browsers but breaks in Node. Patch the compression
// module so we can test the full encode/decode round-trip without touching
// production code.
beforeAll(async () => {
  const compression = await import("../compression");

  const origCompress = compression.compressBytes;
  const origDecompress = compression.decompressBytes;

  // Wrap compressBytes: convert ArrayBuffer arg to Uint8Array for Node compat
  vi.spyOn(compression, "compressBytes").mockImplementation(
    async (data: Uint8Array, method: import("../compression").CompressionMethod) => {
      if (method === "none") return data;
      const cs = new CompressionStream(method as CompressionFormat);
      const writer = cs.writable.getWriter();
      // Pass Uint8Array instead of ArrayBuffer
      writer.write((data instanceof Uint8Array ? data : new Uint8Array(data)) as unknown as ArrayBuffer);
      writer.close();
      return streamToUint8Array(cs.readable);
    }
  );

  vi.spyOn(compression, "decompressBytes").mockImplementation(
    async (data: Uint8Array, method: import("../compression").CompressionMethod) => {
      if (method === "none") return data;
      const ds = new DecompressionStream(method as CompressionFormat);
      const writer = ds.writable.getWriter();
      writer.write((data instanceof Uint8Array ? data : new Uint8Array(data)) as unknown as ArrayBuffer);
      writer.close();
      return streamToUint8Array(ds.readable);
    }
  );
});

async function streamToUint8Array(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalLength += value.length;
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

// Helper: encode and return the raw ArrayBuffer for decoding
async function encodeToBuffer(
  opts: Parameters<typeof encodeZefer>[0]
): Promise<ArrayBuffer> {
  const blob = await encodeZefer(opts);
  return blob.arrayBuffer();
}

describe("decodeZefer", () => {
  // ──────────────────────────────────────────────────
  // 1. Decrypt with main passphrase
  // ──────────────────────────────────────────────────
  it("decrypts with main passphrase when revealKey is present", async () => {
    const content = "Hello, Zefer!";
    const buf = await encodeToBuffer({
      content,
      passphrase: "mainpass",
      revealKey: "revealpass",
      fileName: "test.txt",
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const result = await decodeZefer("", "mainpass", { rawBytes: buf });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.content).toBe(content);
    }
  });

  // ──────────────────────────────────────────────────
  // 2. Decrypt with reveal key
  // ──────────────────────────────────────────────────
  it("decrypts with reveal key", async () => {
    const content = "Secret message for reveal key";
    const buf = await encodeToBuffer({
      content,
      passphrase: "mainpass",
      revealKey: "revealpass",
      fileName: "test.txt",
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const result = await decodeZefer("", "revealpass", { rawBytes: buf });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.content).toBe(content);
    }
  });

  // ──────────────────────────────────────────────────
  // 3. Both keys produce identical content
  // ──────────────────────────────────────────────────
  it("produces identical content regardless of which key is used", async () => {
    const content = "Same content from both keys";
    const buf = await encodeToBuffer({
      content,
      passphrase: "mainpass",
      revealKey: "revealpass",
      fileName: "test.txt",
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const mainResult = await decodeZefer("", "mainpass", { rawBytes: buf });
    const revealResult = await decodeZefer("", "revealpass", { rawBytes: buf });

    expect(mainResult.ok).toBe(true);
    expect(revealResult.ok).toBe(true);
    if (mainResult.ok && revealResult.ok) {
      expect(mainResult.payload.content).toBe(revealResult.payload.content);
    }
  });

  // ──────────────────────────────────────────────────
  // 4. Both keys produce identical metadata
  // ──────────────────────────────────────────────────
  it("produces identical metadata regardless of which key is used", async () => {
    const buf = await encodeToBuffer({
      content: "Metadata test",
      passphrase: "mainpass",
      revealKey: "revealpass",
      fileName: "document.txt",
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const mainResult = await decodeZefer("", "mainpass", { rawBytes: buf });
    const revealResult = await decodeZefer("", "revealpass", { rawBytes: buf });

    expect(mainResult.ok).toBe(true);
    expect(revealResult.ok).toBe(true);
    if (mainResult.ok && revealResult.ok) {
      const mainMeta = mainResult.payload.meta;
      const revealMeta = revealResult.payload.meta;

      expect(mainMeta.createdAt).toBe(revealMeta.createdAt);
      expect(mainMeta.fileName).toBe(revealMeta.fileName);
      expect(mainMeta.fileType).toBe(revealMeta.fileType);
      expect(mainMeta.fileSize).toBe(revealMeta.fileSize);
      expect(mainMeta.expiresAt).toBe(revealMeta.expiresAt);
      expect(mainMeta.v).toBe(revealMeta.v);
      expect(mainMeta.allowedIps).toEqual(revealMeta.allowedIps);
      expect(mainMeta.maxAttempts).toBe(revealMeta.maxAttempts);
    }
  });

  // ──────────────────────────────────────────────────
  // 5. Wrong passphrase fails
  // ──────────────────────────────────────────────────
  it("returns wrong_passphrase error for incorrect password", async () => {
    const buf = await encodeToBuffer({
      content: "Locked content",
      passphrase: "correctpass",
      fileName: "test.txt",
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const result = await decodeZefer("", "wrongpass", { rawBytes: buf });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("wrong_passphrase");
    }
  });

  // ──────────────────────────────────────────────────
  // 6. Dual key + reveal key
  // ──────────────────────────────────────────────────
  it("decrypts with dual key combo and also with reveal key alone", async () => {
    const content = "Dual key content";
    const buf = await encodeToBuffer({
      content,
      passphrase: "primary",
      secondPassphrase: "secondary",
      dualKey: true,
      revealKey: "revealpass",
      fileName: "test.txt",
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    // Decrypt with dual key combo
    const dualResult = await decodeZefer("", "primary", {
      rawBytes: buf,
      secondPassphrase: "secondary",
    });
    expect(dualResult.ok).toBe(true);
    if (dualResult.ok) {
      expect(dualResult.payload.content).toBe(content);
    }

    // Decrypt with reveal key alone (no second passphrase needed)
    const revealResult = await decodeZefer("", "revealpass", { rawBytes: buf });
    expect(revealResult.ok).toBe(true);
    if (revealResult.ok) {
      expect(revealResult.payload.content).toBe(content);
    }
  });

  // ──────────────────────────────────────────────────
  // 7. File mode with reveal key
  // ──────────────────────────────────────────────────
  it("encrypts and decrypts file data with both main and reveal keys", async () => {
    const originalBytes = new Uint8Array([1, 2, 3, 4, 5, 10, 20, 30, 255, 0]);
    const fileData = originalBytes.buffer as ArrayBuffer;

    const buf = await encodeToBuffer({
      fileData,
      passphrase: "filepass",
      revealKey: "filereveal",
      fileName: "data.bin",
      fileType: "application/octet-stream",
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    // Decrypt with main passphrase
    const mainResult = await decodeZefer("", "filepass", { rawBytes: buf });
    expect(mainResult.ok).toBe(true);
    if (mainResult.ok) {
      expect(mainResult.payload.fileData).not.toBeNull();
      const decryptedBytes = new Uint8Array(mainResult.payload.fileData!);
      expect(decryptedBytes).toEqual(originalBytes);
      expect(mainResult.header.mode).toBe("file");
    }

    // Decrypt with reveal key
    const revealResult = await decodeZefer("", "filereveal", { rawBytes: buf });
    expect(revealResult.ok).toBe(true);
    if (revealResult.ok) {
      expect(revealResult.payload.fileData).not.toBeNull();
      const decryptedBytes = new Uint8Array(revealResult.payload.fileData!);
      expect(decryptedBytes).toEqual(originalBytes);
    }
  });

  // ──────────────────────────────────────────────────
  // 8. Secret question with reveal key
  // ──────────────────────────────────────────────────
  it("requires answer for secret question even with reveal key", async () => {
    const content = "Protected by question";
    const buf = await encodeToBuffer({
      content,
      passphrase: "mainpass",
      revealKey: "revealpass",
      question: "What is the color of the sky?",
      questionAnswer: "blue",
      fileName: "test.txt",
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    // Decrypt with reveal key but NO answer => needs_answer
    const noAnswerResult = await decodeZefer("", "revealpass", {
      rawBytes: buf,
    });
    expect(noAnswerResult.ok).toBe(false);
    if (!noAnswerResult.ok) {
      expect(noAnswerResult.error).toBe("needs_answer");
    }

    // Decrypt with reveal key + correct answer => ok
    const withAnswerResult = await decodeZefer("", "revealpass", {
      rawBytes: buf,
      questionAnswer: "blue",
    });
    expect(withAnswerResult.ok).toBe(true);
    if (withAnswerResult.ok) {
      expect(withAnswerResult.payload.content).toBe(content);
    }
  });

  // ──────────────────────────────────────────────────
  // 9. Expiration with reveal key
  // ──────────────────────────────────────────────────
  it("returns expired error when expiresAt is in the past", async () => {
    const pastTimestamp = Date.now() - 60_000; // 1 minute ago
    const buf = await encodeToBuffer({
      content: "Expired content",
      passphrase: "mainpass",
      revealKey: "revealpass",
      fileName: "test.txt",
      expiresAt: pastTimestamp,
      iterations: LOW_ITERATIONS,
    });

    const result = await decodeZefer("", "revealpass", { rawBytes: buf });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("expired");
    }
  });

  // ──────────────────────────────────────────────────
  // 10. Backward compatibility ZEFB3 (no reveal key)
  // ──────────────────────────────────────────────────
  it("decrypts ZEFB3 format without reveal key (backward compat)", async () => {
    const content = "No reveal key content";
    const buf = await encodeToBuffer({
      content,
      passphrase: "simplepass",
      fileName: "test.txt",
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const result = await decodeZefer("", "simplepass", { rawBytes: buf });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.content).toBe(content);
      expect(result.payload.meta.v).toBe(3);
    }
  });

  // ──────────────────────────────────────────────────
  // 11. Compression gzip + reveal key
  // ──────────────────────────────────────────────────
  it("handles gzip compression with reveal key", async () => {
    const content = "Compressed with gzip! ".repeat(50);
    const buf = await encodeToBuffer({
      content,
      passphrase: "mainpass",
      revealKey: "revealpass",
      fileName: "test.txt",
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
      compression: "gzip",
    });

    const result = await decodeZefer("", "revealpass", { rawBytes: buf });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.content).toBe(content);
      expect(result.header.compression).toBe("gzip");
    }
  }, 15_000);

  // ──────────────────────────────────────────────────
  // 12. Compression deflate + reveal key (decrypt with main)
  // ──────────────────────────────────────────────────
  it("handles deflate compression decrypted with main passphrase", async () => {
    const content = "Deflate compressed content! ".repeat(50);
    const buf = await encodeToBuffer({
      content,
      passphrase: "mainpass",
      revealKey: "revealpass",
      fileName: "test.txt",
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
      compression: "deflate",
    });

    const result = await decodeZefer("", "mainpass", { rawBytes: buf });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.content).toBe(content);
      expect(result.header.compression).toBe("deflate");
    }
  }, 15_000);
});

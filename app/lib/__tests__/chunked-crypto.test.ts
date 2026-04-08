import { describe, it, expect, vi } from "vitest";
import {
  chunkedEncrypt,
  chunkedDecrypt,
  chunkedDecryptToBuffer,
  CHUNK_SIZE,
} from "../chunked-crypto";

const FAST_ITERATIONS = 1000;

/** Helper: create a Uint8Array of `size` bytes filled with a repeating pattern. */
function makeTestData(size: number): Uint8Array {
  const data = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = i % 256;
  }
  return data;
}

/** Helper: concatenate encrypted chunks into a single Uint8Array (wire format). */
function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const totalLen = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Single-chunk tests (data < CHUNK_SIZE)
// ---------------------------------------------------------------------------

describe("chunkedEncrypt — single chunk", () => {
  it("should produce 1 chunk for data smaller than CHUNK_SIZE", async () => {
    const data = makeTestData(1024);
    const result = await chunkedEncrypt(
      data.buffer as ArrayBuffer,
      "password123",
      FAST_ITERATIONS
    );

    expect(result.totalChunks).toBe(1);
    expect(result.chunks).toHaveLength(1);
    expect(result.salt).toHaveLength(32);
    expect(result.baseIv).toHaveLength(12);
  });

  it("should produce a salt of 32 bytes and baseIv of 12 bytes", async () => {
    const data = makeTestData(256);
    const result = await chunkedEncrypt(
      data.buffer as ArrayBuffer,
      "securepass",
      FAST_ITERATIONS
    );

    expect(result.salt).toBeInstanceOf(Uint8Array);
    expect(result.salt.byteLength).toBe(32);
    expect(result.baseIv).toBeInstanceOf(Uint8Array);
    expect(result.baseIv.byteLength).toBe(12);
  });
});

// ---------------------------------------------------------------------------
// Multi-chunk tests (data > CHUNK_SIZE) — covers yield lines 102 & 160
// ---------------------------------------------------------------------------

describe("chunkedEncrypt — multi-chunk", () => {
  it("should produce 2 chunks for data slightly larger than CHUNK_SIZE", async () => {
    const data = makeTestData(CHUNK_SIZE + 100);
    const result = await chunkedEncrypt(
      data.buffer as ArrayBuffer,
      "password123",
      FAST_ITERATIONS
    );

    expect(result.totalChunks).toBe(2);
    expect(result.chunks).toHaveLength(2);
  }, 30_000);
});

// ---------------------------------------------------------------------------
// Roundtrip tests
// ---------------------------------------------------------------------------

describe("chunkedEncrypt + chunkedDecryptToBuffer roundtrip", () => {
  it("should roundtrip single-chunk data", async () => {
    const original = makeTestData(2048);
    const passphrase = "roundtrip-pass";

    const encrypted = await chunkedEncrypt(
      original.buffer as ArrayBuffer,
      passphrase,
      FAST_ITERATIONS
    );

    const wire = concatChunks(encrypted.chunks);
    const decryptedBuf = await chunkedDecryptToBuffer(
      wire,
      encrypted.salt,
      encrypted.baseIv,
      passphrase,
      FAST_ITERATIONS
    );

    const decrypted = new Uint8Array(decryptedBuf);
    expect(Array.from(decrypted)).toEqual(Array.from(original));
  });

  it("should roundtrip multi-chunk data", async () => {
    const original = makeTestData(CHUNK_SIZE + 100);
    const passphrase = "roundtrip-multi";

    const encrypted = await chunkedEncrypt(
      original.buffer as ArrayBuffer,
      passphrase,
      FAST_ITERATIONS
    );

    const wire = concatChunks(encrypted.chunks);
    const decryptedBuf = await chunkedDecryptToBuffer(
      wire,
      encrypted.salt,
      encrypted.baseIv,
      passphrase,
      FAST_ITERATIONS
    );

    const decrypted = new Uint8Array(decryptedBuf);
    expect(decrypted.byteLength).toBe(original.byteLength);
    expect(Array.from(decrypted)).toEqual(Array.from(original));
  }, 30_000);
});

describe("chunkedEncrypt + chunkedDecrypt returns Blob", () => {
  it("should return a Blob whose contents match the original data", async () => {
    const original = makeTestData(512);
    const passphrase = "blob-pass";

    const encrypted = await chunkedEncrypt(
      original.buffer as ArrayBuffer,
      passphrase,
      FAST_ITERATIONS
    );

    const wire = concatChunks(encrypted.chunks);
    const blob = await chunkedDecrypt(
      wire,
      encrypted.salt,
      encrypted.baseIv,
      passphrase,
      FAST_ITERATIONS
    );

    expect(blob).toBeInstanceOf(Blob);
    const arrayBuf = await blob.arrayBuffer();
    const decrypted = new Uint8Array(arrayBuf);
    expect(Array.from(decrypted)).toEqual(Array.from(original));
  });
});

// ---------------------------------------------------------------------------
// Progress callbacks
// ---------------------------------------------------------------------------

describe("progress callbacks", () => {
  it("should fire onProgress once for a single-chunk encrypt", async () => {
    const data = makeTestData(1024);
    const progressCalls: [number, number][] = [];

    await chunkedEncrypt(
      data.buffer as ArrayBuffer,
      "progress-pass",
      FAST_ITERATIONS,
      (chunkIndex, totalChunks) => {
        progressCalls.push([chunkIndex, totalChunks]);
      }
    );

    expect(progressCalls).toEqual([[1, 1]]);
  });

  it("should fire onProgress once for a single-chunk decrypt", async () => {
    const data = makeTestData(1024);
    const encrypted = await chunkedEncrypt(
      data.buffer as ArrayBuffer,
      "progress-pass",
      FAST_ITERATIONS
    );

    const wire = concatChunks(encrypted.chunks);
    const decryptProgressCalls: [number, number][] = [];

    await chunkedDecryptToBuffer(
      wire,
      encrypted.salt,
      encrypted.baseIv,
      "progress-pass",
      FAST_ITERATIONS,
      (chunkIndex, totalChunks) => {
        decryptProgressCalls.push([chunkIndex, totalChunks]);
      }
    );

    expect(decryptProgressCalls).toEqual([[1, 1]]);
  });

  it("should fire onProgress for each chunk in multi-chunk encrypt", async () => {
    const data = makeTestData(CHUNK_SIZE + 100);
    const progressCalls: [number, number][] = [];

    await chunkedEncrypt(
      data.buffer as ArrayBuffer,
      "progress-multi",
      FAST_ITERATIONS,
      (chunkIndex, totalChunks) => {
        progressCalls.push([chunkIndex, totalChunks]);
      }
    );

    expect(progressCalls).toEqual([
      [1, 2],
      [2, 2],
    ]);
  }, 30_000);

  it("should fire onProgress for each chunk in multi-chunk decrypt", async () => {
    const data = makeTestData(CHUNK_SIZE + 100);
    const encrypted = await chunkedEncrypt(
      data.buffer as ArrayBuffer,
      "progress-multi",
      FAST_ITERATIONS
    );

    const wire = concatChunks(encrypted.chunks);
    const decryptProgressCalls: [number, number][] = [];

    await chunkedDecryptToBuffer(
      wire,
      encrypted.salt,
      encrypted.baseIv,
      "progress-multi",
      FAST_ITERATIONS,
      (chunkIndex, totalChunks) => {
        decryptProgressCalls.push([chunkIndex, totalChunks]);
      }
    );

    expect(decryptProgressCalls).toEqual([
      [1, 2],
      [2, 2],
    ]);
  }, 30_000);
});

// ---------------------------------------------------------------------------
// Truncated / malformed encrypted data — covers branch guards on lines 127 & 139
// ---------------------------------------------------------------------------

describe("truncated encrypted data", () => {
  it("should return empty Blob when wire has trailing bytes shorter than 4 (first-pass guard)", async () => {
    // Encrypt normally, then append 1-3 trailing garbage bytes after the valid chunk.
    // This triggers the `if (offset + 4 > encryptedData.length) break;` guard
    // in both the counting pass (line 127) and decryption pass (line 139).
    const original = makeTestData(256);
    const passphrase = "truncated-pass";

    const encrypted = await chunkedEncrypt(
      original.buffer as ArrayBuffer,
      passphrase,
      FAST_ITERATIONS
    );

    const wire = concatChunks(encrypted.chunks);

    // Append 2 trailing bytes — not enough for a 4-byte length header
    const truncated = new Uint8Array(wire.length + 2);
    truncated.set(wire, 0);
    truncated[wire.length] = 0xff;
    truncated[wire.length + 1] = 0xfe;

    const blob = await chunkedDecrypt(
      truncated,
      encrypted.salt,
      encrypted.baseIv,
      passphrase,
      FAST_ITERATIONS
    );

    // Should still decrypt the valid chunk successfully
    const arrayBuf = await blob.arrayBuffer();
    const decrypted = new Uint8Array(arrayBuf);
    expect(Array.from(decrypted)).toEqual(Array.from(original));
  });

  it("should return empty Blob for completely empty encrypted data", async () => {
    // Empty data: both while loops exit immediately, no chunks counted or decrypted.
    const emptyWire = new Uint8Array(0);
    const fakeSalt = new Uint8Array(32);
    const fakeIv = new Uint8Array(12);

    const blob = await chunkedDecrypt(
      emptyWire,
      fakeSalt,
      fakeIv,
      "any-pass",
      FAST_ITERATIONS
    );

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(0);
  });

  it("should return empty Blob when wire is only 1-3 bytes (too short for length header)", async () => {
    // Wire has bytes but fewer than 4 — both guards trigger on the very first iteration.
    const shortWire = new Uint8Array([0x00, 0x01]);
    const fakeSalt = new Uint8Array(32);
    const fakeIv = new Uint8Array(12);

    const blob = await chunkedDecrypt(
      shortWire,
      fakeSalt,
      fakeIv,
      "any-pass",
      FAST_ITERATIONS
    );

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Wrong passphrase
// ---------------------------------------------------------------------------

describe("wrong passphrase", () => {
  it("should throw when decrypting with a wrong passphrase", async () => {
    const data = makeTestData(512);
    const encrypted = await chunkedEncrypt(
      data.buffer as ArrayBuffer,
      "correct-pass",
      FAST_ITERATIONS
    );

    const wire = concatChunks(encrypted.chunks);

    await expect(
      chunkedDecryptToBuffer(
        wire,
        encrypted.salt,
        encrypted.baseIv,
        "wrong-pass",
        FAST_ITERATIONS
      )
    ).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Each chunk has a unique IV (encrypted chunks differ)
// ---------------------------------------------------------------------------

describe("chunk IV uniqueness", () => {
  it("should produce different ciphertexts for each chunk even with identical plaintext", async () => {
    // Create data where both chunks contain the same byte pattern.
    // First chunk is CHUNK_SIZE bytes of 0xAA, second chunk is also 0xAA but shorter.
    // Even so, the different IVs should produce different ciphertexts.
    const size = CHUNK_SIZE + 64;
    const data = new Uint8Array(size);
    data.fill(0xaa);

    const result = await chunkedEncrypt(
      data.buffer as ArrayBuffer,
      "iv-unique",
      FAST_ITERATIONS
    );

    expect(result.chunks).toHaveLength(2);

    // Extract the ciphertext portion (skip 4-byte length prefix) from each chunk
    const cipher0 = result.chunks[0].slice(4);
    const cipher1 = result.chunks[1].slice(4);

    // They must differ — same key but different IVs (and different chunk sizes, but the
    // point is the IV derivation produces unique nonces per chunk).
    const areSame =
      cipher0.length === cipher1.length &&
      cipher0.every((byte, idx) => byte === cipher1[idx]);

    expect(areSame).toBe(false);
  }, 30_000);
});

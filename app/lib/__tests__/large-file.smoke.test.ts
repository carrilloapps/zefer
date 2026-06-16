import { describe, it, expect } from "vitest";
import { encodeZefer, decodeZefer } from "../zefer";
import { CHUNK_SIZE } from "../chunked-crypto";

/**
 * Smoke test for the multi-GB streaming path.
 *
 * Uses a payload LARGER than one 16 MB chunk so the encrypt/decrypt paths must
 * read the file in multiple Blob slices and cross chunk boundaries — the exact
 * scenario that used to fail with "may exceed available memory" when the whole
 * file was loaded into a single ArrayBuffer. Kept at ~20 MB (2+ chunks) so it
 * proves the slicing logic without being slow. PBKDF2 iterations are low to
 * keep key derivation fast in the test environment.
 */

const PASSPHRASE = "smoke-pass-123";
const ITER = 1000;
const SIZE = 20 * 1024 * 1024; // 20 MB → spans 2 chunks (CHUNK_SIZE = 16 MB)

/** Deterministic pseudo-random fill (fast, reproducible). */
function fill(size: number): Uint8Array {
  const buf = new Uint8Array(size);
  let seed = 0x9e3779b9;
  for (let i = 0; i < size; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    buf[i] = seed & 0xff;
  }
  return buf;
}

/** Highly compressible fill (repeated pattern). */
function compressibleFill(size: number): Uint8Array {
  const buf = new Uint8Array(size);
  for (let i = 0; i < size; i++) buf[i] = i % 8;
  return buf;
}

/** Order-sensitive checksum so we compare large buffers without giant toEqual. */
function checksum(bytes: Uint8Array): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

describe("large-file streaming smoke test", () => {
  it("round-trips a >16 MB file (uncompressed) across chunk boundaries", async () => {
    const original = fill(SIZE);
    expect(SIZE).toBeGreaterThan(CHUNK_SIZE); // must be multi-chunk

    const zefer = await encodeZefer({
      fileBlob: new Blob([original.buffer as ArrayBuffer]),
      passphrase: PASSPHRASE,
      fileName: "big.bin",
      fileType: "application/octet-stream",
      expiresAt: 0,
      iterations: ITER,
    });

    const result = await decodeZefer("", PASSPHRASE, { fileBlob: zefer });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const out = new Uint8Array(await (result.payload.fileData as Blob).arrayBuffer());
      expect(out.length).toBe(original.length);
      expect(checksum(out)).toBe(checksum(original));
      expect(result.payload.meta.fileSize).toBe(SIZE);
    }
  }, 30_000);

  it("round-trips a >16 MB file with gzip compression", async () => {
    const original = compressibleFill(SIZE);

    const zefer = await encodeZefer({
      fileBlob: new Blob([original.buffer as ArrayBuffer]),
      passphrase: PASSPHRASE,
      fileName: "big.bin",
      fileType: "application/octet-stream",
      expiresAt: 0,
      iterations: ITER,
      compression: "gzip",
    });

    const result = await decodeZefer("", PASSPHRASE, { fileBlob: zefer });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const out = new Uint8Array(await (result.payload.fileData as Blob).arrayBuffer());
      expect(out.length).toBe(original.length);
      expect(checksum(out)).toBe(checksum(original));
    }
  }, 30_000);

  it("rejects a wrong passphrase on the streaming path", async () => {
    const zefer = await encodeZefer({
      fileBlob: new Blob([fill(SIZE).buffer as ArrayBuffer]),
      passphrase: PASSPHRASE,
      fileName: "big.bin",
      expiresAt: 0,
      iterations: ITER,
    });

    const result = await decodeZefer("", "wrong-pass", { fileBlob: zefer });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("wrong_passphrase");
  }, 30_000);
});

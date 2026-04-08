import { describe, it, expect, beforeAll } from "vitest";
import {
  compress,
  decompress,
  compressBytes,
  decompressBytes,
  smartCompress,
} from "../compression";

/**
 * Node.js v24 CompressionStream/DecompressionStream reject ArrayBuffer input
 * (they require Uint8Array), but the production code passes `data.buffer as
 * ArrayBuffer`. In browsers this works fine. We patch the globals so that
 * writer.write() transparently wraps ArrayBuffer -> Uint8Array, allowing the
 * production code to run unchanged in the Node test environment.
 */

// Keep references to the originals before patching.
const NativeCS = globalThis.CompressionStream;
const NativeDS = globalThis.DecompressionStream;

function wrapStream<T extends { readable: ReadableStream; writable: WritableStream }>(
  OrigCtor: new (format: CompressionFormat) => T,
) {
  return function PatchedStream(format: CompressionFormat) {
    const instance = new OrigCtor(format);
    const origWriter = instance.writable.getWriter();

    const patched = new WritableStream<BufferSource>({
      write(chunk) {
        const data =
          chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : chunk;
        return origWriter.write(data as Uint8Array);
      },
      close() {
        return origWriter.close();
      },
      abort(reason) {
        return origWriter.abort(reason);
      },
    });

    return { readable: instance.readable, writable: patched } as unknown as T;
  } as unknown as typeof OrigCtor;
}

beforeAll(() => {
  globalThis.CompressionStream = wrapStream(NativeCS) as typeof CompressionStream;
  globalThis.DecompressionStream = wrapStream(NativeDS) as typeof DecompressionStream;
});

// ---- Helpers ----------------------------------------------------------------

/** Build a Uint8Array of highly compressible data (repeated pattern). */
function compressibleData(size: number): Uint8Array {
  const buf = new Uint8Array(size);
  for (let i = 0; i < size; i++) buf[i] = i % 4;
  return buf;
}

/** Build a Uint8Array of pseudo-random (incompressible) data. */
function randomData(size: number): Uint8Array {
  const buf = new Uint8Array(size);
  let seed = 12345;
  for (let i = 0; i < size; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    buf[i] = seed & 0xff;
  }
  return buf;
}

// ---- String roundtrips ------------------------------------------------------

describe("compress + decompress string roundtrip", () => {
  const text =
    "Hello, Zefer! This is a test message for compression. ".repeat(20);

  it("gzip", async () => {
    const compressed = await compress(text, "gzip");
    expect(compressed).not.toBe(text);
    const decompressed = await decompress(compressed, "gzip");
    expect(decompressed).toBe(text);
  });

  it("deflate", async () => {
    const compressed = await compress(text, "deflate");
    expect(compressed).not.toBe(text);
    const decompressed = await decompress(compressed, "deflate");
    expect(decompressed).toBe(text);
  });

  it("deflate-raw", async () => {
    const compressed = await compress(text, "deflate-raw");
    expect(compressed).not.toBe(text);
    const decompressed = await decompress(compressed, "deflate-raw");
    expect(decompressed).toBe(text);
  });
});

// ---- String "none" passthrough ----------------------------------------------

describe("compress / decompress with method 'none'", () => {
  const text = "No compression applied";

  it("compress returns original string unchanged", async () => {
    expect(await compress(text, "none")).toBe(text);
  });

  it("decompress returns original string unchanged", async () => {
    expect(await decompress(text, "none")).toBe(text);
  });
});

// ---- Binary roundtrips ------------------------------------------------------

describe("compressBytes + decompressBytes binary roundtrip", () => {
  const data = compressibleData(2048);

  it("gzip", async () => {
    const compressed = await compressBytes(data, "gzip");
    expect(compressed.length).toBeLessThan(data.length);
    const decompressed = await decompressBytes(compressed, "gzip");
    expect(Array.from(decompressed)).toEqual(Array.from(data));
  });

  it("deflate", async () => {
    const compressed = await compressBytes(data, "deflate");
    expect(compressed.length).toBeLessThan(data.length);
    const decompressed = await decompressBytes(compressed, "deflate");
    expect(Array.from(decompressed)).toEqual(Array.from(data));
  });

  it("deflate-raw", async () => {
    const compressed = await compressBytes(data, "deflate-raw");
    expect(compressed.length).toBeLessThan(data.length);
    const decompressed = await decompressBytes(compressed, "deflate-raw");
    expect(Array.from(decompressed)).toEqual(Array.from(data));
  });
});

// ---- Binary "none" passthrough ----------------------------------------------

describe("compressBytes / decompressBytes with method 'none'", () => {
  const data = new Uint8Array([10, 20, 30, 40, 50]);

  it("compressBytes returns original Uint8Array unchanged", async () => {
    const result = await compressBytes(data, "none");
    expect(result).toBe(data);
  });

  it("decompressBytes returns original Uint8Array unchanged", async () => {
    const result = await decompressBytes(data, "none");
    expect(result).toBe(data);
  });
});

// ---- smartCompress ----------------------------------------------------------

describe("smartCompress", () => {
  it("compresses compressible data and returns wasCompressed=true", async () => {
    const data = compressibleData(4096);
    const result = await smartCompress(data, "gzip");
    expect(result.wasCompressed).toBe(true);
    expect(result.data.length).toBeLessThan(data.length);
    const decompressed = await decompressBytes(result.data, "gzip");
    expect(Array.from(decompressed)).toEqual(Array.from(data));
  });

  it("returns original with wasCompressed=false when method is 'none'", async () => {
    const data = compressibleData(256);
    const result = await smartCompress(data, "none");
    expect(result.wasCompressed).toBe(false);
    expect(result.data).toBe(data);
  });

  it("returns original with wasCompressed=false when data is incompressible", async () => {
    // 20 random bytes + gzip overhead (~18 bytes) means compressed > original
    const data = randomData(20);
    const result = await smartCompress(data, "gzip");
    expect(result.wasCompressed).toBe(false);
    expect(Array.from(result.data)).toEqual(Array.from(data));
  });
});

// ---- smartCompress catch branch (line 114-116) ------------------------------

describe("smartCompress compression failure", () => {
  it("returns original with wasCompressed=false when compression throws", async () => {
    const data = compressibleData(256);
    const saved = globalThis.CompressionStream;

    // Replace CompressionStream with a constructor that throws synchronously.
    // This causes compressBytes to throw inside smartCompress's try block,
    // exercising the catch branch.
    globalThis.CompressionStream = function ThrowingCS() {
      throw new Error("simulated compression failure");
    } as unknown as typeof CompressionStream;

    try {
      const result = await smartCompress(data, "gzip");
      expect(result.wasCompressed).toBe(false);
      expect(result.data).toBe(data);
    } finally {
      globalThis.CompressionStream = saved;
    }
  });
});

// ---- decompressBytes MAX_DECOMPRESS_SIZE exceeded (lines 17-19) -------------

describe("decompressBytes MAX_DECOMPRESS_SIZE exceeded", () => {
  it("throws when decompressed output exceeds 512 MB", async () => {
    const saved = globalThis.DecompressionStream;
    const MB = 1024 * 1024;

    // Mock DecompressionStream to produce a readable that yields > 512 MB.
    // The writable side just accepts and discards input.
    // The readable yields a single Uint8Array of 513 MB — enough to trip
    // the `totalLength > maxSize` guard in streamToUint8Array.
    globalThis.DecompressionStream = function FakeDS() {
      const oversized = new Uint8Array(513 * MB); // ~513 MB of zeros, fast alloc
      return {
        readable: new ReadableStream({
          start(controller) {
            controller.enqueue(oversized);
            controller.close();
          },
        }),
        writable: new WritableStream(),
      };
    } as unknown as typeof DecompressionStream;

    try {
      // Pass any small payload — the mock ignores it and emits 513 MB.
      const dummy = new Uint8Array([1, 2, 3]);
      await expect(decompressBytes(dummy, "gzip")).rejects.toThrow(
        "Output exceeds maximum allowed size (512 MB)"
      );
    } finally {
      globalThis.DecompressionStream = saved;
    }
  });
});

// ---- decompressBytes with normal data (positive path) -----------------------

describe("decompressBytes with normal data (exercises MAX_DECOMPRESS_SIZE path)", () => {
  it("decompresses normal data successfully (size within limit)", async () => {
    const text = "AAAA".repeat(500);
    const encoded = new TextEncoder().encode(text);
    const compressed = await compressBytes(encoded, "gzip");
    const decompressed = await decompressBytes(compressed, "gzip");
    expect(new TextDecoder().decode(decompressed)).toBe(text);
  });
});

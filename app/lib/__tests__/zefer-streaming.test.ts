import { describe, it, expect } from "vitest";
import { encodeZefer, decodeZefer } from "../zefer";
import { chunkedEncryptBlob } from "../chunked-crypto";

const ITER = 1000;

/** Build a binary blob from raw byte arrays (cast — Uint8Array is a BlobPart). */
function blobOf(...parts: Uint8Array[]): Blob {
  return new Blob(parts as unknown as BlobPart[]);
}

function u32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, false);
  return b;
}

/** Assemble a ZEFB3 file whose encrypted payload is exactly `payload` bytes. */
async function assembleZefb3(payload: Uint8Array, key: string, mode = "file"): Promise<Blob> {
  const enc = await chunkedEncryptBlob(blobOf(payload), key, ITER);
  const header = JSON.stringify({ iterations: ITER, compression: "none", hint: null, note: null, mode });
  const headerBytes = new TextEncoder().encode(header);
  return blobOf(
    new Uint8Array([0x5a, 0x45, 0x46, 0x42, 0x33]),
    u32(headerBytes.length),
    headerBytes,
    enc.salt,
    enc.baseIv,
    ...enc.chunks
  );
}

describe("decodeZefer streaming (fileBlob) path", () => {
  it("decodes text mode via the streaming Blob path", async () => {
    const zefer = await encodeZefer({
      content: "hello streaming world",
      passphrase: "pass123",
      fileName: null,
      expiresAt: 0,
      iterations: ITER,
    });
    const r = await decodeZefer("", "pass123", { fileBlob: zefer });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.header.mode).toBe("text");
      expect(r.payload.content).toBe("hello streaming world");
    }
  });

  it("decodes a ZEFR3 reveal-key file via the streaming Blob path with the reveal key", async () => {
    const zefer = await encodeZefer({
      content: "reveal secret",
      passphrase: "mainpass",
      revealKey: "revealpass",
      fileName: null,
      expiresAt: 0,
      iterations: ITER,
    });
    // Main region fails with the reveal key, so the reveal region is tried next.
    const r = await decodeZefer("", "revealpass", { fileBlob: zefer });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.payload.content).toBe("reveal secret");
  });

  it("returns invalid_format for a non-binary blob", async () => {
    const r = await decodeZefer("", "x", {
      fileBlob: blobOf(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("invalid_format");
  });

  it("returns invalid_format when a binary blob has a corrupt header", async () => {
    const buf = new Uint8Array(9 + 5);
    buf.set([0x5a, 0x45, 0x46, 0x42, 0x33], 0); // ZEFB3 magic
    new DataView(buf.buffer).setUint32(5, 5, false); // headerLen = 5
    buf.set([0x7b, 0x22, 0x78, 0x22, 0x3a], 9); // '{"x":' — invalid JSON
    const r = await decodeZefer("", "x", { fileBlob: blobOf(buf) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("invalid_format");
  });

  it("returns invalid_format for a blob smaller than the 9-byte preamble", async () => {
    const r = await decodeZefer("", "x", { fileBlob: blobOf(new Uint8Array([1, 2, 3])) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("invalid_format");
  });

  it("defaults a missing header.mode to 'file' and rejects an undersized region", async () => {
    // Header without a "mode" field exercises the mode-defaulting branch.
    const header = JSON.stringify({ iterations: ITER, compression: "none", hint: null, note: null });
    const headerBytes = new TextEncoder().encode(header);
    const r = await decodeZefer("", "x", {
      fileBlob: blobOf(
        new Uint8Array([0x5a, 0x45, 0x46, 0x42, 0x33]),
        u32(headerBytes.length),
        headerBytes,
        new Uint8Array(10) // region < 44 bytes (salt+iv)
      ),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("wrong_passphrase");
  });

  it("rejects when the decrypted payload is smaller than the 4-byte meta prefix", async () => {
    const blob = await assembleZefb3(new Uint8Array([1, 2]), "k");
    const r = await decodeZefer("", "k", { fileBlob: blob });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("wrong_passphrase");
  });

  it("rejects when the decrypted payload is valid JSON but not valid metadata", async () => {
    // metaLength = 2, payload "{}" → parses but isValidMeta() is false.
    const payload = new Uint8Array([0, 0, 0, 2, 0x7b, 0x7d]);
    const blob = await assembleZefb3(payload, "k");
    const r = await decodeZefer("", "k", { fileBlob: blob });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("wrong_passphrase");
  });

  it("rejects when decryption succeeds but the payload is not valid metadata", async () => {
    // Encrypt garbage whose first 4 bytes (metaLength) exceed the payload size,
    // so extractPayloadBlob finds no valid meta even though AES-GCM succeeds.
    const garbage = blobOf(new Uint8Array([255, 255, 255, 255, 1, 2, 3, 4]));
    const enc = await chunkedEncryptBlob(garbage, "k", ITER);
    const header = JSON.stringify({ iterations: ITER, compression: "none", hint: null, note: null, mode: "file" });
    const headerBytes = new TextEncoder().encode(header);
    const headerLen = new Uint8Array(4);
    new DataView(headerLen.buffer).setUint32(0, headerBytes.length, false);
    const r = await decodeZefer("", "k", {
      fileBlob: blobOf(
        new Uint8Array([0x5a, 0x45, 0x46, 0x42, 0x33]),
        headerLen,
        headerBytes,
        enc.salt,
        enc.baseIv,
        ...enc.chunks
      ),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("wrong_passphrase");
  });
});

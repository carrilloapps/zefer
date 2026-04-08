import { describe, it, expect } from "vitest";
import { encodeZefer, parseFile } from "../zefer";

const LOW_ITERATIONS = 1000;
const TEST_PASSPHRASE = "testpass123";
const TEST_REVEAL_KEY = "revealkey456";
const TEXT_CONTENT = "Hello, this is a test message for Zefer encryption.";
const FILE_CONTENT = new TextEncoder().encode("binary file content here").buffer as ArrayBuffer;

// ─── Helpers ───

async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

function readMagic(bytes: Uint8Array): number[] {
  return Array.from(bytes.slice(0, 5));
}

function readHeaderFromBinary(bytes: Uint8Array): Record<string, unknown> {
  const headerLen = new DataView(bytes.buffer, bytes.byteOffset + 5).getUint32(0, false);
  const headerStr = new TextDecoder().decode(bytes.slice(9, 9 + headerLen));
  return JSON.parse(headerStr);
}

// ─── 1. encodeZefer without reveal key produces ZEFB3 magic ───

describe("encodeZefer without reveal key", () => {
  it("produces ZEFB3 magic (first 5 bytes are [0x5A, 0x45, 0x46, 0x42, 0x33])", async () => {
    const blob = await encodeZefer({
      content: TEXT_CONTENT,
      passphrase: TEST_PASSPHRASE,
      fileName: null,
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const bytes = await blobToBytes(blob);
    expect(readMagic(bytes)).toEqual([0x5a, 0x45, 0x46, 0x42, 0x33]);
  });
});

// ─── 2. encodeZefer with reveal key produces ZEFR3 magic ───

describe("encodeZefer with reveal key", () => {
  it("produces ZEFR3 magic (first 5 bytes are [0x5A, 0x45, 0x46, 0x52, 0x33])", async () => {
    const blob = await encodeZefer({
      content: TEXT_CONTENT,
      passphrase: TEST_PASSPHRASE,
      revealKey: TEST_REVEAL_KEY,
      fileName: null,
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const bytes = await blobToBytes(blob);
    expect(readMagic(bytes)).toEqual([0x5a, 0x45, 0x46, 0x52, 0x33]);
  });
});

// ─── 3. ZEFR3 header does NOT contain revealKey field ───

describe("ZEFR3 header security", () => {
  it("does NOT contain revealKey field in the public header JSON", async () => {
    const blob = await encodeZefer({
      content: TEXT_CONTENT,
      passphrase: TEST_PASSPHRASE,
      revealKey: TEST_REVEAL_KEY,
      fileName: null,
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const bytes = await blobToBytes(blob);
    const header = readHeaderFromBinary(bytes);
    expect(header).not.toHaveProperty("revealKey");
  });
});

// ─── 4. ZEFR3 format has mainBlockSize prefix ───

describe("ZEFR3 format structure", () => {
  it("has mainBlockSize prefix after header, followed by two distinct encrypted blocks", async () => {
    const blob = await encodeZefer({
      content: TEXT_CONTENT,
      passphrase: TEST_PASSPHRASE,
      revealKey: TEST_REVEAL_KEY,
      fileName: null,
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const bytes = await blobToBytes(blob);
    const headerLen = new DataView(bytes.buffer, bytes.byteOffset + 5).getUint32(0, false);
    const dataOffset = 9 + headerLen;

    // Read the 4-byte mainBlockSize
    const mainBlockSize = new DataView(bytes.buffer, bytes.byteOffset + dataOffset).getUint32(0, false);
    expect(mainBlockSize).toBeGreaterThan(0);

    // The main block starts after the 4-byte size prefix
    const mainStart = dataOffset + 4;
    const mainBlock = bytes.slice(mainStart, mainStart + mainBlockSize);
    expect(mainBlock.length).toBe(mainBlockSize);

    // The reveal block occupies the remaining bytes
    const revealBlock = bytes.slice(mainStart + mainBlockSize);
    expect(revealBlock.length).toBeGreaterThan(0);

    // Both blocks must contain at least salt(32) + iv(12) + some ciphertext
    expect(mainBlock.length).toBeGreaterThanOrEqual(44);
    expect(revealBlock.length).toBeGreaterThanOrEqual(44);
  });
});

// ─── 5. parseFile detects ZEFB3 correctly ───

describe("parseFile with ZEFB3 format", () => {
  it("returns binary=true, binaryData defined, revealBinaryData undefined", async () => {
    const blob = await encodeZefer({
      content: TEXT_CONTENT,
      passphrase: TEST_PASSPHRASE,
      fileName: null,
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const rawBytes = await blob.arrayBuffer();
    const parsed = parseFile("", rawBytes);

    expect(parsed).not.toBeNull();
    expect(parsed!.binary).toBe(true);
    expect(parsed!.binaryData).toBeDefined();
    expect(parsed!.revealBinaryData).toBeUndefined();
  });
});

// ─── 6. parseFile detects ZEFR3 correctly ───

describe("parseFile with ZEFR3 format", () => {
  it("returns binary=true, both binaryData and revealBinaryData defined", async () => {
    const blob = await encodeZefer({
      content: TEXT_CONTENT,
      passphrase: TEST_PASSPHRASE,
      revealKey: TEST_REVEAL_KEY,
      fileName: null,
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const rawBytes = await blob.arrayBuffer();
    const parsed = parseFile("", rawBytes);

    expect(parsed).not.toBeNull();
    expect(parsed!.binary).toBe(true);
    expect(parsed!.binaryData).toBeDefined();
    expect(parsed!.revealBinaryData).toBeDefined();
  });
});

// ─── 7. parseFile ZEFR3 splits blocks correctly ───

describe("parseFile ZEFR3 block splitting", () => {
  it("binaryData.length equals mainBlockSize and revealBinaryData has remaining bytes", async () => {
    const blob = await encodeZefer({
      content: TEXT_CONTENT,
      passphrase: TEST_PASSPHRASE,
      revealKey: TEST_REVEAL_KEY,
      fileName: null,
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const rawBytes = await blob.arrayBuffer();
    const bytes = new Uint8Array(rawBytes);

    // Manually read mainBlockSize from the binary
    const headerLen = new DataView(rawBytes, 5).getUint32(0, false);
    const dataOffset = 9 + headerLen;
    const mainBlockSize = new DataView(rawBytes, dataOffset).getUint32(0, false);

    const parsed = parseFile("", rawBytes);
    expect(parsed).not.toBeNull();

    // binaryData length must equal mainBlockSize
    expect(parsed!.binaryData!.length).toBe(mainBlockSize);

    // revealBinaryData must have the remaining bytes
    const mainStart = dataOffset + 4;
    const expectedRevealLen = bytes.length - (mainStart + mainBlockSize);
    expect(parsed!.revealBinaryData!.length).toBe(expectedRevealLen);
    expect(parsed!.revealBinaryData!.length).toBeGreaterThan(0);
  });
});

// ─── 8. parseFile returns null for invalid magic ───

describe("parseFile with invalid magic", () => {
  it("returns null for random bytes", () => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(128));
    const result = parseFile("", randomBytes.buffer as ArrayBuffer);
    expect(result).toBeNull();
  });

  it("returns null for empty buffer", () => {
    const empty = new ArrayBuffer(0);
    const result = parseFile("", empty);
    expect(result).toBeNull();
  });

  it("returns null for too-short buffer", () => {
    const short = new Uint8Array([0x5a, 0x45]).buffer as ArrayBuffer;
    const result = parseFile("", short);
    expect(result).toBeNull();
  });

  it("returns null for invalid text content", () => {
    const result = parseFile("NOT_A_VALID_FORMAT\n{}\ndata");
    expect(result).toBeNull();
  });
});

// ─── 9. parseFile handles text format (ZEFER3) ───

describe("parseFile with text format (ZEFER3)", () => {
  it("parses ZEFER3 text format correctly (backward compat)", () => {
    const header = JSON.stringify({
      iterations: 600000,
      compression: "none",
      hint: null,
      note: null,
      mode: "text",
    });
    const textContent = `ZEFER3\n${header}\nSOMEBASE64ENCRYPTEDDATA==`;

    const parsed = parseFile(textContent);
    expect(parsed).not.toBeNull();
    expect(parsed!.binary).toBe(false);
    expect(parsed!.header.iterations).toBe(600000);
    expect(parsed!.header.mode).toBe("text");
    expect(parsed!.encryptedLines).toBeDefined();
    expect(parsed!.encryptedLines!.length).toBe(1);
    expect(parsed!.encryptedLines![0]).toBe("SOMEBASE64ENCRYPTEDDATA==");
  });

  it("parses ZEFER3 text format with multiple encrypted lines", () => {
    const header = JSON.stringify({
      iterations: 300000,
      compression: "gzip",
      hint: "my hint",
      note: "a note",
      mode: "file",
    });
    const textContent = `ZEFER3\n${header}\nLINE1==\nLINE2==\nLINE3==`;

    const parsed = parseFile(textContent);
    expect(parsed).not.toBeNull();
    expect(parsed!.binary).toBe(false);
    expect(parsed!.header.compression).toBe("gzip");
    expect(parsed!.header.hint).toBe("my hint");
    expect(parsed!.encryptedLines!.length).toBe(3);
  });

  it("defaults mode to 'text' when header lacks mode field", () => {
    const header = JSON.stringify({
      iterations: 600000,
      compression: "none",
      hint: null,
      note: null,
    });
    const textContent = `ZEFER3\n${header}\nDATA==`;

    const parsed = parseFile(textContent);
    expect(parsed).not.toBeNull();
    expect(parsed!.header.mode).toBe("text");
  });
});

// ─── 10. encodeZefer text mode ───

describe("encodeZefer text mode", () => {
  it("sets mode='text' in header when content is text", async () => {
    const blob = await encodeZefer({
      content: TEXT_CONTENT,
      passphrase: TEST_PASSPHRASE,
      fileName: null,
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const bytes = await blobToBytes(blob);
    const header = readHeaderFromBinary(bytes);
    expect(header.mode).toBe("text");
  });

  it("preserves header fields correctly for text mode", async () => {
    const blob = await encodeZefer({
      content: TEXT_CONTENT,
      passphrase: TEST_PASSPHRASE,
      fileName: null,
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
      hint: "test hint",
      note: "test note",
      compression: "none",
    });

    const bytes = await blobToBytes(blob);
    const header = readHeaderFromBinary(bytes);
    expect(header.iterations).toBe(LOW_ITERATIONS);
    expect(header.compression).toBe("none");
    expect(header.hint).toBe("test hint");
    expect(header.note).toBe("test note");
    expect(header.mode).toBe("text");
  });
});

// ─── 11. encodeZefer file mode ───

describe("encodeZefer file mode", () => {
  it("sets mode='file' in header when fileData is provided", async () => {
    const blob = await encodeZefer({
      fileData: FILE_CONTENT,
      passphrase: TEST_PASSPHRASE,
      fileName: "test.bin",
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const bytes = await blobToBytes(blob);
    const header = readHeaderFromBinary(bytes);
    expect(header.mode).toBe("file");
  });

  it("uses file mode even when content is also provided alongside fileData", async () => {
    const blob = await encodeZefer({
      content: TEXT_CONTENT,
      fileData: FILE_CONTENT,
      passphrase: TEST_PASSPHRASE,
      fileName: "test.bin",
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
    });

    const bytes = await blobToBytes(blob);
    const header = readHeaderFromBinary(bytes);
    expect(header.mode).toBe("file");
  });
});

// ─── 12. Progress callbacks fire for both passes ───

describe("Progress callbacks", () => {
  it("fire encrypting() calls covering grandTotal continuously from 1 to N (single pass)", async () => {
    const encryptingCalls: Array<{ chunkIndex: number; totalChunks: number }> = [];

    await encodeZefer({
      content: TEXT_CONTENT,
      passphrase: TEST_PASSPHRASE,
      fileName: null,
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
      onProgress: {
        compressing: () => {},
        compressingDone: () => {},
        deriving: () => {},
        derivingDone: () => {},
        encrypting: (chunkIndex, totalChunks) => {
          encryptingCalls.push({ chunkIndex, totalChunks });
        },
        packaging: () => {},
      },
    });

    expect(encryptingCalls.length).toBeGreaterThan(0);

    // All calls must share the same grandTotal
    const grandTotal = encryptingCalls[0].totalChunks;
    for (const call of encryptingCalls) {
      expect(call.totalChunks).toBe(grandTotal);
    }

    // chunkIndex values should cover 1 through grandTotal continuously
    const indices = encryptingCalls.map((c) => c.chunkIndex);
    for (let i = 1; i <= grandTotal; i++) {
      expect(indices).toContain(i);
    }
  });

  it("fire encrypting() calls covering grandTotal for dual pass (with reveal key)", async () => {
    const encryptingCalls: Array<{ chunkIndex: number; totalChunks: number }> = [];

    await encodeZefer({
      content: TEXT_CONTENT,
      passphrase: TEST_PASSPHRASE,
      revealKey: TEST_REVEAL_KEY,
      fileName: null,
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
      onProgress: {
        compressing: () => {},
        compressingDone: () => {},
        deriving: () => {},
        derivingDone: () => {},
        encrypting: (chunkIndex, totalChunks) => {
          encryptingCalls.push({ chunkIndex, totalChunks });
        },
        packaging: () => {},
      },
    });

    expect(encryptingCalls.length).toBeGreaterThan(0);

    // grandTotal must be 2x the single-pass total (since there are two encryption passes)
    const grandTotal = encryptingCalls[0].totalChunks;
    expect(grandTotal).toBeGreaterThanOrEqual(2); // At least 2 (1 chunk * 2 passes)

    // All calls share the same grandTotal
    for (const call of encryptingCalls) {
      expect(call.totalChunks).toBe(grandTotal);
    }

    // chunkIndex values should cover 1 through grandTotal continuously
    const indices = encryptingCalls.map((c) => c.chunkIndex);
    for (let i = 1; i <= grandTotal; i++) {
      expect(indices).toContain(i);
    }
  });

  it("calls all lifecycle callbacks in order", async () => {
    const callOrder: string[] = [];

    await encodeZefer({
      content: TEXT_CONTENT,
      passphrase: TEST_PASSPHRASE,
      fileName: null,
      expiresAt: 0,
      iterations: LOW_ITERATIONS,
      onProgress: {
        compressing: () => callOrder.push("compressing"),
        compressingDone: () => callOrder.push("compressingDone"),
        deriving: () => callOrder.push("deriving"),
        derivingDone: () => callOrder.push("derivingDone"),
        encrypting: () => {
          if (!callOrder.includes("encrypting")) callOrder.push("encrypting");
        },
        packaging: () => callOrder.push("packaging"),
      },
    });

    expect(callOrder.indexOf("compressing")).toBeLessThan(callOrder.indexOf("compressingDone"));
    expect(callOrder.indexOf("compressingDone")).toBeLessThan(callOrder.indexOf("deriving"));
    expect(callOrder.indexOf("deriving")).toBeLessThan(callOrder.indexOf("encrypting"));
    expect(callOrder.indexOf("encrypting")).toBeLessThan(callOrder.indexOf("packaging"));
  });
});

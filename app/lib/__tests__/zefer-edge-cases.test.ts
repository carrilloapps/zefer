import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { decodeZefer, parseFile } from "../zefer";
import { encrypt, encryptBytesToBase64, hashAnswer } from "../crypto";

const LOW_ITERATIONS = 1000;

// ─── Helpers ───

function buildTextFile(headerObj: Record<string, unknown>, ...encryptedLines: string[]): string {
  return `ZEFER3\n${JSON.stringify(headerObj)}\n${encryptedLines.join("\n")}`;
}

const defaultHeader = {
  iterations: LOW_ITERATIONS,
  compression: "none",
  hint: null,
  note: null,
  mode: "text",
};

/**
 * Build a ZEFER3-format encrypted payload using the current v3 length-prefix
 * layout. Returns a single base64 encrypted line ready to embed in a text file.
 */
async function buildV3EncryptedLine(
  passphrase: string,
  metaOverrides: Record<string, unknown> = {},
  contentText: string = "hello world"
): Promise<string> {
  const meta = {
    v: 3,
    fileName: null,
    fileType: null,
    fileSize: 0,
    expiresAt: 0,
    createdAt: Date.now(),
    answerHash: null,
    allowedIps: [],
    question: null,
    maxAttempts: 0,
    ...metaOverrides,
  };
  const contentBytes = new TextEncoder().encode(contentText);
  const metaBytes = new TextEncoder().encode(JSON.stringify(meta));
  const lengthPrefix = new Uint8Array(4);
  new DataView(lengthPrefix.buffer).setUint32(0, metaBytes.length, false);
  const combined = new Uint8Array(4 + metaBytes.length + contentBytes.length);
  combined.set(lengthPrefix, 0);
  combined.set(metaBytes, 4);
  combined.set(contentBytes, 4 + metaBytes.length);

  return encryptBytesToBase64(combined.buffer as ArrayBuffer, passphrase, LOW_ITERATIONS);
}

// ─────────────────────────────────────────────────────────
// Test 1: parseFile with corrupted binary header JSON
// Covers line 275 — catch block in binary header parsing
// ─────────────────────────────────────────────────────────

describe("parseFile with corrupted binary header JSON", () => {
  it("returns null when binary header has valid magic+length but invalid JSON", () => {
    // ZEFB3 magic: 0x5A 0x45 0x46 0x42 0x33
    const magic = new Uint8Array([0x5a, 0x45, 0x46, 0x42, 0x33]);
    // Header length = 10 (will point to 10 garbage bytes)
    const headerLenBuf = new Uint8Array(4);
    new DataView(headerLenBuf.buffer).setUint32(0, 10, false);
    // 10 bytes of garbage (not valid JSON)
    const garbage = new Uint8Array([0xff, 0xfe, 0xfd, 0xfc, 0xfb, 0xfa, 0xf9, 0xf8, 0xf7, 0xf6]);

    const total = new Uint8Array(magic.length + headerLenBuf.length + garbage.length);
    total.set(magic, 0);
    total.set(headerLenBuf, magic.length);
    total.set(garbage, magic.length + headerLenBuf.length);

    const result = parseFile("", total.buffer as ArrayBuffer);
    expect(result).toBeNull();
  });
});

describe("parseFile with text format invalid JSON header", () => {
  it("returns null when ZEFER3 text header is not valid JSON (line 290)", () => {
    const result = parseFile("ZEFER3\n{invalid json here\nSOMEDATA==");
    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────
// Test 2-3: Text format (ZEFER3) encode + decode roundtrip
// Covers lines 294-307 (tryDecryptText) and 426-428 (else if branch)
// ─────────────────────────────────────────────────────────

describe("Text format (ZEFER3) decryption via tryDecryptText", () => {
  it("decrypts a manually built ZEFER3 text file successfully", async () => {
    const encryptedLine = await buildV3EncryptedLine("testpass", {}, "hello world");
    const textFile = buildTextFile(defaultHeader, encryptedLine);

    const result = await decodeZefer(textFile, "testpass");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.content).toBe("hello world");
      expect(result.payload.meta.v).toBe(3);
    }
  });

  it("returns correct metadata from text format decryption", async () => {
    const encryptedLine = await buildV3EncryptedLine("testpass", {
      fileName: "report.txt",
      expiresAt: 0,
    }, "metadata test");
    const textFile = buildTextFile(defaultHeader, encryptedLine);

    const result = await decodeZefer(textFile, "testpass");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.meta.fileName).toBe("report.txt");
      expect(result.payload.content).toBe("metadata test");
      expect(result.header.mode).toBe("text");
    }
  });
});

// ─────────────────────────────────────────────────────────
// Test 4: Text format with wrong passphrase
// Covers the catch { continue } and return null paths in tryDecryptText
// ─────────────────────────────────────────────────────────

describe("Text format with wrong passphrase", () => {
  it("returns wrong_passphrase error when passphrase is incorrect", async () => {
    const encryptedLine = await buildV3EncryptedLine("correctpass", {}, "secret");
    const textFile = buildTextFile(defaultHeader, encryptedLine);

    const result = await decodeZefer(textFile, "wrongpass");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("wrong_passphrase");
    }
  });
});

// ─────────────────────────────────────────────────────────
// Test 5: Text format with multiple encrypted lines (first fails, second succeeds)
// Covers the catch { continue } loop in tryDecryptText (line 303-304)
// ─────────────────────────────────────────────────────────

describe("Text format with multiple encrypted lines", () => {
  it("succeeds by finding the second valid line after the first fails", async () => {
    // First line encrypted with a different passphrase
    const wrongLine = await buildV3EncryptedLine("otherpass", {}, "wrong content");
    // Second line encrypted with the correct passphrase
    const correctLine = await buildV3EncryptedLine("rightpass", {}, "correct content");

    const textFile = buildTextFile(defaultHeader, wrongLine, correctLine);

    const result = await decodeZefer(textFile, "rightpass");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.content).toBe("correct content");
    }
  });
});

// ─────────────────────────────────────────────────────────
// Test 5b: Null-byte separator legacy format
// Covers lines 349-356 — extractPayload null-byte separator fallback
// ─────────────────────────────────────────────────────────

describe("Null-byte separator legacy format in extractPayload", () => {
  it("decodes a payload using null-byte separator between meta JSON and content", async () => {
    // Build a payload where meta JSON and content are separated by a 0x00 byte.
    // The first 4 bytes must NOT be a valid length-prefix (so the length-prefix check fails
    // and we fall through to the null-byte separator check).
    const meta = {
      v: 3,
      fileName: "nullsep.txt",
      fileType: null,
      fileSize: 0,
      expiresAt: 0,
      createdAt: Date.now(),
      answerHash: null,
      allowedIps: [],
      question: null,
      maxAttempts: 0,
    };
    const metaStr = JSON.stringify(meta);
    const metaBytes = new TextEncoder().encode(metaStr);
    const contentBytes = new TextEncoder().encode("null-sep content");
    // Combine: metaJSON + 0x00 + content (no length prefix)
    const combined = new Uint8Array(metaBytes.length + 1 + contentBytes.length);
    combined.set(metaBytes, 0);
    combined[metaBytes.length] = 0x00;
    combined.set(contentBytes, metaBytes.length + 1);

    const encryptedLine = await encryptBytesToBase64(
      combined.buffer as ArrayBuffer,
      "testpass",
      LOW_ITERATIONS
    );
    const textFile = buildTextFile(defaultHeader, encryptedLine);

    const result = await decodeZefer(textFile, "testpass");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.content).toBe("null-sep content");
      expect(result.payload.meta.fileName).toBe("nullsep.txt");
      expect(result.payload.meta.v).toBe(3);
    }
  });
});

// ─────────────────────────────────────────────────────────
// Test 6: ZEFER2 legacy format fallback
// Covers lines 362-374 — extractPayload ZEFER2 JSON fallback
// (Line 365's decompress branch is unreachable because extractPayload's
// ZEFER2 decompression conflicts with decodeZefer's outer decompression
// on lines 469-471, causing double-decompression failure.)
// ─────────────────────────────────────────────────────────

describe("ZEFER2 legacy format fallback in extractPayload", () => {
  it("decodes a legacy ZEFER2-style JSON payload", async () => {
    // Build a raw JSON string matching the old ZEFER2 format (no length-prefix, no null separator)
    const legacyContent = JSON.stringify({
      content: "legacy data",
      expiresAt: 0,
      createdAt: 1000,
      answerHash: null,
      allowedIps: [],
      question: null,
      maxAttempts: 0,
      fileName: "old.txt",
    });

    // encrypt() encodes a plaintext string, so the decrypted bytes will be the raw JSON string
    const encryptedLine = await encrypt(legacyContent, "testpass", LOW_ITERATIONS);
    const textFile = buildTextFile(defaultHeader, encryptedLine);

    const result = await decodeZefer(textFile, "testpass");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.content).toBe("legacy data");
      expect(result.payload.meta.v).toBe(3);
      expect(result.payload.meta.fileName).toBe("old.txt");
      expect(result.payload.meta.createdAt).toBe(1000);
      expect(result.payload.meta.expiresAt).toBe(0);
    }
  });
});

// ─────────────────────────────────────────────────────────
// Test 7: ZEFER2 fallback catch — decryption succeeds but payload is not valid JSON
// Covers line 375 — the catch block in extractPayload's ZEFER2 try
// ─────────────────────────────────────────────────────────

describe("ZEFER2 fallback catch (invalid payload after successful decryption)", () => {
  it("returns wrong_passphrase when decrypted data is not valid JSON and has no length-prefix", async () => {
    // Encrypt arbitrary non-JSON text. When decrypted, it won't match any extractPayload format.
    const encryptedLine = await encrypt("not json at all {{{", "testpass", LOW_ITERATIONS);
    const textFile = buildTextFile(defaultHeader, encryptedLine);

    // Use the correct passphrase so decryption succeeds, but extractPayload returns null
    // because the decrypted bytes are not valid ZEFER3 (no length-prefix) and not valid ZEFER2 JSON.
    const result = await decodeZefer(textFile, "testpass");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("wrong_passphrase");
    }
  });
});

// ─────────────────────────────────────────────────────────
// Tests 8-10: localStorage tests for maxAttempts
// Covers lines 441-447, 454-458, 464
// ─────────────────────────────────────────────────────────

describe("maxAttempts with localStorage tracking", () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, val: string) => {
        storage[key] = val;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Test 8: maxAttempts exceeded — lines 445-447
  it("returns max_attempts error when attempts have been exhausted", async () => {
    const encryptedLine = await buildV3EncryptedLine("testpass", {
      maxAttempts: 2,
    }, "protected content");

    const textFile = buildTextFile(defaultHeader, encryptedLine);

    // Pre-populate localStorage with the attempt key matching the first encrypted line
    // The attempt key is: `zefer_attempts_${encryptedLines[0].substring(0, 40)}`
    const attemptKey = `zefer_attempts_${encryptedLine.substring(0, 40)}`;
    storage[attemptKey] = "2"; // Already at max

    const result = await decodeZefer(textFile, "testpass");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("max_attempts");
    }
  });

  // Test 9: Wrong answer increments attempt counter — lines 454-458
  it("increments attempt counter in localStorage on wrong answer", async () => {
    const correctAnswer = "blue";
    const ansHash = await hashAnswer(correctAnswer);

    const encryptedLine = await buildV3EncryptedLine("testpass", {
      maxAttempts: 3,
      question: "What color is the sky?",
      answerHash: ansHash,
    }, "answer-protected content");

    const textFile = buildTextFile(defaultHeader, encryptedLine);

    const attemptKey = `zefer_attempts_${encryptedLine.substring(0, 40)}`;

    // Decrypt with wrong answer
    const result = await decodeZefer(textFile, "testpass", {
      questionAnswer: "red",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("wrong_answer");
    }

    // Verify localStorage was incremented
    expect(storage[attemptKey]).toBe("1");
  });

  // Test 10: Successful decrypt clears attempts — line 464
  it("clears attempt counter in localStorage after successful decryption", async () => {
    const correctAnswer = "blue";
    const ansHash = await hashAnswer(correctAnswer);

    const encryptedLine = await buildV3EncryptedLine("testpass", {
      maxAttempts: 3,
      question: "What color is the sky?",
      answerHash: ansHash,
    }, "protected content");

    const textFile = buildTextFile(defaultHeader, encryptedLine);

    const attemptKey = `zefer_attempts_${encryptedLine.substring(0, 40)}`;
    // Pre-set some existing attempts
    storage[attemptKey] = "1";

    // Decrypt with correct answer
    const result = await decodeZefer(textFile, "testpass", {
      questionAnswer: "blue",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.content).toBe("protected content");
    }

    // Verify localStorage key was removed
    expect(storage[attemptKey]).toBeUndefined();
  });
});

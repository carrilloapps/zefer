import { describe, it, expect } from "vitest";
import {
  encrypt,
  decrypt,
  encryptBytesToBase64,
  decryptFromBase64,
  encryptRaw,
  combineDualKeys,
  hashAnswer,
  toBase64,
  fromBase64,
  decryptFromBinary,
  benchmarkDevice,
} from "../crypto";

const FAST_ITERATIONS = 1000;

describe("toBase64 + fromBase64 roundtrip", () => {
  it("should roundtrip binary data", () => {
    const original = new Uint8Array([0, 1, 2, 127, 128, 255, 42, 99]);
    const b64 = toBase64(original.buffer as ArrayBuffer);
    const recovered = fromBase64(b64);
    expect(Array.from(recovered)).toEqual(Array.from(original));
  });

  it("should roundtrip an empty buffer", () => {
    const original = new Uint8Array([]);
    const b64 = toBase64(original.buffer as ArrayBuffer);
    const recovered = fromBase64(b64);
    expect(recovered.byteLength).toBe(0);
  });

  it("should roundtrip a large buffer", () => {
    const original = new Uint8Array(10_000);
    for (let i = 0; i < original.length; i++) {
      original[i] = i % 256;
    }
    const b64 = toBase64(original.buffer as ArrayBuffer);
    const recovered = fromBase64(b64);
    expect(Array.from(recovered)).toEqual(Array.from(original));
  });
});

describe("encrypt + decrypt roundtrip", () => {
  it("should encrypt and decrypt text to produce identical output", async () => {
    const plaintext = "Hello, Zefer! This is a test message.";
    const passphrase = "testpassword123";

    const encrypted = await encrypt(plaintext, passphrase, FAST_ITERATIONS);
    const decrypted = await decrypt(encrypted, passphrase, FAST_ITERATIONS);

    expect(decrypted).toBe(plaintext);
  });

  it("should handle empty string", async () => {
    const plaintext = "";
    const passphrase = "mypass123";

    const encrypted = await encrypt(plaintext, passphrase, FAST_ITERATIONS);
    const decrypted = await decrypt(encrypted, passphrase, FAST_ITERATIONS);

    expect(decrypted).toBe(plaintext);
  });

  it("should handle unicode text", async () => {
    const plaintext = "こんにちは世界 🌍 Ñoño café résumé";
    const passphrase = "unicode-pass";

    const encrypted = await encrypt(plaintext, passphrase, FAST_ITERATIONS);
    const decrypted = await decrypt(encrypted, passphrase, FAST_ITERATIONS);

    expect(decrypted).toBe(plaintext);
  });
});

describe("encryptBytesToBase64 + decryptFromBase64 roundtrip", () => {
  it("should roundtrip binary data", async () => {
    const original = new Uint8Array([10, 20, 30, 0, 255, 128, 64]);
    const passphrase = "binarytest";

    const encrypted = await encryptBytesToBase64(
      original.buffer as ArrayBuffer,
      passphrase,
      FAST_ITERATIONS
    );
    const decryptedBuf = await decryptFromBase64(
      encrypted,
      passphrase,
      FAST_ITERATIONS
    );

    const decrypted = new Uint8Array(decryptedBuf);
    expect(Array.from(decrypted)).toEqual(Array.from(original));
  });

  it("should produce a dot-separated base64 string with 3 parts", async () => {
    const data = new Uint8Array([1, 2, 3]);
    const encrypted = await encryptBytesToBase64(
      data.buffer as ArrayBuffer,
      "pass",
      FAST_ITERATIONS
    );

    const parts = encrypted.split(".");
    expect(parts).toHaveLength(3);
    // Each part should be valid base64
    for (const part of parts) {
      expect(() => atob(part)).not.toThrow();
    }
  });
});

describe("encryptRaw", () => {
  it("should return salt (32 bytes), iv (12 bytes), and ciphertext", async () => {
    const data = new TextEncoder().encode("raw test data");

    const result = await encryptRaw(
      data.buffer as ArrayBuffer,
      "rawpass",
      FAST_ITERATIONS
    );

    expect(result.salt).toBeInstanceOf(Uint8Array);
    expect(result.salt.byteLength).toBe(32);

    expect(result.iv).toBeInstanceOf(Uint8Array);
    expect(result.iv.byteLength).toBe(12);

    expect(result.ciphertext).toBeInstanceOf(ArrayBuffer);
    expect(result.ciphertext.byteLength).toBeGreaterThan(0);
  });

  it("should produce ciphertext larger than plaintext (due to auth tag)", async () => {
    const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
    const result = await encryptRaw(
      plaintext.buffer as ArrayBuffer,
      "pass",
      FAST_ITERATIONS
    );

    // AES-GCM adds a 16-byte authentication tag
    expect(result.ciphertext.byteLength).toBe(plaintext.byteLength + 16);
  });
});

describe("decrypt with wrong passphrase", () => {
  it("should throw when decrypting with a wrong passphrase", async () => {
    const encrypted = await encrypt(
      "secret data",
      "correct-password",
      FAST_ITERATIONS
    );

    await expect(
      decrypt(encrypted, "wrong-password", FAST_ITERATIONS)
    ).rejects.toThrow();
  });
});

describe("decrypt with wrong iterations", () => {
  it("should throw when decrypting with wrong iteration count", async () => {
    const encrypted = await encrypt(
      "secret data",
      "mypassword",
      FAST_ITERATIONS
    );

    // Use a different iteration count for decryption
    await expect(
      decrypt(encrypted, "mypassword", FAST_ITERATIONS + 1)
    ).rejects.toThrow();
  });
});

describe("combineDualKeys", () => {
  it("should produce the format primary\\x00ZEFER_DUAL\\x00secondary", () => {
    const result = combineDualKeys("alpha", "beta");
    expect(result).toBe("alpha\x00ZEFER_DUAL\x00beta");
  });

  it("should preserve empty strings", () => {
    const result = combineDualKeys("", "second");
    expect(result).toBe("\x00ZEFER_DUAL\x00second");
  });

  it("should handle special characters in keys", () => {
    const result = combineDualKeys("p@ss!", "k3y#");
    expect(result).toBe("p@ss!\x00ZEFER_DUAL\x00k3y#");
  });
});

describe("combineDualKeys produces different key from single", () => {
  it("should fail to decrypt with single passphrase what was encrypted with dual", async () => {
    const primary = "firstpass";
    const secondary = "secondpass";
    const combined = combineDualKeys(primary, secondary);

    const encrypted = await encrypt(
      "dual key secret",
      combined,
      FAST_ITERATIONS
    );

    // Decrypting with just the primary passphrase should fail
    await expect(
      decrypt(encrypted, primary, FAST_ITERATIONS)
    ).rejects.toThrow();

    // Decrypting with just the secondary passphrase should also fail
    await expect(
      decrypt(encrypted, secondary, FAST_ITERATIONS)
    ).rejects.toThrow();

    // Decrypting with the combined key should succeed
    const decrypted = await decrypt(encrypted, combined, FAST_ITERATIONS);
    expect(decrypted).toBe("dual key secret");
  });
});

describe("hashAnswer", () => {
  it("should produce the same hash for the same input", async () => {
    const hash1 = await hashAnswer("mysecretanswer");
    const hash2 = await hashAnswer("mysecretanswer");
    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different inputs", async () => {
    const hash1 = await hashAnswer("answer1");
    const hash2 = await hashAnswer("answer2");
    expect(hash1).not.toBe(hash2);
  });

  it("should return a non-empty base64 string", async () => {
    const hash = await hashAnswer("test");
    expect(hash.length).toBeGreaterThan(0);
    expect(() => atob(hash)).not.toThrow();
  });
});

describe("hashAnswer normalization", () => {
  it('should produce the same hash for "Hello" and "  hello  "', async () => {
    const hash1 = await hashAnswer("Hello");
    const hash2 = await hashAnswer("  hello  ");
    expect(hash1).toBe(hash2);
  });

  it("should normalize mixed case and whitespace", async () => {
    const hash1 = await hashAnswer("My Secret Answer");
    const hash2 = await hashAnswer("  my secret answer  ");
    expect(hash1).toBe(hash2);
  });

  it("should treat different trimmed/lowered strings as different", async () => {
    const hash1 = await hashAnswer("apple");
    const hash2 = await hashAnswer("orange");
    expect(hash1).not.toBe(hash2);
  });
});

describe("Different salts/IVs per encryption", () => {
  it("should produce different salt and iv on two separate calls", async () => {
    const data = new TextEncoder().encode("same input");

    const result1 = await encryptRaw(
      data.buffer as ArrayBuffer,
      "samepass",
      FAST_ITERATIONS
    );
    const result2 = await encryptRaw(
      data.buffer as ArrayBuffer,
      "samepass",
      FAST_ITERATIONS
    );

    // Salt should differ
    const salt1Hex = Array.from(result1.salt)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const salt2Hex = Array.from(result2.salt)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    expect(salt1Hex).not.toBe(salt2Hex);

    // IV should differ
    const iv1Hex = Array.from(result1.iv)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const iv2Hex = Array.from(result2.iv)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    expect(iv1Hex).not.toBe(iv2Hex);
  });

  it("should produce different ciphertext for the same plaintext and passphrase", async () => {
    const plaintext = "identical content";
    const passphrase = "samepass";

    const enc1 = await encrypt(plaintext, passphrase, FAST_ITERATIONS);
    const enc2 = await encrypt(plaintext, passphrase, FAST_ITERATIONS);

    // The full encrypted strings should differ due to random salt/iv
    expect(enc1).not.toBe(enc2);

    // But both should decrypt to the same plaintext
    const dec1 = await decrypt(enc1, passphrase, FAST_ITERATIONS);
    const dec2 = await decrypt(enc2, passphrase, FAST_ITERATIONS);
    expect(dec1).toBe(plaintext);
    expect(dec2).toBe(plaintext);
  });
});

describe("decryptFromBinary", () => {
  it("should decrypt a roundtrip from encryptRaw", async () => {
    const plaintext = "Hello from decryptFromBinary!";
    const passphrase = "binarypassword";
    const data = new TextEncoder().encode(plaintext);

    const { salt, iv, ciphertext } = await encryptRaw(
      data.buffer as ArrayBuffer,
      passphrase,
      FAST_ITERATIONS
    );

    // Concatenate salt (32) + iv (12) + ciphertext into a single Uint8Array
    const ciphertextBytes = new Uint8Array(ciphertext);
    const binary = new Uint8Array(salt.byteLength + iv.byteLength + ciphertextBytes.byteLength);
    binary.set(salt, 0);
    binary.set(iv, salt.byteLength);
    binary.set(ciphertextBytes, salt.byteLength + iv.byteLength);

    const decryptedBuf = await decryptFromBinary(binary, passphrase, FAST_ITERATIONS);
    const decrypted = new TextDecoder().decode(decryptedBuf);

    expect(decrypted).toBe(plaintext);
  });

  it("should throw when decrypting with wrong passphrase", async () => {
    const data = new TextEncoder().encode("secret binary data");
    const passphrase = "correct-pass";

    const { salt, iv, ciphertext } = await encryptRaw(
      data.buffer as ArrayBuffer,
      passphrase,
      FAST_ITERATIONS
    );

    // Concatenate salt (32) + iv (12) + ciphertext into a single Uint8Array
    const ciphertextBytes = new Uint8Array(ciphertext);
    const binary = new Uint8Array(salt.byteLength + iv.byteLength + ciphertextBytes.byteLength);
    binary.set(salt, 0);
    binary.set(iv, salt.byteLength);
    binary.set(ciphertextBytes, salt.byteLength + iv.byteLength);

    await expect(
      decryptFromBinary(binary, "wrong-pass", FAST_ITERATIONS)
    ).rejects.toThrow();
  });
});

describe("benchmarkDevice", () => {
  it("should return a positive finite number", async () => {
    const result = await benchmarkDevice();

    expect(typeof result).toBe("number");
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });
});

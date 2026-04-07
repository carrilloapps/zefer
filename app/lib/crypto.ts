const SALT_LENGTH = 32;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;
const BASE64_CHUNK = 8192;

// ─── Optimized encoding ───

function encode(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer as ArrayBuffer;
}

function decode(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

export function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunks: string[] = [];

  for (let i = 0; i < len; i += BASE64_CHUNK) {
    const slice = bytes.subarray(i, Math.min(i + BASE64_CHUNK, len));
    chunks.push(String.fromCharCode(...slice));
  }

  return btoa(chunks.join(""));
}

export function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);

  const aligned = len & ~3;
  for (let i = 0; i < aligned; i += 4) {
    bytes[i] = binary.charCodeAt(i);
    bytes[i + 1] = binary.charCodeAt(i + 1);
    bytes[i + 2] = binary.charCodeAt(i + 2);
    bytes[i + 3] = binary.charCodeAt(i + 3);
  }
  for (let i = aligned; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

// ─── Key derivation ───

async function deriveKey(
  passphrase: string,
  salt: ArrayBuffer,
  iterations: number
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

// ─── Public API ───

export function combineDualKeys(primary: string, secondary: string): string {
  return `${primary}\x00ZEFER_DUAL\x00${secondary}`;
}

export async function encrypt(
  plaintext: string,
  passphrase: string,
  iterations: number = 600_000
): Promise<string> {
  return encryptBytesToBase64(encode(plaintext), passphrase, iterations);
}

/**
 * Encrypt and return base64 string (for small payloads / text mode).
 */
export async function encryptBytesToBase64(
  data: ArrayBuffer,
  passphrase: string,
  iterations: number = 600_000
): Promise<string> {
  const { salt, iv, ciphertext } = await encryptRaw(data, passphrase, iterations);
  return [
    toBase64(salt.buffer as ArrayBuffer),
    toBase64(iv.buffer as ArrayBuffer),
    toBase64(ciphertext),
  ].join(".");
}

/**
 * Encrypt and return raw binary parts (for large files).
 */
export async function encryptRaw(
  data: ArrayBuffer,
  passphrase: string,
  iterations: number = 600_000
): Promise<{ salt: Uint8Array; iv: Uint8Array; ciphertext: ArrayBuffer }> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt.buffer as ArrayBuffer, iterations);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    data
  );

  return { salt, iv, ciphertext };
}

export async function decrypt(
  encrypted: string,
  passphrase: string,
  iterations: number = 600_000
): Promise<string> {
  const buf = await decryptFromBase64(encrypted, passphrase, iterations);
  return decode(buf);
}

export async function decryptFromBase64(
  encrypted: string,
  passphrase: string,
  iterations: number = 600_000
): Promise<ArrayBuffer> {
  const [saltB64, ivB64, ciphertextB64] = encrypted.split(".");

  const salt = fromBase64(saltB64);
  const iv = fromBase64(ivB64);
  const ciphertext = fromBase64(ciphertextB64);
  const key = await deriveKey(passphrase, salt.buffer as ArrayBuffer, iterations);

  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer
  );
}

/**
 * Decrypt from raw binary (salt + iv + ciphertext concatenated).
 */
export async function decryptFromBinary(
  binary: Uint8Array,
  passphrase: string,
  iterations: number = 600_000
): Promise<ArrayBuffer> {
  const salt = binary.slice(0, SALT_LENGTH);
  const iv = binary.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = binary.slice(SALT_LENGTH + IV_LENGTH);
  const key = await deriveKey(passphrase, salt.buffer as ArrayBuffer, iterations);

  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer
  );
}

/**
 * Hash the secret question answer using PBKDF2 with a deterministic salt.
 */
export async function hashAnswer(answer: string): Promise<string> {
  const normalized = answer.trim().toLowerCase();
  const saltSource = await crypto.subtle.digest("SHA-256", encode(`ZEFER_ANSWER_SALT:${normalized}`));
  const salt = new Uint8Array(saltSource).slice(0, 16);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encode(normalized),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    256
  );

  return toBase64(bits);
}

// ─── Benchmark ───

export async function benchmarkDevice(): Promise<number> {
  const testSalt = crypto.getRandomValues(new Uint8Array(32));
  const testMaterial = await crypto.subtle.importKey(
    "raw",
    encode("benchmark"),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const start = performance.now();
  await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: testSalt.buffer as ArrayBuffer, iterations: 50_000, hash: "SHA-256" },
    testMaterial,
    256
  );
  const elapsed = performance.now() - start;

  return (elapsed / 50_000) * 100_000;
}

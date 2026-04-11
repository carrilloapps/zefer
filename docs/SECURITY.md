# Security

> [README](../README.md) · [Architecture](ARCHITECTURE.md) · **Security** · [Deployment](DEPLOYMENT.md) · [Contributing](CONTRIBUTING.md)

> To report a vulnerability, see [SECURITY.md](../SECURITY.md) in the project root.

## How Zefer Protects Your Data

Zefer encrypts your secrets entirely in the browser. No data, passphrases, or keys ever leave your device. The server only delivers the static web app — it never sees or processes your content.

## What an Attacker Can See

If someone intercepts a `.zefer` file, here's what they can and cannot learn:

| Visible (public header) | Not visible (encrypted) |
|---|---|
| PBKDF2 iteration count | Passphrase |
| Compression method | Content (text or file) |
| Hint text (if user chose to add one) | File name, type, and size |
| Note text (if user chose to add one) | Expiration date |
| Text vs file mode | Whether IP restriction exists |
| Whether a reveal key exists (ZEFR3 format) | Whether a secret question exists |
| Salt and IV per encrypted block | Whether dual key is required |
| | Allowed IP addresses |
| | Max attempt count |

**Salt and IV exposure is by design** — AES-GCM requires unique nonces and PBKDF2 requires salt. These are not secret. Security relies entirely on passphrase strength + PBKDF2 stretching.

## Cryptographic Primitives

| Primitive | Algorithm | Parameters |
|---|---|---|
| Symmetric encryption | AES-256-GCM | 256-bit key, 96-bit IV, 128-bit auth tag |
| Key derivation | PBKDF2-SHA256 | 300k / 600k / 1M iterations, 256-bit salt |
| Answer hashing | PBKDF2-SHA256 | 100,000 iterations, deterministic salt derived via SHA-256 |
| Random generation | `crypto.getRandomValues` | OS-level CSPRNG |

All operations use the browser's native **Web Crypto API** (`SubtleCrypto`), which is hardware-accelerated and not susceptible to JavaScript-level side-channel attacks.

## How Strong Is My Passphrase?

With 600,000 PBKDF2 iterations on a modern GPU (~1M hashes/sec):

| Passphrase type | Time to brute force |
|---|---|
| Weak 8-character password (~40 bits) | ~12 days |
| Strong 12-character password (~60 bits) | ~36,000 years |
| Generated 16-character key (~80 bits) | ~38 billion years |
| Generated 22+ character key (~128 bits) | Heat death of universe |

Use the built-in key generator (64-1024 characters) for maximum security.

## Security Features

### Reveal Key

Share a secondary key without exposing your main passphrase. The reveal key independently encrypts the same content with its own salt, IV, and derived key. Either key works for decryption.

### Dual Passphrase

Require two separate keys to decrypt — useful when two people need to authorize access. Both passphrases are combined with a `\x00ZEFER_DUAL\x00` separator before key derivation.

### Secret Question

Add an extra authentication step. The answer is hashed with PBKDF2-SHA256 (100k iterations, deterministic salt). The original answer is never stored.

### IP Restriction

Limit decryption to specific IPv4/IPv6 addresses. The allowed IP list is stored inside the encrypted payload — invisible without the key.

### Expiration

Set a time limit (30 minutes to 2 weeks). The UTC timestamp is embedded inside the encrypted payload — it cannot be modified without the passphrase (AES-GCM authentication prevents tampering).

### Max Attempts

Limit failed decryption attempts. Tracked per file in `localStorage`. This adds friction for casual unauthorized access, but is not cryptographically enforced.

### Compression

Gzip or Deflate via CompressionStream API. Reduces file size before encryption. Decompression is capped at 512 MB to prevent decompression bombs.

## Security Protections

| Protection | Implementation |
|---|---|
| XSS prevention | Hint/note fields sanitized on encryption; React auto-escapes all rendered text; no `dangerouslySetInnerHTML` |
| Timing attack mitigation | Minimum 100ms response floor; PBKDF2 dominates timing (~600ms) |
| Decompression bomb protection | Maximum 512 MB decompressed output |
| Passphrase memory cleanup | Passphrases cleared from React state after encryption/decryption |
| Key generation bias | Rejection sampling eliminates modulo bias for uniform distribution |
| Nonce reuse prevention | Unique IV per chunk (`base_iv XOR chunk_index`) |

## Known Limitations

These are inherent to 100% client-side architecture and are documented transparently:

| Limitation | Explanation |
|---|---|
| Max attempts bypass | `localStorage` can be cleared or bypassed in incognito. This is friction, not a guarantee. |
| Expiration bypass | Checked against `Date.now()` which trusts the client clock. An attacker could set their clock backward. |
| IP restriction bypass | Checked client-side after decryption. An attacker could modify JavaScript or use a VPN. |
| No forward secrecy | If a passphrase is compromised, all files encrypted with it are decryptable. Use unique passphrases per file. |
| Browser memory | Passphrases exist in browser memory during operations. Close the tab after use. |
| Compression oracle | Compressed ciphertext size can reveal whether plaintext is repetitive. Use no compression for maximum security. |

## What IS Guaranteed

Regardless of the above limitations:

1. **Without the passphrase, the content is unrecoverable.** AES-256-GCM with PBKDF2-stretched keys is computationally infeasible to brute-force.
2. **The ciphertext cannot be modified.** GCM authentication detects any tampering.
3. **Each file has unique encryption.** Random salt + random IV means identical plaintext produces different ciphertext.
4. **The reveal key is independently encrypted.** Separate salt, IV, and derived key. Compromising one does not compromise the other.
5. **Security metadata is invisible.** Expiration, IP list, question, max attempts — all inside the encrypted payload.

## Responsible Disclosure

If you discover a security vulnerability, please report it responsibly via [GitHub Security Advisories](https://github.com/carrilloapps/zefer/security/advisories/new) or contact [@carrilloapps](https://github.com/carrilloapps). See [SECURITY.md](../SECURITY.md) for the full reporting process.

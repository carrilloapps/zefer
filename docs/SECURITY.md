# Security

## Threat Model

Zefer protects secrets shared between two parties who communicate the passphrase out-of-band. The primary threats addressed:

1. **Interception** — A third party intercepts the `.zefer` file in transit
2. **Server compromise** — An attacker gains access to the hosting server
3. **Brute force** — An attacker tries to guess the passphrase
4. **Metadata leakage** — An attacker learns something from the file without decrypting

## Cryptographic Primitives

| Primitive | Algorithm | Parameters |
|---|---|---|
| Symmetric encryption | AES-256-GCM | 256-bit key, 96-bit IV, 128-bit auth tag |
| Key derivation | PBKDF2-SHA256 | 300k / 600k / 1M iterations, 256-bit salt |
| Answer hashing | PBKDF2-SHA256 | 100,000 iterations, deterministic salt derived via SHA-256 |
| Random generation | `crypto.getRandomValues` | OS-level CSPRNG |

All cryptographic operations use the browser's native **Web Crypto API** (`SubtleCrypto`), which is:
- Hardware-accelerated (AES-NI for AES, native C++ for PBKDF2)
- FIPS 140-2 compliant implementations in most browsers
- Not susceptible to JavaScript-level side-channel attacks

## What an Attacker Sees

Given only the `.zefer` file, an attacker can determine:

| Visible | Not Visible |
|---|---|
| File format magic (ZEFB3 or ZEFR3) | Passphrase |
| PBKDF2 iteration count | Content |
| Compression method | File name, type, size |
| Hint text (if set by user) | Expiration date |
| Note text (if set by user) | Whether IP restriction exists |
| Text vs file mode | Whether a secret question exists |
| ZEFR3 magic reveals a reveal key exists | Whether dual key is required |
| Salt and IV per encrypted block | Allowed IP addresses |
| | Max attempt count |

**Salt and IV exposure is by design** — AES-GCM requires unique nonces, and PBKDF2 requires salt. These are not secret. The security relies entirely on the passphrase entropy + PBKDF2 stretching.

## Security Features

### Passphrase Requirements

- Minimum 6 characters enforced in the UI
- Key generator offers 64-1024 character random keys
- Unicode support (Latin, Arabic, Japanese, Chinese, Korean, Greek, Cyrillic, emojis)

### PBKDF2 Protection

With 600,000 iterations on a modern GPU (~1M hashes/sec for PBKDF2-SHA256):

| Passphrase Entropy | Time to Brute Force |
|---|---|
| 40 bits (weak 8-char) | ~12 days |
| 60 bits (strong 12-char) | ~36,000 years |
| 80 bits (generated 16-char) | ~38 billion years |
| 128 bits (generated 22-char) | Heat death of universe |

### AES-256-GCM

- 256-bit keys: 2^256 possible keys (~1.2 x 10^77)
- GCM provides authenticated encryption: tampering is detected
- Unique IV per encryption prevents nonce reuse attacks
- Auth tag prevents ciphertext modification
- Chunked encryption: files >16MB are split into chunks, each with a unique IV derived from `base_iv XOR chunk_index`

### Reveal Key

- Encrypts the same payload with a second passphrase (independent salt, IV, and key)
- Stored as a second encrypted block in ZEFR3 binary format
- User shares the reveal key; main passphrase stays private
- Both produce identical decrypted output
- Cannot be the same as the main passphrase (validated in UI)

### Dual Passphrase

- Two passphrases combined with `\x00ZEFER_DUAL\x00` separator
- Derived key requires both passphrases
- Useful for corporate scenarios (two-person authorization)

### IP Restriction

- Allowed IPs stored inside the encrypted payload (not visible without key)
- Verified by fetching client's public IP from `api64.ipify.org`
- Supports IPv4 and IPv6, comma-separated
- Checked after successful decryption

### Max Attempts

- Tracked per file in `localStorage` (keyed by first 40 chars of ciphertext)
- Not cryptographically enforced (user can clear localStorage)
- Adds friction for casual unauthorized attempts
- Cleared on successful decryption

### Expiration

- Timestamp stored inside the encrypted payload
- Cannot be modified without the key (AES-GCM auth prevents tampering)
- Uses UTC milliseconds (`Date.now()`) — timezone-independent
- Checked after decryption, before content display

## Security Mitigations Applied

### XSS Prevention
- Hint and note fields are sanitized on encryption (HTML special characters stripped)
- React JSX auto-escapes all rendered text content
- No `dangerouslySetInnerHTML` used anywhere in the project

### Answer Hash Strengthening
- Secret question answers are hashed using PBKDF2-SHA256 with 100,000 iterations
- Deterministic salt derived from the answer via SHA-256 (reproducible but resistant to rainbow tables)
- Input normalized (lowercase, trimmed) before hashing

### Timing Attack Mitigation
- Decryption responses include a minimum delay floor (100ms) to normalize response times
- PBKDF2 derivation dominates timing (~600ms), making side-channel detection impractical

### Decompression Bomb Protection
- Maximum decompressed output capped at 512 MB
- Stream reader aborts and throws if limit exceeded

### Passphrase Memory Handling
- Passphrases, reveal keys, and question answers are cleared from React state immediately after successful encryption/decryption
- JavaScript does not guarantee immediate memory freeing (GC-dependent), but references are removed

### Key Generation
- Uses rejection sampling to eliminate modulo bias in charset selection
- Produces cryptographically uniform distribution across all character pools

## Known Limitations

These are inherent to 100% client-side architecture:

1. **Max attempts**: Enforced via `localStorage`. A determined attacker can clear storage or use incognito mode. This is friction, not a guarantee.
2. **Expiration**: Checked against `Date.now()` which trusts the client system clock. An attacker can set their clock backward.
3. **IP restriction**: Checked client-side after successful decryption. An attacker can modify the JavaScript to skip the check, or use a VPN to match the allowed IP.
4. **No forward secrecy**: If the passphrase is compromised, all files encrypted with it can be decrypted. Use unique passphrases per file for maximum security.
5. **Browser memory**: Passphrases exist in browser memory during encryption/decryption. Close the browser tab after use.
6. **Compression oracle**: If compression is enabled, the compressed ciphertext size can reveal whether plaintext is repetitive. For maximum security, use no compression.

## What IS Guaranteed

Even with all the above limitations, the following guarantees hold:

1. **Without the passphrase, the content is unrecoverable.** AES-256-GCM with a 256-bit key derived from PBKDF2 is computationally infeasible to brute-force.
2. **The ciphertext cannot be modified.** GCM's authentication tag detects any tampering.
3. **Each file has unique encryption.** Random salt + random IV per encryption means identical plaintext produces different ciphertext.
4. **The reveal key is independently encrypted.** Separate salt, IV, and derived key. Compromising one does not compromise the other.
5. **Security metadata is invisible.** Expiration, IP list, question, max attempts are all inside the encrypted payload.

## Responsible Disclosure

If you discover a security vulnerability, please report it via GitHub Issues at [github.com/carrilloapps/zefer](https://github.com/carrilloapps/zefer) or contact [@carrilloapps](https://github.com/carrilloapps).

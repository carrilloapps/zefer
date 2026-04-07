# Security

## Threat Model

Zefer is designed to protect secrets shared between two parties who communicate the passphrase out-of-band. The primary threats addressed are:

1. **Interception** — A third party intercepts the `.zefer` file in transit
2. **Server compromise** — An attacker gains access to the hosting server
3. **Instance cloning** — Someone deploys a rogue Zefer instance
4. **Brute force** — An attacker tries to guess the passphrase
5. **Metadata leakage** — An attacker learns something from the file without decrypting

## Cryptographic Primitives

| Primitive | Algorithm | Parameters |
|---|---|---|
| Symmetric encryption | AES-256-GCM | 256-bit key, 96-bit IV, 128-bit auth tag |
| Key derivation | PBKDF2-SHA256 | 300k / 600k / 1M iterations, 256-bit salt |
| Answer hashing | SHA-256 | Normalized (lowercase, trimmed) |
| Instance binding | SHA-256 | `ZEFER_INSTANCE:` + secret |
| Random generation | `crypto.getRandomValues` | OS-level CSPRNG |

All cryptographic operations use the browser's native **Web Crypto API** (`SubtleCrypto`), which is:
- Hardware-accelerated (AES-NI for AES, native C++ for PBKDF2)
- FIPS 140-2 compliant implementations in most browsers
- Not susceptible to JavaScript-level side-channel attacks

## What an Attacker Sees

Given only the `.zefer` file, an attacker can determine:

| Visible | Not Visible |
|---|---|
| PBKDF2 iteration count | Passphrase |
| Compression method | Content |
| Hint text (if set by user) | File name, type, size |
| Note text (if set by user) | Expiration date |
| Number of encrypted lines (1 or 2) | Whether strict mode is used |
| File is a Zefer file (magic number) | Whether IP restriction exists |
| | Whether a secret question exists |
| | Whether dual key is required |
| | Allowed IP addresses |
| | Max attempt count |

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

- 256-bit keys: 2^256 possible keys (~1.2 × 10^77)
- GCM provides authenticated encryption: tampering is detected
- Unique IV per encryption prevents nonce reuse attacks
- Auth tag prevents ciphertext modification

### Reveal Key

- Encrypts the same payload with a second passphrase
- Stored as a separate encrypted line in the `.zefer` file
- User shares the reveal key; main passphrase stays private
- Both produce identical decrypted output

### Dual Passphrase

- Two passphrases combined with `\x00ZEFER_DUAL\x00` separator
- Derived key requires both passphrases
- Useful for corporate scenarios (two-person authorization)

### IP Restriction

- Allowed IPs stored inside the encrypted payload (not visible without key)
- Verified by fetching client's public IP from `api64.ipify.org`
- Supports IPv4 and IPv6
- Checked after successful decryption

### Strict Instance Mode

- Instance admin sets `ZEFER_INSTANCE_SECRET` in server environment
- `/api/instance` returns `SHA-256("ZEFER_INSTANCE:" + secret)`
- Hash mixed into PBKDF2 key material: `passphrase + \x00ZEFER_STRICT\x00 + hash`
- Different instances produce different hashes → different keys → cannot decrypt

**Attack resistance:**
- Attacker inspects client JS → sees the hash, not the secret
- Attacker clones the repo → no `.env` → no secret → strict mode disabled
- Attacker sets own secret → different hash → incompatible files

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

## Known Limitations

1. **Client-side only**: If the user's browser is compromised (malicious extension, XSS), the passphrase could be intercepted before encryption
2. **Max attempts**: Enforced via `localStorage` — not cryptographically binding. A determined attacker can bypass by clearing storage or using a different browser
3. **IP restriction**: Relies on a public IP lookup service (`ipify.org`). If the service is unavailable, IP check fails closed (access denied)
4. **No forward secrecy**: If the passphrase is compromised, all files encrypted with it can be decrypted
5. **Memory-bound**: Large files must fit in browser memory (~3x file size needed for crypto pipeline)

## Responsible Disclosure

If you discover a security vulnerability, please report it via GitHub Issues at [github.com/carrilloapps/zefer](https://github.com/carrilloapps/zefer) or contact [@carrilloapps](https://github.com/carrilloapps).

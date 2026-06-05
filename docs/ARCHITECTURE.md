# Architecture

> [README](../README.md) · **Architecture** · [Security](SECURITY.md) · [Deployment](DEPLOYMENT.md) · [Contributing](CONTRIBUTING.md)

## Overview

Zefer is a 100% client-side encryption tool. All cryptographic operations happen in the browser via the Web Crypto API. The only server-side component is one lightweight API route (`/api/author`) that caches the creator's GitHub profile data.

No plaintext, passphrases, or encryption keys ever leave the user's device.

## Data Flow

### Encryption

```
User Input (text or file)
    |
    v
[Compression] (optional: Gzip/Deflate via CompressionStream)
    |
    v
[Metadata Assembly] (JSON: expiration, IPs, question hash, file info)
    |
    v
[Payload Packing] (4-byte meta length + metadata JSON + raw content bytes)
    |
    v
[Key Derivation] (PBKDF2-SHA256: passphrase + salt -> 256-bit key)
    |                Iterations: 300k / 600k / 1M (user-configurable)
    |                Salt: 32 random bytes (unique per encryption)
    |
    v
[Chunked Encryption] (AES-256-GCM, 16MB per chunk)
    |                   IV: 12 random bytes (base IV XOR chunk index)
    |
    +-- [if reveal key] -> Second chunked encryption with reveal passphrase
    |
    v
[File Assembly] (ZEFB3 or ZEFR3 binary format)
    |
    v
[Download] (.zefer file to user's device)
```

### Decryption

```
Upload .zefer file (click or drag-and-drop)
    |
    v
[Parse Magic] (ZEFB3 = single key, ZEFR3 = with reveal key)
    |
    v
[Read Header] (iterations, compression, hint, note, mode)
    |
    v
[Build Key Candidates] (try: plain passphrase, +dual combined)
    |
    v
[Attempt Decryption] (for each candidate x each encrypted block)
    |
    v
[Extract Payload] (4-byte length prefix -> metadata JSON + raw content)
    |
    v
[Post-Decryption Checks]
    |-- Max attempts (localStorage tracking)
    |-- Secret question (PBKDF2-SHA256 hash comparison, 100k iterations)
    |-- Expiration (Date.now() vs embedded timestamp)
    |-- IP restriction (fetch public IP, compare to allowed list)
    |
    v
[Decompress] (if compression was used)
    |
    v
[Display / Download]
```

## .zefer Binary Format

### ZEFB3 — Single key (primary)

```
ZEFB3 (5 bytes: 0x5A 0x45 0x46 0x42 0x33)
header_length (4 bytes, big-endian)
header_json (header_length bytes)
salt (32 bytes)
base_iv (12 bytes)
chunk_0: [4-byte length][AES-GCM ciphertext + 16-byte auth tag]
chunk_1: [4-byte length][AES-GCM ciphertext + 16-byte auth tag]
...
```

### ZEFR3 — With reveal key

```
ZEFR3 (5 bytes: 0x5A 0x45 0x46 0x52 0x33)
header_length (4 bytes, big-endian)
header_json (header_length bytes)
main_block_size (4 bytes, big-endian)
main_salt (32B) + main_base_iv (12B) + main_chunks
reveal_salt (32B) + reveal_base_iv (12B) + reveal_chunks
```

Each block has its own salt, IV, and derived key. The main block is encrypted with the main passphrase; the reveal block with the reveal key. Either key decrypts the full payload.

### Chunked Encryption

Files are split into 16MB chunks. Each chunk gets a unique IV derived from `base_iv XOR chunk_index` (last 4 bytes). This avoids nonce reuse while keeping memory usage constant (~32MB regardless of file size).

### Public Header

Only contains what's necessary before decryption, plus user-chosen public fields:

| Field | Purpose |
|---|---|
| `iterations` | Required for PBKDF2 key derivation |
| `compression` | Required to decompress after decryption |
| `hint` | Optional password hint (user chose to make public) |
| `note` | Optional public note (user chose to make public) |
| `mode` | "text" or "file" (determines output handling) |

### Encrypted Metadata

Everything sensitive is inside the AES-256-GCM payload:

```json
{
  "v": 3,
  "fileName": "secrets.env",
  "fileType": "text/plain",
  "fileSize": 1234,
  "expiresAt": 1712534400000,
  "createdAt": 1712448000000,
  "answerHash": "pbkdf2...",
  "allowedIps": ["192.168.1.1"],
  "question": "What is...?",
  "maxAttempts": 5
}
```

### Legacy Formats

ZEFER3 (text, base64 lines) and ZEFER2 (JSON payload) are supported for backward-compatible decryption. New files always use ZEFB3 or ZEFR3 binary.

## Key Derivation

```
passphrase
    |
    +-- [if dual key] -> combine(passphrase, secondPassphrase)
    |                    separator: \x00ZEFER_DUAL\x00
    |
    v
PBKDF2-SHA256(combined, salt, iterations) -> 256-bit AES key
```

## Persisted User Preferences

The following settings are saved to `localStorage` so they persist between sessions:

| Preference | Key | Default | Values |
|------------|-----|---------|--------|
| Active tab | `tab` | `encrypt` | `encrypt`, `decrypt` |
| Input mode | `inputMode` | `text` | `text`, `file` |
| Expiration | `ttl` | `1440` | Minutes (0 = never) |
| PBKDF2 iterations | `iterations` | `600000` | 300000-1000000 |
| Compression | `compression` | `none` | `none`, `gzip`, `deflate` |
| Key generator mode | `keygenMode` | `secure` | `unicode`, `secure`, `alpha`, `hex`, `base58`, `pin`, `uuid` |
| Key generator length | `keygenLength` | `64` | 1-2048 (slider presets 16-1024) |
| Key generator quantity | `keygenCount` | `1` | 1-50 |
| Generator advanced opts | `keygenAdvanced` | all off | `excludeAmbiguous`, `excludeChars`, `requireAllClasses`, `noRepeats`, `groupSize` |

Stored under the `zefer-prefs` key as a single JSON object. Preferences are shared
between the home key-generator popover and the `/generator` page.

## Password Engine (`app/lib/passwords.ts`)

Shared by the home `KeyGenerator` popover and the `/generator` page:

- **Charsets** for 7 modes — `unicode`, `secure`, `alpha`, `hex`, `base58`
  (standard Bitcoin alphabet: no `0 O I l`, safe to dictate), `pin` (digits),
  `uuid` (v7, RFC 9562)
- **Generation** via `crypto.getRandomValues` with rejection sampling (no modulo
  bias); `generateWithOptions()` adds exclusions, class guarantees, no-repeat
  sampling and cosmetic dash grouping
- **Analysis** (`analyzePassword`) — character classes, pool estimate, max and
  effective entropy (penalties for leaked-list matches, sequences, keyboard
  patterns, repeats, embedded years), 0-4 score
- **Attack scenarios** — 10^2 (throttled login), 10^6 (cloud vs PBKDF2),
  10^12 (GPU farm vs fast hash), 10^15 (nation-state) guesses/s
- **Crack times in log space** (`crackBucketFor`) — `2^bits` overflows `Number`
  past ~1024 bits, so times are derived from `log10` math and rendered as
  `~10^N years` with Unicode superscripts when they exceed 10^6 years
- **Compliance checks** (`complianceOf`) — NIST SP 800-63B length, OWASP >=64
  bits, long-term >=100 bits, AES-128 equivalence >=128 bits, post-quantum
  Grover (>=128 bits after halving)

## Device Detection

Uses browser APIs to estimate safe file limits:

| API | Data | Browser Support |
|---|---|---|
| `performance.memory.jsHeapSizeLimit` | JS heap limit | Chrome, Edge |
| `navigator.deviceMemory` | Total RAM (GB) | Chrome, Edge, Opera |
| `navigator.hardwareConcurrency` | CPU core count | All |
| `WEBGL_debug_renderer_info` | GPU model + vendor | Most |
| `navigator.userAgentData` | CPU architecture | Chrome 90+ |

Limit model (tiered): the V8 heap limit is capped at ~4 GB on every desktop
regardless of physical RAM (and ArrayBuffers live outside the V8 heap), so the
limit is derived from `navigator.deviceMemory` + core count instead:

| Signals | Max file |
|---|---|
| RAM >= 64 GB | 10 GB |
| RAM >= 32 GB | 8-10 GB (20+ threads -> 10 GB) |
| RAM >= 16 GB | 6-8 GB |
| RAM >= 8 GB (may be the privacy clamp) | 2-10 GB by core count (20+ threads -> 10 GB) |
| RAM >= 4 GB | 1-2 GB |
| Unknown (Firefox/Safari) | 1-4 GB by core count |
| Mobile | 256 MB - 1.5 GB by RAM |

Memory peak during encrypt/decrypt ~= 1.2x the file (2.2x with compression):
1x input ArrayBuffer + one active 16 MB chunk + browser-managed Blob output.

## Component Tree

```
RootLayout
  +-- ThemeProvider (dark/light, localStorage)
        +-- LanguageProvider (es/en/pt, localStorage)
              +-- LegalBanner (consent, localStorage)
              +-- ToastProvider (Sonner)
              +-- Page Content
                    +-- Navbar (scroll-aware mobile header, morphing burger,
                    |          staggered drawer, theme toggle, language selector)
                    +-- [Page-specific content]
                    |     +-- EncryptForm -> CryptoProgress -> Success
                    |     +-- DecryptForm -> CryptoProgress -> Revealed
                    |     +-- KeyGenerator (popover, shares prefs with /generator)
                    |     +-- GeneratorContent (/generator: tabs, StopSlider,
                    |     |                     SecurityInsights, InfoTip)
                    |     +-- AnalyzerContent (/analyzer: .zefer header report)
                    +-- Footer
```

32 client components total.

## Theming

All colors use CSS custom properties on `[data-theme="dark"]` and `[data-theme="light"]`:

- `--heading`, `--text`, `--text-muted`, `--text-faint` for text hierarchy
- `--glass-bg`, `--glass-border` for glass morphism
- `--primary`, `--danger`, `--warning` for semantic colors
- All combinations pass WCAG 2.1 AA (4.5:1 minimum contrast ratio)

Brand colors: `#22c55e` (dark mode primary), `#15803d` (light mode primary), `#050a0e` (dark background), `#f8fafb` (light background).

# Architecture

## Overview

Zefer is a 100% client-side encryption tool. The only server-side components are two lightweight API routes: one for strict mode instance hashing, and one for fetching the creator's GitHub profile.

## Data Flow

### Encryption

```
User Input (text or file)
    |
    v
[Compression] (optional: Gzip/Deflate via CompressionStream)
    |
    v
[Metadata Assembly] (JSON: expiration, IPs, question hash, strict flag, file info)
    |
    v
[Payload Packing] (metadata JSON + \0 separator + raw content bytes)
    |
    v
[Key Derivation] (PBKDF2-SHA256: passphrase + salt → 256-bit key)
    |                Iterations: 300k / 600k / 1M (user-configurable)
    |                Salt: 32 random bytes (unique per encryption)
    |
    v
[AES-256-GCM Encryption] (payload → ciphertext)
    |                      IV: 12 random bytes (unique per encryption)
    |
    v
[File Assembly] (ZEFER3 header + encrypted lines)
    |
    v
[Download] (.zefer file to user's device)
```

### Decryption

```
Upload .zefer file
    |
    v
[Parse Header] (read iterations, compression, hint, note, mode)
    |
    v
[Build Key Candidates] (try: plain, +instance, +dual, +dual+instance)
    |
    v
[Attempt Decryption] (for each candidate × each encrypted line)
    |
    v
[Unpack Payload] (split at \0 → metadata JSON + raw content)
    |
    v
[Post-Decryption Checks]
    |-- Max attempts (localStorage tracking)
    |-- Secret question (SHA-256 hash comparison)
    |-- Expiration (Date.now() vs embedded timestamp)
    |-- IP restriction (fetch public IP, compare to allowed list)
    |
    v
[Decompress] (if compression was used)
    |
    v
[Display / Download]
```

## .zefer File Format (ZEFER3)

```
Line 1: ZEFER3                              (magic number)
Line 2: {"iterations":600000,"compression":"none","hint":null,"note":null,"mode":"text"}
Line 3: <base64(salt)>.<base64(iv)>.<base64(ciphertext)>     (main key)
Line 4: <base64(salt)>.<base64(iv)>.<base64(ciphertext)>     (reveal key, optional)
```

### Public Header (Line 2)

Only contains what's absolutely necessary before decryption, plus user-chosen public fields:

| Field | Purpose |
|---|---|
| `iterations` | Required for PBKDF2 key derivation |
| `compression` | Required to decompress after decryption |
| `hint` | Optional password hint (user chose to make public) |
| `note` | Optional public note (user chose to make public) |
| `mode` | "text" or "file" (determines output handling) |

### Encrypted Payload

Everything security-sensitive:

```json
{
  "v": 3,
  "content": "...",           // (text mode only)
  "fileName": "secrets.env",
  "fileType": "text/plain",
  "fileSize": 1234,
  "expiresAt": 1712534400000,
  "createdAt": 1712448000000,
  "answerHash": "sha256...",
  "allowedIps": ["192.168.1.1"],
  "question": "What is...?",
  "maxAttempts": 5,
  "strict": true
}
```

For file mode, the payload is: `metadata JSON + \0 + raw file bytes` — encrypted as a single AES-256-GCM block.

## Key Derivation

```
passphrase
    |
    +-- [if dual key] → combine(passphrase, secondPassphrase)
    |                    separator: \x00ZEFER_DUAL\x00
    |
    +-- [if strict]   → bind(passphrase, instanceHash)
    |                    separator: \x00ZEFER_STRICT\x00
    |
    v
PBKDF2-SHA256(combined, salt, iterations) → 256-bit AES key
```

## Strict Mode

1. Instance admin sets `ZEFER_INSTANCE_SECRET` in their hosting environment
2. `/api/instance` returns `SHA-256("ZEFER_INSTANCE:" + secret)` — the hash, not the secret
3. The hash is mixed into the key derivation material
4. Files encrypted on instance A produce different keys than instance B
5. The `.zefer` file contains no indication of strict mode (it's inside the encrypted payload)

## Device Detection

Uses browser APIs to estimate safe file limits:

| API | Data | Browser Support |
|---|---|---|
| `performance.memory.jsHeapSizeLimit` | JS heap limit | Chrome, Edge |
| `navigator.deviceMemory` | Total RAM (GB) | Chrome, Edge, Opera |
| `navigator.hardwareConcurrency` | CPU core count | All |
| `WEBGL_debug_renderer_info` | GPU model + vendor | Most |
| `navigator.userAgentData` | CPU architecture | Chrome 90+ |

Formula: `maxFile = (heapLimit × 50% ÷ 3) × 80%`

## Component Tree

```
RootLayout
  └── ThemeProvider (dark/light, localStorage)
        └── LanguageProvider (es/en/pt, localStorage)
              ├── LegalBanner (consent, localStorage)
              └── Page Content
                    ├── Navbar (nav links, theme toggle, language selector)
                    ├── [Page-specific content]
                    │     ├── EncryptForm → CryptoProgress → Success
                    │     ├── DecryptForm → CryptoProgress → Revealed
                    │     └── KeyGenerator (popover)
                    └── Footer
```

## Theming

All colors use CSS custom properties on `[data-theme="dark"]` and `[data-theme="light"]`:

- `--heading`, `--text`, `--text-muted`, `--text-faint` for text hierarchy
- `--glass-bg`, `--glass-border` for glass morphism
- `--primary`, `--danger`, `--warning` for semantic colors
- All combinations pass WCAG 2.1 AA (4.5:1 minimum contrast ratio)

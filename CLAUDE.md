# Zefer — Project Context

## What is Zefer

Client-side encryption tool that converts text and files into password-protected `.zefer` files using AES-256-GCM. 100% browser-based — no server stores, processes, or transmits user data. Open source, MIT license, created by Jose Carrillo (@carrilloapps).

**Live:** https://zefer.carrillo.app
**Repo:** https://github.com/carrilloapps/zefer

## Stack

- Next.js 16.2.2 (React 19), TypeScript 5, Tailwind CSS v4
- Web Crypto API (AES-256-GCM, PBKDF2-SHA256), CompressionStream API
- Lucide React icons, Sonner (toast notifications)
- Vitest + @vitest/coverage-v8 (125 tests, 100% line coverage)

## Critical Rules

1. **Never hardcode colors** — use `theme-*` classes or `var(--*)` CSS variables. Zero Tailwind color classes allowed in components.
2. **All user-facing text in i18n.ts** — 3 languages: es, en, pt. Never hardcode strings.
3. **Security metadata inside encrypted payload** — the public header ONLY contains: iterations, compression, hint, note, mode. Everything else (expiration, IPs, question, maxAttempts) is inside the AES-256-GCM ciphertext.
4. **Minimum passphrase: 6 characters** — enforced in EncryptForm.tsx.
5. **WCAG 2.1 AA** — all text must pass 4.5:1 contrast ratio.
6. **No emails exposed** — contact is GitHub profile only.
7. **SSR hydration safe** — providers start with defaults, hydrate from localStorage in useEffect, render skeleton or null until ready.

## Binary File Format

### ZEFB3 — Single key (primary format)

```
ZEFB3 (5 bytes: 0x5A 0x45 0x46 0x42 0x33)
header_length (4 bytes, big-endian)
header_json (header_length bytes)
salt (32 bytes) + base_iv (12 bytes)
encrypted_chunks (each: 4-byte length prefix + AES-GCM ciphertext)
```

### ZEFR3 — With reveal key

```
ZEFR3 (5 bytes: 0x5A 0x45 0x46 0x52 0x33)
header_length (4 bytes, big-endian)
header_json (header_length bytes)
main_block_size (4 bytes, big-endian)
main_salt (32B) + main_iv (12B) + main_chunks
reveal_salt (32B) + reveal_iv (12B) + reveal_chunks
```

### Public header JSON

```json
{"iterations":600000,"compression":"none","hint":null,"note":null,"mode":"text"}
```

### Encrypted payload

Packed as: `4-byte meta length (big-endian) + metadata JSON + raw content bytes`

Metadata JSON inside cipher:
```json
{
  "v": 3, "fileName": "...", "fileType": "...",
  "fileSize": 0, "expiresAt": 0, "createdAt": 0,
  "answerHash": null, "allowedIps": [], "question": null,
  "maxAttempts": 0
}
```

### Legacy formats

ZEFER3 (text, base64 lines) and ZEFER2 (JSON payload) are supported for backward-compatible decryption only. New files always use ZEFB3 or ZEFR3.

## Key Derivation Chain

```
passphrase
  -> [if dual] combine(pass, secondPass) via \x00ZEFER_DUAL\x00
  -> PBKDF2-SHA256(combined, salt_32bytes, iterations) -> 256-bit AES key
  -> AES-256-GCM(key, iv_12bytes, payload) -> ciphertext
```

## Project Structure

```
app/
  api/author/route.ts      -- GitHub profile cache (1h TTL)
  components/              -- 24 client components
  lib/
    crypto.ts              -- AES-256-GCM, PBKDF2, benchmark, dual key
    zefer.ts               -- ZEFB3/ZEFR3 encode/decode, all security checks
    chunked-crypto.ts      -- Chunked encryption (16MB per chunk, unique IVs)
    compression.ts         -- Gzip/Deflate via CompressionStream
    device.ts              -- RAM/CPU/GPU detection, dynamic file limits
    i18n.ts                -- ~415 translation keys x 3 languages
    ip.ts                  -- IP detection + allowlist check
    notify.ts              -- Toast notification helpers
    preferences.ts         -- Persisted user preferences (ttl, iterations, compression, inputMode, tab, keygenMode, keygenLength)
    progress.ts            -- Encryption/decryption progress tracking
  globals.css              -- Design system (liquid glass, 2 themes, animations)
```

## Routes

| Route | Type | Purpose |
|---|---|---|
| `/` | Static | Home — encrypt/decrypt tabs |
| `/how` | Static | 7 steps + 5 features + 12 specs |
| `/privacy` | Static | 9 sections + GDPR/CCPA/LGPD compliance |
| `/terms` | Static | 12 sections + MIT + Colombia Law 1581 |
| `/project` | Static | Repo, stack, creator (GitHub API), donate |
| `/device` | Static | Live device detection + optimization guide |
| `/install` | Static | Usage guide, self-hosting, PWA, native apps (coming soon) |
| `/install/guide` | Static | Step-by-step usage guide for AI assistants |
| `/api/author` | Dynamic | Returns GitHub profile data (cached 1h) |
| `/llms.txt` | Static | LLM context file (llmstxt.org standard) |

## URL Parameters

Both encrypt and decrypt forms read query params from the URL on mount. Each param has a long and short alias. Sensitive params are auto-cleared from the URL via `history.replaceState`.

### Tab: `tab` / `t`

| Value | Effect |
|---|---|
| `encrypt` | Switch to encrypt tab |
| `decrypt` | Switch to decrypt tab |

### Encrypt params

| Long | Short | Type | Values | Sensitive |
|---|---|---|---|---|
| `passphrase` | `p` | string | min 6 chars | Yes |
| `passphrase2` | `p2` | string | min 6 chars (enables dual key) | Yes |
| `dual` | `d` | flag | `1` / `true` | No |
| `reveal` | `r` | string | min 6 chars | Yes |
| `mode` | `m` | enum | `text` / `file` | No |
| `ttl` | — | number | 0, 30, 60, 1440, 10080, 20160 (minutes) | No |
| `security` | `s` | enum | `standard` / `high` / `maximum` | No |
| `iterations` | `i` | number | 300000-1000000 (overridden by `security`) | No |
| `compression` | `c` | enum | `none` / `gzip` / `deflate` | No |
| `hint` | `h` | string | any | No |
| `note` | `n` | string | any | No |
| `question` | `q` | string | any | No |
| `answer` | `a` | string | any | Yes |
| `attempts` | `att` | number | 0, 3, 5, 10 | No |
| `ips` | — | string | comma-separated IPs (IPv4/IPv6) | No |

### Decrypt params

| Long | Short | Type | Sensitive |
|---|---|---|---|
| `passphrase` | `p` | string | Yes |
| `passphrase2` | `p2` | string (enables dual key) | Yes |
| `dual` | `d` | flag | No |
| `answer` | `a` | string | Yes |

### Examples

```
/?t=decrypt&p=myKey123
/?t=encrypt&m=file&ttl=30&c=gzip&s=high
/?t=encrypt&p=main&r=shared&h=check+email&q=Color?&a=blue&ips=10.0.0.1,192.168.1.5
```

## Theming

Two themes via `[data-theme="dark"]` / `[data-theme="light"]` on `<html>`.

Text hierarchy: `theme-heading` -> `theme-text` -> `theme-muted` -> `theme-faint`
Glass: `glass`, `glass-nav`, `glass-banner`, `glass-hover`, `glass-lift`
Semantic: `theme-danger`, `theme-warning`, `text-primary`
Buttons: `btn-primary`, `chip-select`
Animations: `animate-in`, `animate-in-down`, `animate-scale-in`, `reveal-content`, `error-shake`, `success-icon`, `glow-pulse`, `progress-bar-animated`, `skeleton-shimmer`

## Security Features (all inside encrypted payload)

- Expiration (UTC timestamp)
- Secret question (PBKDF2-SHA256 hashed answer, 100k iterations)
- IP restriction (IPv4/IPv6 allowlist)
- Max decryption attempts (localStorage tracking)
- Reveal key (separate encrypted block in ZEFR3 format)
- Dual passphrase (combined derivation via `\x00ZEFER_DUAL\x00`)
- Compression (Gzip/Deflate before encryption)
- Configurable PBKDF2 iterations (300k/600k/1M)
- Chunked encryption (16MB chunks for large files)

## Testing

- Framework: Vitest + @vitest/coverage-v8
- 125 tests across 7 test files
- Coverage: 100% statements, 100% functions, 100% lines, 99.47% branches
- Scripts: `npm test` (single run), `npm run test:watch` (dev mode)

## Conventions

- Components: `"use client"`, PascalCase filenames
- All interactive elements: `cursor-pointer`
- All icon buttons: `aria-label`
- Responsive: mobile-first, `min-[Xpx]:` for custom breakpoints
- Popovers: `fixed` on mobile, `absolute` on desktop
- Inputs: 16px minimum font-size on mobile (prevents iOS zoom)
- Animations: all respect `prefers-reduced-motion: reduce`
- File uploads: support both click and drag-and-drop

@AGENTS.md

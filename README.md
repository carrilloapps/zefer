# Zefer

**Client-side encryption tool for text and files. No servers, no traces, no cookies.**

Zefer encrypts your secrets into password-protected `.zefer` files using AES-256-GCM, entirely in your browser. Nothing ever leaves your device unencrypted.

**Live:** [zefer.carrillo.app](https://zefer.carrillo.app)

---

## Features

- **AES-256-GCM encryption** with PBKDF2-SHA256 key derivation (300k to 1M iterations)
- **Text and file mode** — encrypt plain text or any file type (images, ZIPs, PDFs, etc.)
- **Chunked encryption** — files over 16MB are split into chunks with unique IVs per chunk
- **Dynamic file limits** — auto-detects RAM, CPU, GPU, and platform at 80% capacity
- **Reveal key** — share a secondary key without exposing your main passphrase
- **Dual passphrase** — require two keys from different people to decrypt
- **Secret question** — additional authentication layer with PBKDF2-hashed answer (100k iterations)
- **IP restriction** — limit decryption to specific IPv4/IPv6 addresses
- **Built-in expiration** — 30min to 2 weeks, or no expiration (inside the encrypted payload)
- **Max attempts** — client-side decryption attempt limiting
- **Compression** — Gzip or Deflate via CompressionStream API
- **Drag and drop** — file upload supports drag-and-drop in both encrypt and decrypt
- **URL parameters** — pre-configure forms via URL for workflow automation
- **Secure key generator** — Unicode, alphanumeric, hex, or UUID v7 (64 to 1024 chars)
- **i18n** — Spanish, English, Portuguese
- **Light/dark mode** — auto-detects OS preference, persists user choice
- **WCAG 2.1 AA** — all text passes 4.5:1 contrast ratio
- **Responsive** — mobile-first, safe-area-inset support, 100dvh
- **Progress bar** — real-time encryption/decryption progress with device benchmarking
- **Legal compliance** — GDPR, CCPA, LGPD, Colombia Law 1581
- **MIT License**

## Architecture

```
Browser (client-side only)
  |
  |-- Text / File input (click or drag-and-drop)
  |-- Passphrase + options
  |-- PBKDF2 key derivation (Web Crypto API)
  |-- AES-256-GCM chunked encryption (Web Crypto API)
  |-- Optional: Gzip/Deflate compression (CompressionStream API)
  |-- Optional: Reveal key (second encrypted block)
  |-- .zefer file download (ZEFB3 or ZEFR3 binary format)
  |
  No server involved
```

### .zefer binary format (ZEFB3 — single key)

```
ZEFB3 (5 bytes magic)
header_length (4 bytes, big-endian)
header_json                         <- public header (minimal)
salt (32 bytes) + iv (12 bytes)
encrypted_chunks                    <- 16MB per chunk, unique IV per chunk
```

### .zefer binary format (ZEFR3 — with reveal key)

```
ZEFR3 (5 bytes magic)
header_length (4 bytes, big-endian)
header_json                         <- public header (minimal)
main_block_size (4 bytes)
main_salt + main_iv + main_chunks   <- encrypted with main passphrase
reveal_salt + reveal_iv + reveal_chunks <- encrypted with reveal key
```

**Public header** (visible without decryption):
- `iterations`, `compression`, `hint` (optional), `note` (optional), `mode` (text/file)

**Encrypted payload** (invisible without the key):
- Content, file metadata, expiration, secret question, IP list, max attempts

Legacy text formats (ZEFER3, ZEFER2) are supported for backward-compatible decryption only.

## Quick Start

```bash
git clone https://github.com/carrilloapps/zefer.git
cd zefer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.2 (React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Encryption | Web Crypto API (AES-256-GCM) |
| Key Derivation | PBKDF2-SHA256 (300k-1M iterations) |
| Compression | CompressionStream API (Gzip/Deflate) |
| Icons | Lucide React |
| Notifications | Sonner |
| Testing | Vitest + @vitest/coverage-v8 |
| Hosting | Vercel / Any static host |

## Project Structure

```
app/
  api/
    author/route.ts       # GitHub profile API (cached 1h)
  components/             # 22 client components
    EncryptForm.tsx        # Encrypt text/files
    DecryptForm.tsx        # Decrypt .zefer files
    HomeContent.tsx        # Home page with tabs
    KeyGenerator.tsx       # Secure key generator popover
    CryptoProgress.tsx     # Encryption/decryption progress bar
    ...                    # 17 more components
  lib/
    crypto.ts             # AES-256-GCM + PBKDF2 + benchmarking
    zefer.ts              # .zefer format encode/decode (ZEFB3/ZEFR3)
    chunked-crypto.ts     # Chunked encryption (16MB per chunk)
    compression.ts        # Gzip/Deflate via CompressionStream
    device.ts             # RAM/CPU/GPU detection + file limits
    i18n.ts               # Translations (es/en/pt, ~250 keys)
    ip.ts                 # IP detection and restriction
    notify.ts             # Toast notification helpers
    preferences.ts        # Persisted user preferences
    progress.ts           # Encryption progress tracking
    __tests__/            # 125 Vitest tests (7 files)
  globals.css             # Design system (liquid glass, theming)
  layout.tsx              # Root layout + providers
  page.tsx                # Home page
docs/                     # ARCHITECTURE, SECURITY, DEPLOYMENT, CONTRIBUTING
public/
  llms.txt                # LLM context file (llmstxt.org standard)
```

## Routes

| Route | Type | Description |
|---|---|---|
| `/` | Static | Home — encrypt/decrypt forms |
| `/how` | Static | How it works — 7 steps + features + specs |
| `/privacy` | Static | Privacy policy + GDPR/CCPA/LGPD compliance |
| `/terms` | Static | Terms, conditions, MIT license, legal compliance |
| `/project` | Static | Project info, tech stack, creator, donate |
| `/device` | Static | Device detection details + optimization guide |
| `/install` | Static | Usage guide, self-hosting, PWA, native apps (coming soon) |
| `/api/author` | Dynamic | GitHub profile data (cached 1h) |
| `/llms.txt` | Static | LLM context file |

## URL Parameters

Pre-configure forms via URL for workflow automation. Every parameter has a long name and short alias.

### Tab: `tab` / `t` — `encrypt` or `decrypt`

### Encrypt (`/?tab=encrypt&...`)

| Long | Short | Type | Values |
|---|---|---|---|
| `passphrase` | `p` | string | min 6 chars |
| `passphrase2` | `p2` | string | min 6 chars (enables dual key) |
| `dual` | `d` | flag | `1` / `true` |
| `reveal` | `r` | string | min 6 chars |
| `mode` | `m` | enum | `text` / `file` |
| `ttl` | — | number | 0=never, 30, 60, 1440, 10080, 20160 (minutes) |
| `security` | `s` | enum | `standard` / `high` / `maximum` |
| `iterations` | `i` | number | 300000-1000000 |
| `compression` | `c` | enum | `none` / `gzip` / `deflate` |
| `hint` | `h` | string | any |
| `note` | `n` | string | any |
| `question` | `q` | string | any |
| `answer` | `a` | string | any |
| `attempts` | `att` | number | 0, 3, 5, 10 |
| `ips` | — | string | comma-separated IPv4/IPv6 |

### Decrypt (`/?tab=decrypt&...`)

| Long | Short | Type |
|---|---|---|
| `passphrase` | `p` | string |
| `passphrase2` | `p2` | string (enables dual key) |
| `dual` | `d` | flag |
| `answer` | `a` | string |

Sensitive params (`passphrase`, `passphrase2`, `reveal`, `answer`) are auto-cleared from the URL after reading.

```bash
/?t=decrypt&p=mySecret123
/?t=encrypt&m=file&ttl=30&c=gzip&s=high
/?t=encrypt&p=key1&p2=key2&q=Color%3F&a=blue&ips=10.0.0.1,192.168.1.5&s=maximum
```

## Testing

```bash
npm test              # Run 125 tests
npm run test:watch    # Watch mode
```

Coverage: 100% statements, 100% functions, 100% lines, 99.47% branches.

## Security Model

1. All encryption/decryption happens in the browser via Web Crypto API
2. The server never sees plaintext, passphrases, or encryption keys
3. The `.zefer` file header contains only minimal technical data (iterations, compression)
4. All security metadata (expiration, IPs, question) is inside the encrypted payload
5. An attacker with the file cannot determine what security features are enabled
6. Each file has unique encryption (random salt + IV per block)
7. Reveal key is independently encrypted with its own salt, IV, and derived key

## Legal Compliance

| Regulation | Status |
|---|---|
| GDPR (EU) | Compliant — no personal data collected |
| CCPA (California) | Compliant — no personal information sold or shared |
| LGPD (Brazil) | Compliant — Art. 5, 18 |
| Law 1581 (Colombia) | Compliant — Art. 4, 9 |
| ePrivacy Directive | Compliant — no cookies, trackers, or analytics |

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Contributing](docs/CONTRIBUTING.md)

## Author

**Jose Carrillo** — Senior Fullstack Developer & Tech Lead

- GitHub: [@carrilloapps](https://github.com/carrilloapps)
- Website: [carrillo.app](https://carrillo.app)
- Donate: [Buy Me a Coffee](https://www.buymeacoffee.com/carrilloapps)

## License

[MIT](LICENSE) - Copyright (c) 2026 Jose Carrillo

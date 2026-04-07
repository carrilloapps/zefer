# Zefer

**Client-side encryption tool for text and files. No servers, no traces, no cookies.**

Zefer encrypts your secrets into password-protected `.zefer` files using AES-256-GCM, entirely in your browser. Nothing ever leaves your device unencrypted.

**Live:** [zefer.carrillo.app](https://zefer.carrillo.app)

---

## Features

- **AES-256-GCM encryption** with PBKDF2-SHA256 key derivation (300k to 1M iterations)
- **Text and file mode** — encrypt plain text or any file type (images, ZIPs, PDFs, etc.)
- **Dynamic file limits** — auto-detects RAM, CPU, GPU, and platform at 80% capacity
- **Reveal key** — share a secondary key without exposing your main passphrase
- **Dual passphrase** — require two keys from different people to decrypt
- **Secret question** — additional authentication layer with SHA-256 hashed answer
- **IP restriction** — limit decryption to specific IPv4/IPv6 addresses
- **Built-in expiration** — 30min to 2 weeks, or no expiration (inside the encrypted payload)
- **Max attempts** — client-side decryption attempt limiting
- **Strict instance mode** — bind files to a specific Zefer instance via server-side secret
- **Compression** — Gzip or Deflate via CompressionStream API
- **Secure key generator** — Unicode, alphanumeric, hex, or UUID v7 (64 to 1024 chars)
- **i18n** — Spanish, English, Portuguese
- **Light/dark mode** — auto-detects OS preference, persists user choice
- **WCAG 2.1 AA** — all text passes 4.5:1 contrast ratio
- **Responsive** — mobile-first, safe-area-inset support, 100dvh
- **Skeleton loading** — shimmer animation during provider hydration
- **Progress bar** — real-time encryption/decryption progress with device benchmarking
- **Legal compliance** — GDPR, CCPA, LGPD, Colombia Law 1581
- **MIT License**

## Architecture

```
Browser (client-side only)
  |
  |-- Text / File input
  |-- Passphrase + options
  |-- PBKDF2 key derivation (Web Crypto API)
  |-- AES-256-GCM encryption (Web Crypto API)
  |-- Optional: Gzip/Deflate compression (CompressionStream API)
  |-- .zefer file download
  |
  No server involved (except /api/instance for strict mode hash)
```

### .zefer file format (ZEFER3)

```
ZEFER3                          <- magic number
{"iterations":600000,...}       <- public header (minimal)
<base64(salt.iv.ciphertext)>    <- encrypted payload (main key)
<base64(salt.iv.ciphertext)>    <- encrypted payload (reveal key, optional)
```

**Public header** (visible without decryption):
- `iterations`, `compression`, `hint` (optional), `note` (optional), `mode` (text/file)

**Encrypted payload** (invisible without the key):
- Content, file metadata, expiration, secret question, IP list, strict mode, max attempts

## Quick Start

```bash
# Clone
git clone https://github.com/carrilloapps/zefer.git
cd zefer

# Install
npm install

# Generate instance secret (for strict encryption mode)
npm run generate-secret

# Development
npm run dev

# Build
npm run build

# Start
npm start
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ZEFER_INSTANCE_SECRET` | No | Enables strict encryption mode. Set in hosting env (Vercel, Docker). Never commit. |

Generate with:
```bash
npm run generate-secret
# or manually:
openssl rand -hex 128
```

See [`.env.example`](.env.example) for details.

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
| Hosting | Vercel / Any static host |

## Project Structure

```
app/
  api/
    author/route.ts       # GitHub profile API (cached)
    instance/route.ts     # Strict mode hash endpoint
  components/
    CryptoProgress.tsx    # Encryption/decryption progress bar
    DecryptForm.tsx       # Decrypt .zefer files
    DeviceContent.tsx     # /device page
    DeviceInfo.tsx        # Device capability indicator
    EncryptForm.tsx       # Encrypt text/files
    Footer.tsx            # Global footer
    HomeContent.tsx       # Home page
    HowContent.tsx        # /how page
    KeyGenerator.tsx      # Secure key generator popover
    LanguageProvider.tsx  # i18n context
    LanguageSelector.tsx  # Language dropdown
    LegalBanner.tsx       # Cookie/legal consent banner
    Navbar.tsx            # Global navigation
    PrivacyContent.tsx    # /privacy page
    ProjectContent.tsx    # /project page
    Skeleton.tsx          # Loading skeleton
    TermsContent.tsx      # /terms page
    ThemeProvider.tsx      # Dark/light mode context
    ThemeToggle.tsx        # Theme switch button
  lib/
    compression.ts        # Gzip/Deflate via CompressionStream
    crypto.ts             # AES-256-GCM + PBKDF2 + benchmarking
    device.ts             # RAM/CPU/GPU detection + file limits
    i18n.ts               # Translations (es/en/pt)
    instance.ts           # Strict mode instance binding
    ip.ts                 # IP detection and restriction
    preferences.ts        # Persisted user preferences
    progress.ts           # Encryption progress tracking
    zefer.ts              # .zefer format encode/decode (ZEFER3)
  device/page.tsx         # Device performance page
  how/page.tsx            # How it works page
  privacy/page.tsx        # Privacy & security page
  project/page.tsx        # Project info page
  terms/page.tsx          # Terms & conditions page
  globals.css             # Design system (liquid glass, theming)
  layout.tsx              # Root layout + providers
  page.tsx                # Home page
  icon.svg                # Favicon
  apple-icon.tsx          # Apple touch icon (generated)
  opengraph-image.tsx     # OG image (generated)
  twitter-image.tsx       # Twitter card (generated)
  manifest.ts             # PWA manifest
  robots.ts               # robots.txt
  sitemap.ts              # sitemap.xml
scripts/
  generate-secret.mjs     # Instance secret generator
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
| `/api/instance` | Dynamic | Returns SHA-256 hash of instance secret |
| `/api/author` | Dynamic | GitHub profile data (cached 1h) |

## Security Model

1. All encryption/decryption happens in the browser via Web Crypto API
2. The server never sees plaintext, passphrases, or encryption keys
3. The `.zefer` file header contains only minimal technical data (iterations, compression)
4. All security metadata (expiration, IPs, question, strict mode) is inside the encrypted payload
5. An attacker with the file cannot determine what security features are enabled
6. Strict mode binds files to a specific instance via a server-held secret (SHA-256 hashed)
7. The instance secret never leaves the server — only a hash is sent to the client

## Legal Compliance

| Regulation | Status | Details |
|---|---|---|
| GDPR (EU) | Compliant | No personal data collected. Art. 5, 6, 7, 13, 14, 25 |
| CCPA (California) | Compliant | No personal information sold or shared |
| LGPD (Brazil) | Compliant | Art. 5, 18 |
| Law 1581 (Colombia) | Compliant | Art. 4, 9. SIC registration not required |
| ePrivacy Directive | Compliant | No cookies, trackers, or analytics |

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

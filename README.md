<div align="center">

<img src="app/icon.svg" alt="Zefer" width="80" height="80" />

# Zefer

**Share secrets, not risks.**

Client-side encryption tool that converts text and files into password-protected `.zefer` files using AES-256-GCM. 100% browser-based — no servers, no traces, no cookies.

[![Live](https://img.shields.io/badge/Live-zefer.carrillo.app-22c55e?style=flat-square)](https://zefer.carrillo.app)
[![License](https://img.shields.io/github/license/carrilloapps/zefer?style=flat-square&color=22c55e)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-125%20passed-22c55e?style=flat-square)](https://github.com/carrilloapps/zefer)
[![Coverage](https://img.shields.io/badge/coverage-100%25-22c55e?style=flat-square)](https://github.com/carrilloapps/zefer)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.2-000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=000)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG%202.1-AA-22c55e?style=flat-square)](https://www.w3.org/WAI/WCAG21/quickref/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-22c55e?style=flat-square)](docs/CONTRIBUTING.md)
[![GitHub stars](https://img.shields.io/github/stars/carrilloapps/zefer?style=flat-square&color=22c55e)](https://github.com/carrilloapps/zefer/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/carrilloapps/zefer?style=flat-square)](https://github.com/carrilloapps/zefer/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/carrilloapps/zefer?style=flat-square)](https://github.com/carrilloapps/zefer/commits/main)

<br />

[Live Demo](https://zefer.carrillo.app) · [Report Bug](https://github.com/carrilloapps/zefer/issues/new?template=bug_report.md) · [Request Feature](https://github.com/carrilloapps/zefer/issues/new?template=feature_request.md) · [Security Report](https://github.com/carrilloapps/zefer/issues/new?template=security_vulnerability.md) · [Documentation](docs/)

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Architecture](#architecture)
- [Binary File Format](#binary-file-format)
- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Routes](#routes)
- [URL Parameters](#url-parameters)
- [Testing](#testing)
- [Security Model](#security-model)
- [Legal Compliance](#legal-compliance)
- [Deployment](#deployment)
- [AI Integration](#ai-integration)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [Author](#author)
- [Support](#support)
- [License](#license)

## About

Zefer encrypts your secrets into password-protected `.zefer` files using AES-256-GCM with PBKDF2-SHA256 key derivation, entirely in your browser. Nothing ever leaves your device unencrypted.

- **Zero-knowledge** — the server never sees plaintext, passphrases, or encryption keys
- **No cookies, no analytics, no trackers** — zero data collection
- **Open source** — MIT license, fully auditable
- **Standards-based** — Web Crypto API, CompressionStream API, no third-party crypto dependencies

## Features

<table>
<tr>
<td width="50%">

**Encryption**
- AES-256-GCM with PBKDF2-SHA256 (300k-1M iterations)
- Text and file mode (images, ZIPs, PDFs, etc.)
- Chunked encryption (16MB per chunk, unique IVs)
- Gzip/Deflate compression via CompressionStream API
- Dynamic file limits (auto-detects RAM, CPU, GPU)

</td>
<td width="50%">

**Security Layers**
- Reveal key — share without exposing the main passphrase
- Dual passphrase — two-person authorization
- Secret question with PBKDF2-hashed answer (100k iterations)
- IP restriction (IPv4/IPv6 allowlist)
- Built-in expiration (30min to 2 weeks)
- Max decryption attempts

</td>
</tr>
<tr>
<td width="50%">

**Developer Experience**
- URL parameters for workflow automation
- Secure key generator (Unicode, alpha, hex, UUID v7)
- Real-time progress bar with device benchmarking
- Drag-and-drop file upload
- 125 tests, 100% line coverage

</td>
<td width="50%">

**Accessibility & i18n**
- WCAG 2.1 AA (4.5:1 contrast ratio)
- Light/dark mode (auto-detects OS preference)
- 3 languages: Spanish, English, Portuguese
- Mobile-first responsive design
- Respects `prefers-reduced-motion`

</td>
</tr>
</table>

## Architecture

```
Browser (client-side only)
  │
  ├── Text / File input (click or drag-and-drop)
  ├── Passphrase + options
  ├── PBKDF2 key derivation (Web Crypto API)
  ├── AES-256-GCM chunked encryption (Web Crypto API)
  ├── Optional: Gzip/Deflate compression (CompressionStream API)
  ├── Optional: Reveal key (second encrypted block)
  └── .zefer file download (ZEFB3 or ZEFR3 binary format)

  No server involved
```

For detailed data flow diagrams, component tree, and theming system, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Binary File Format

### ZEFB3 — Single key (primary format)

```
ZEFB3 (5 bytes magic)
header_length (4 bytes, big-endian)
header_json                         ← public header (minimal)
salt (32 bytes) + iv (12 bytes)
encrypted_chunks                    ← 16MB per chunk, unique IV per chunk
```

### ZEFR3 — With reveal key

```
ZEFR3 (5 bytes magic)
header_length (4 bytes, big-endian)
header_json                         ← public header (minimal)
main_block_size (4 bytes)
main_salt + main_iv + main_chunks   ← encrypted with main passphrase
reveal_salt + reveal_iv + reveal_chunks ← encrypted with reveal key
```

**Public header** (visible without decryption): `iterations`, `compression`, `hint`, `note`, `mode`

**Encrypted payload** (invisible without the key): content, file metadata, expiration, secret question, IP list, max attempts

> Legacy text formats (ZEFER3, ZEFER2) are supported for backward-compatible decryption only.

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone https://github.com/carrilloapps/zefer.git
cd zefer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Verify

```bash
npm test              # 125 tests
npx tsc --noEmit      # Type check
npm run build         # Production build
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16.2.2](https://nextjs.org/) (React 19) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Encryption | Web Crypto API (AES-256-GCM) |
| Key Derivation | PBKDF2-SHA256 (300k-1M iterations) |
| Compression | CompressionStream API (Gzip/Deflate) |
| Icons | [Lucide React](https://lucide.dev/) |
| Notifications | [Sonner](https://sonner.emilkowal.dev/) |
| Testing | [Vitest](https://vitest.dev/) + @vitest/coverage-v8 |
| Hosting | [Vercel](https://vercel.com/) / Any static host |

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
docs/                     # Architecture, Security, Deployment, Contributing
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
| `/install` | Static | Usage guide, self-hosting, PWA, native apps |
| `/api/author` | Dynamic | GitHub profile data (cached 1h) |
| `/llms.txt` | Static | LLM context file |

## URL Parameters

Pre-configure forms via URL for workflow automation. Every parameter has a long name and short alias. Sensitive params are auto-cleared from the URL after reading.

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

### Examples

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

| Metric | Value |
|---|---|
| Test files | 7 |
| Total tests | 125 |
| Statements | 100% |
| Functions | 100% |
| Lines | 100% |
| Branches | 99.47% |

## Security Model

1. All encryption/decryption happens in the browser via Web Crypto API
2. The server never sees plaintext, passphrases, or encryption keys
3. The `.zefer` file header contains only minimal technical data
4. All security metadata (expiration, IPs, question) is inside the encrypted payload
5. An attacker with the file cannot determine what security features are enabled
6. Each file has unique encryption (random salt + IV per block)
7. Reveal key is independently encrypted with its own salt, IV, and derived key

| Primitive | Algorithm | Parameters |
|---|---|---|
| Symmetric encryption | AES-256-GCM | 256-bit key, 96-bit IV, 128-bit auth tag |
| Key derivation | PBKDF2-SHA256 | 300k/600k/1M iterations, 256-bit salt |
| Answer hashing | PBKDF2-SHA256 | 100,000 iterations |
| Random generation | `crypto.getRandomValues` | OS-level CSPRNG |

For the full threat model, known limitations, and security guarantees, see [docs/SECURITY.md](docs/SECURITY.md).

## Legal Compliance

| Regulation | Status |
|---|---|
| GDPR (EU) | Compliant — no personal data collected |
| CCPA (California) | Compliant — no personal information sold or shared |
| LGPD (Brazil) | Compliant — Art. 5, 18 |
| Law 1581 (Colombia) | Compliant — Art. 4, 9 |
| ePrivacy Directive | Compliant — no cookies, trackers, or analytics |

## Deployment

| Method | Command | Notes |
|---|---|---|
| **Vercel** | Push to GitHub + Import in Vercel | Recommended, zero-config |
| **Docker** | `docker build -t zefer . && docker run -p 3000:3000 zefer` | Production-ready Dockerfile in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| **Static export** | `npm run build` with `output: "export"` | Disables `/api/author` route |
| **Self-hosted** | `npm run build && npm start` | Requires Node.js 20+, HTTPS |

HTTPS is required — Web Crypto API is only available in secure contexts. See the full [Deployment Guide](docs/DEPLOYMENT.md).

## AI Integration

Zefer publishes [`/llms.txt`](https://zefer.carrillo.app/llms.txt) following the [llmstxt.org](https://llmstxt.org/) standard. Any AI tool can use it as context:

| Tool | Usage |
|---|---|
| Claude Code | Reads `CLAUDE.md` and `AGENTS.md` automatically when cloned |
| GitHub Copilot | `@workspace /explain #file:llms.txt` |
| Cursor / Windsurf / Augment | Add `llms.txt` as context file |
| Any LLM | Pass `https://zefer.carrillo.app/llms.txt` as context URL |

## Contributing

Contributions are welcome! Please read the [Contributing Guide](docs/CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Run tests (`npm test`) and verify types (`npx tsc --noEmit`)
4. Submit a pull request

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | Data flow, binary format, component tree, theming |
| [Security](docs/SECURITY.md) | Threat model, cryptographic primitives, guarantees, limitations |
| [Deployment](docs/DEPLOYMENT.md) | Vercel, Docker, static export, self-hosting |
| [Contributing](docs/CONTRIBUTING.md) | Setup, conventions, PR workflow |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Community standards |
| [Changelog](CHANGELOG.md) | Version history and release notes |

## Author

<a href="https://github.com/carrilloapps">
<img src="https://github.com/carrilloapps.png" width="80" height="80" alt="Jose Carrillo" style="border-radius: 50%;" />
</a>

**Jose Carrillo** — Senior Fullstack Developer & Tech Lead

10+ years building scalable, efficient, and secure software. Based in Colombia.

<p>
<a href="https://github.com/carrilloapps"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" /></a>
<a href="https://carrillo.app"><img src="https://img.shields.io/badge/Website-carrillo.app-22c55e?style=flat-square&logo=googlechrome&logoColor=white" alt="Website" /></a>
<a href="https://linkedin.com/in/carrilloapps"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
<a href="https://x.com/carrilloapps"><img src="https://img.shields.io/badge/X-000000?style=flat-square&logo=x&logoColor=white" alt="X" /></a>
<a href="https://dev.to/carrilloapps"><img src="https://img.shields.io/badge/Dev.to-0A0A0A?style=flat-square&logo=devdotto&logoColor=white" alt="Dev.to" /></a>
<a href="https://medium.com/@carrilloapps"><img src="https://img.shields.io/badge/Medium-000000?style=flat-square&logo=medium&logoColor=white" alt="Medium" /></a>
<a href="https://stackoverflow.com/users/14580648"><img src="https://img.shields.io/badge/Stack%20Overflow-F58025?style=flat-square&logo=stackoverflow&logoColor=white" alt="Stack Overflow" /></a>
</p>

## Support

If you find Zefer useful, consider supporting the project:

<p>
<a href="https://www.buymeacoffee.com/carrilloapps"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=flat-square&logo=buymeacoffee&logoColor=000" alt="Buy Me a Coffee" /></a>
<a href="https://github.com/sponsors/carrilloapps"><img src="https://img.shields.io/badge/GitHub%20Sponsors-EA4AAA?style=flat-square&logo=githubsponsors&logoColor=white" alt="GitHub Sponsors" /></a>
<a href="https://github.com/carrilloapps/zefer/stargazers"><img src="https://img.shields.io/github/stars/carrilloapps/zefer?style=social" alt="Star on GitHub" /></a>
</p>

## License

[MIT](LICENSE) &copy; 2026 [Jose Carrillo](https://carrillo.app)

---

<div align="center">
<sub>Built with security in mind, from Colombia to the world.</sub>
</div>

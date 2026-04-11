<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Zefer Agent Guidelines

## Project Overview

Zefer is a 100% client-side encryption tool. Files are encrypted in the browser using AES-256-GCM and downloaded as `.zefer` files. No server stores user data.

Live: https://zefer.carrillo.app
LLM context: https://zefer.carrillo.app/llms.txt

## Key Rules

1. **All colors must use CSS variables or theme-* classes** — never hardcode Tailwind color classes
2. **All text must be in i18n.ts** with translations in es, en, pt
3. **Security metadata must be inside the encrypted payload** — never in the public header
4. **Components are "use client"** — this is a client-heavy app
5. **Minimum passphrase length is 6 characters**
6. **Test both dark and light mode** after any CSS change
7. **All text must pass WCAG 2.1 AA** (4.5:1 contrast ratio)
8. **Run `npm test` before any commit** — 125 tests must pass
9. **URL params: every new option needs a long + short alias** in both EncryptForm and DecryptForm

## How to Use Zefer (for AI agents)

### Encrypt text

1. Open https://zefer.carrillo.app or `/?t=encrypt`
2. Select "Text" mode, type or paste content
3. Set a passphrase (min 6 characters)
4. Choose expiration (5 min to 1 month, or no expiration)
5. Click Encrypt — downloads a `.zefer` file

### Encrypt via URL params

```
/?t=encrypt&p=myPassphrase&ttl=30&s=high&c=gzip
```

All params: `passphrase/p`, `passphrase2/p2`, `dual/d`, `reveal/r`, `mode/m`, `ttl`, `security/s`, `iterations/i`, `compression/c`, `hint/h`, `note/n`, `question/q`, `answer/a`, `attempts/att`, `ips`

### Decrypt

1. Open `/?t=decrypt` or `/?t=decrypt&p=thePassphrase`
2. Upload or drag the `.zefer` file
3. Enter passphrase (or it's pre-filled from URL)
4. View or download decrypted content

### Decrypt via URL params

```
/?t=decrypt&p=myPassphrase
/?t=decrypt&p=key1&p2=key2&a=answer
```

Decrypt params: `passphrase/p`, `passphrase2/p2`, `dual/d`, `answer/a`

Sensitive params (p, p2, r, a) are auto-cleared from the URL after reading.

## Binary File Format

- **ZEFB3**: single-key files (magic: `0x5A 0x45 0x46 0x42 0x33`)
- **ZEFR3**: files with reveal key (magic: `0x5A 0x45 0x46 0x52 0x33`)
- Chunked encryption: 16MB per chunk, unique IV per chunk
- Payload: 4-byte meta length + metadata JSON + content bytes

## Security Features (all inside encrypted payload)

- Reveal key (separate encrypted block in ZEFR3)
- Dual passphrase (combined via `\x00ZEFER_DUAL\x00`)
- Secret question (PBKDF2-SHA256 hashed answer, 100k iterations)
- IP restriction (comma-separated IPv4/IPv6)
- Expiration (UTC timestamp)
- Max attempts (localStorage)
- Compression (Gzip/Deflate)
- PBKDF2 iterations (300k/600k/1M)

## Tech Stack

- Next.js 16.2.3 (React 19), TypeScript 5, Tailwind CSS v4
- Web Crypto API, CompressionStream API
- Vitest (125 tests, 100% line coverage)
- i18n: es, en, pt

## For AI Tool Integration

Zefer publishes `/llms.txt` following the llmstxt.org standard. Any AI tool can use it as context:

- **Claude Code**: reads `CLAUDE.md` and `AGENTS.md` automatically when cloned
- **GitHub Copilot**: `@workspace /explain #file:llms.txt`
- **Cursor / Windsurf / Augment**: add `llms.txt` as context file
- **Any LLM**: pass `https://zefer.carrillo.app/llms.txt` as context URL

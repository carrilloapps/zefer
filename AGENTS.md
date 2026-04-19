<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Zefer Agent Guidelines

## Project Overview

Zefer is a 100% client-side encryption tool. Files are encrypted in the browser using AES-256-GCM and downloaded as `.zefer` files. No server stores user data.

- **Web app**: https://zefer.carrillo.app — source: https://github.com/carrilloapps/zefer
- **CLI companion**: `zefer-cli` — source: https://github.com/carrilloapps/zefer-cli
- **LLM context**: https://zefer.carrillo.app/llms.txt

Files created by the web app and the CLI are **fully cross-compatible** — same binary format, same cryptographic parameters.

---

## Using Zefer from the CLI (zefer-cli)

AI agents can use `zefer-cli` directly from the terminal for automation, scripting, and file encryption without opening a browser.

### Install

```bash
npm install -g zefer-cli        # recommended
npx zefer-cli <command>         # without installing
```

Or download a standalone binary (no Node.js required):
- Linux x64: https://github.com/carrilloapps/zefer-cli/releases/latest/download/zefer-linux-x64
- Linux ARM64: https://github.com/carrilloapps/zefer-cli/releases/latest/download/zefer-linux-arm64
- macOS Intel: https://github.com/carrilloapps/zefer-cli/releases/latest/download/zefer-macos-x64
- macOS Apple Silicon: https://github.com/carrilloapps/zefer-cli/releases/latest/download/zefer-macos-arm64
- Windows x64: https://github.com/carrilloapps/zefer-cli/releases/latest/download/zefer-win-x64.exe

### Encrypt a file

```bash
zefer encrypt report.pdf -p mypassphrase
# → report.pdf.zefer
```

### Encrypt text directly

```bash
zefer encrypt --text "secret note" -p mypassphrase -o note.zefer
```

### Encrypt from stdin (pipe-friendly)

```bash
echo "api_key=abc123" | zefer encrypt - -p mypassphrase -o secrets.zefer
cat document.pdf | zefer encrypt - -p mypassphrase -o document.zefer
```

### Decrypt a file

```bash
zefer decrypt report.pdf.zefer -p mypassphrase
# file mode: writes report.pdf
# text mode: prints to stdout
```

### Decrypt to stdout (text mode)

```bash
zefer decrypt note.zefer -p mypassphrase | grep "important"
```

### Generate a secure passphrase

```bash
zefer keygen                          # 64-char base64url (recommended)
zefer keygen --mode alpha --length 32 # printable ASCII
zefer keygen --mode hex   --length 32 # hex token
zefer keygen --mode uuid              # UUID v4
zefer keygen --mode unicode --length 24 # CJK + emoji
zefer keygen --count 5                # 5 keys at once
```

### Inspect a .zefer file (without passphrase)

```bash
zefer info secret.zefer
# Shows: format (ZEFB3/ZEFR3), mode, iterations, compression, hint, note
# Security details (expiry, IP, question, attempts) are invisible without passphrase
```

### Full security options

```bash
zefer encrypt secret.txt \
  -p "main-passphrase" \
  -2 "second-key" --dual-key \       # two-person authorization
  --reveal "reveal-passphrase" \     # share without exposing main key (ZEFR3)
  -q "Pet name?" -a "firulais" \     # secret question (PBKDF2-hashed answer)
  --ttl 1440 \                       # expires in 24 hours
  --max-attempts 3 \                 # 3 failed attempts = locked
  --allowed-ips "10.0.0.1,::1" \    # IPv4/IPv6 allowlist
  --hint "two parts needed" \        # public hint (visible without passphrase)
  --note "For Alice only" \          # public note
  -c gzip \                          # compress before encrypting
  -i 1000000 \                       # 1M PBKDF2 iterations
  --verbose                          # show all options before encrypting
```

### Automation / CI examples

```bash
# Encrypt all .env files before committing
for f in *.env; do
  zefer encrypt "$f" -p "$ZEFER_PASS" -o "encrypted/$f.zefer"
done

# Decrypt and pipe to another command
zefer decrypt secrets.zefer -p "$ZEFER_PASS" | jq '.api_key'

# Verify wrong passphrase exits with code 1
if ! zefer decrypt file.zefer -p wrong 2>/dev/null; then
  echo "Wrong passphrase (expected)"
fi
```

### CLI flags reference

```
encrypt [input] [options]
  input                 File path, - for stdin, or use --text
  -o, --output          Output path (default: <input>.zefer)
  -p, --passphrase      Passphrase (prompted if omitted)
  -2, --second          Second passphrase (dual-key mode)
  -r, --reveal          Reveal key (ZEFR3 format)
  -t, --text            Encrypt text directly
  --hint                Public hint
  --note                Public note
  -q, --question        Secret question
  -a, --answer          Secret question answer
  --ttl <minutes>       Expiration (0 = never)
  -i, --iterations      PBKDF2 iterations (0 = auto-benchmark)
  -c, --compression     none|gzip|deflate|deflate-raw
  --max-attempts        Max decryption attempts (0 = unlimited)
  --allowed-ips         Comma-separated IPv4/IPv6
  --dual-key            Enable dual-key mode (requires -2)
  --verbose             Show security details

decrypt <input> [options]
  -o, --output          Output path (default: stdout/original name)
  -p, --passphrase      Passphrase
  -2, --second          Second passphrase
  -a, --answer          Secret question answer
  --force               Overwrite existing output file

keygen [options]
  -m, --mode            alpha|hex|uuid|secure|unicode (default: secure)
  -l, --length          Length in characters (default: 64)
  -n, --count           Number of keys (default: 1)

info <input>            Show public header without decrypting
```

---

## Using Zefer from the Web App

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

Sensitive params (`p`, `p2`, `r`, `a`) are auto-cleared from the URL after reading.

---

## Binary File Format (cross-compatible web ↔ CLI)

- **ZEFB3**: single-key files (magic: `0x5A 0x45 0x46 0x42 0x33`)
- **ZEFR3**: files with reveal key (magic: `0x5A 0x45 0x46 0x52 0x33`)
- Chunked encryption: 16MB per chunk, unique IV per chunk (base_iv XOR chunk_index, unsigned 32-bit)
- Payload: 4-byte meta length + metadata JSON + content bytes
- Auth tag: 16 bytes appended to each AES-GCM ciphertext (Web Crypto API layout)

---

## Security Features (all inside encrypted payload)

- Reveal key (separate encrypted block in ZEFR3)
- Dual passphrase (combined via `\x00ZEFER_DUAL\x00`)
- Secret question (PBKDF2-SHA256 hashed answer, 100k iterations)
- IP restriction (comma-separated IPv4/IPv6)
- Expiration (UTC timestamp, ms)
- Max attempts (localStorage in browser, `~/.zefer/attempts.json` in CLI)
- Compression (Gzip/Deflate, before encryption)
- PBKDF2 iterations (300k/600k/1M or auto-benchmarked)

---

## Web App Code Rules (for AI agents editing this repo)

1. **All colors must use CSS variables or theme-* classes** — never hardcode Tailwind color classes
2. **All text must be in i18n.ts** with translations in es, en, pt
3. **Security metadata must be inside the encrypted payload** — never in the public header
4. **Components are "use client"** — this is a client-heavy app
5. **Minimum passphrase length is 6 characters**
6. **Test both dark and light mode** after any CSS change
7. **All text must pass WCAG 2.1 AA** (4.5:1 contrast ratio)
8. **Run `npm test` before any commit** — 125 tests must pass
9. **URL params: every new option needs a long + short alias** in both EncryptForm and DecryptForm

## Accessibility Rules

- Icon-only buttons: minimum 36x36px (`w-9 h-9`) with `aria-label` (dynamic when state changes)
- Headings: strict descending order (h1 → h2 → h3). Footer labels use `<p>`, not heading tags
- Expand/collapse controls: must have `aria-expanded` and descriptive `aria-label`

## Versioning (web app)

When releasing a new version, ALL of these must be updated together:
- `CHANGELOG.md`, `package.json`, `app/layout.tsx` (JSON-LD `softwareVersion`), `app/opengraph-image.tsx` (badge), `app/twitter-image.tsx` (badge), `app/sitemap.ts` (`lastModified`)

## SEO Rules

- Every `page.tsx` must export `metadata` with: title, description, keywords, openGraph (url, title, description), twitter (card, title, description), alternates.canonical
- Legal/doc pages (`/privacy`, `/terms`, `/security`, `/conduct`): `robots: { index: false, follow: true }` — excluded from sitemap
- 404 page: `robots: { index: false, follow: false }`
- Only indexable routes go in `app/sitemap.ts`
- JSON-LD `WebApplication` schema lives in `app/layout.tsx`; `BreadcrumbList` on subpages; `FAQPage` on `/how` and all `/vs/*` pages
- OG/Twitter images must be explicit with `images` field; title 40-60 chars; description 120-160 chars
- Layout widths: `max-w-2xl` for hero/subtitle, `max-w-3xl` for content. Never `max-w-4xl`+
- No custom Cache-Control headers on `/_next/static/*`
- No `glass` class nested inside another `glass` container

## Tech Stack

- Next.js 16.2.3 (React 19), TypeScript 6, Tailwind CSS v4
- Web Crypto API, CompressionStream API
- Vitest (125 tests, 100% line coverage)
- i18n: es, en, pt (~600 translation keys)

## For AI Tool Integration

Zefer publishes `/llms.txt` following the llmstxt.org standard. Any AI tool can use it as context:

- **Claude Code**: reads `CLAUDE.md` and `AGENTS.md` automatically when cloned
- **GitHub Copilot**: `@workspace /explain #file:llms.txt`
- **Cursor / Windsurf / Augment**: add `llms.txt` as context file
- **Any LLM**: pass `https://zefer.carrillo.app/llms.txt` as context URL

# Zefer — Project Context

## What is Zefer

Client-side encryption tool that converts text and files into password-protected `.zefer` files using AES-256-GCM. 100% browser-based — no server stores, processes, or transmits user data. Open source, MIT license, created by José Carrillo (@carrilloapps).

**Live:** https://zefer.carrillo.app
**Repo:** https://github.com/carrilloapps/zefer

## Stack

- Next.js 16.2.2 (React 19), TypeScript 5, Tailwind CSS v4
- Web Crypto API (AES-256-GCM, PBKDF2-SHA256), CompressionStream API
- Lucide React icons, no other runtime dependencies

## Critical Rules

1. **Never hardcode colors** — use `theme-*` classes or `var(--*)` CSS variables. Zero Tailwind color classes allowed in components.
2. **All user-facing text in i18n.ts** — 3 languages: es, en, pt. Never hardcode strings.
3. **Security metadata inside encrypted payload** — the public header ONLY contains: iterations, compression, hint, note, mode. Everything else (expiration, IPs, question, strict, maxAttempts) is inside the AES-256-GCM ciphertext.
4. **Minimum passphrase: 6 characters** — enforced in EncryptForm.tsx (3 validations).
5. **ZEFER_INSTANCE_SECRET never in code** — lives only in hosting env. The API returns a SHA-256 hash, never the raw secret.
6. **WCAG 2.1 AA** — all text must pass 4.5:1 contrast ratio. Verified: `--text-faint` is the minimum (0.35 dark / 0.44 light).
7. **No emails exposed** — contact is GitHub profile only.
8. **SSR hydration safe** — providers start with defaults, hydrate from localStorage in useEffect, render skeleton or null until ready.

## File Format (ZEFER3)

```
ZEFER3
{"iterations":600000,"compression":"none","hint":null,"note":null,"mode":"text"}
<base64(salt.iv.ciphertext)>        <- main key
<base64(salt.iv.ciphertext)>        <- reveal key (optional)
```

Payload (encrypted): `metadata_json + \0 + raw_content_bytes`

Metadata JSON inside cipher:
```json
{
  "v": 3, "content": "...", "fileName": "...", "fileType": "...",
  "fileSize": 0, "expiresAt": 0, "createdAt": 0,
  "answerHash": null, "allowedIps": [], "question": null,
  "maxAttempts": 0, "strict": false
}
```

## Key Derivation Chain

```
passphrase
  → [if dual] combine(pass, secondPass) via \x00ZEFER_DUAL\x00
  → [if strict] bind(pass, instanceHash) via \x00ZEFER_STRICT\x00
  → PBKDF2-SHA256(combined, salt_32bytes, iterations) → 256-bit AES key
  → AES-256-GCM(key, iv_12bytes, payload) → ciphertext
```

## Project Structure

```
app/
  api/instance/route.ts    — strict mode hash (SHA-256 of env secret)
  api/author/route.ts      — GitHub profile cache (1h TTL)
  components/              — 20 client components
  lib/
    crypto.ts              — AES-256-GCM, PBKDF2, benchmark, dual key
    zefer.ts               — ZEFER3 encode/decode, all security checks
    compression.ts         — Gzip/Deflate via CompressionStream
    device.ts              — RAM/CPU/GPU detection, dynamic file limits
    i18n.ts                — ~200 translation keys × 3 languages
    instance.ts            — strict mode binding
    ip.ts                  — IP detection + allowlist check
    preferences.ts         — persisted TTL preference
    progress.ts            — encryption progress tracking
  globals.css              — design system (liquid glass, 2 themes, animations)
```

## Routes

| Route | Type | Purpose |
|---|---|---|
| `/` | Static | Home — encrypt/decrypt tabs |
| `/how` | Static | 7 steps + 6 features + 12 specs |
| `/privacy` | Static | 9 sections + GDPR/CCPA/LGPD compliance |
| `/terms` | Static | 12 sections + MIT + Colombia Law 1581 |
| `/project` | Static | Repo, stack, creator (GitHub API), donate |
| `/device` | Static | Live device detection + optimization guide |
| `/api/instance` | Dynamic | Returns `{enabled, hash}` |
| `/api/author` | Dynamic | Returns GitHub profile data |

## Theming

Two themes via `[data-theme="dark"]` / `[data-theme="light"]` on `<html>`.

Text hierarchy: `theme-heading` → `theme-text` → `theme-muted` → `theme-faint`
Glass: `glass`, `glass-nav`, `glass-banner`, `glass-hover`, `glass-lift`
Semantic: `theme-danger`, `theme-warning`, `text-primary`
Buttons: `btn-primary`, `chip-select`
Animations: `animate-in`, `animate-in-down`, `animate-scale-in`, `reveal-content`, `error-shake`, `success-icon`, `glow-pulse`, `progress-bar-animated`, `skeleton-shimmer`

## Security Features (all inside encrypted payload)

- Expiration (UTC timestamp)
- Secret question (SHA-256 hashed answer)
- IP restriction (IPv4/IPv6 allowlist)
- Max decryption attempts (localStorage tracking)
- Strict instance binding (server-side hash)
- Reveal key (separate encrypted line)
- Dual passphrase (combined derivation)
- Compression (Gzip/Deflate before encryption)
- Configurable PBKDF2 iterations (300k/600k/1M)

## Conventions

- Components: `"use client"`, PascalCase filenames
- All interactive elements: `cursor-pointer`
- All icon buttons: `aria-label`
- Responsive: mobile-first, `min-[Xpx]:` for custom breakpoints
- Popovers: `fixed` on mobile, `absolute` on desktop
- Inputs: 16px minimum font-size on mobile (prevents iOS zoom)
- Animations: all respect `prefers-reduced-motion: reduce`

@AGENTS.md

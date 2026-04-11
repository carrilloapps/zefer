# Changelog

All notable changes to Zefer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-04-11

### New

- **Key generator preferences** — Your chosen mode (Unicode, Secure, Alpha, Hex, UUID) and length (64-1024) are now remembered across sessions
- **AI assistants guide** — New `/install/guide` page with step-by-step instructions for using Zefer with AI tools
- **Passphrase visibility toggle** — Show/hide buttons on all passphrase input fields
- **Character requirements** — Clear minimum length indicators on passphrase fields
- **Author section** — Social links and profile information on the install page
- **Professional documentation** — Security policy, Code of Conduct, Changelog, enhanced Contributing guide, issue template chooser
- **Redesigned social previews** — New OpenGraph, Twitter/X, and Apple touch icon images matching the project's visual identity

### Improved

- **Share links are now safer** — When a reveal key is set, the share link uses only the reveal key instead of exposing the main passphrase
- **URL parameters respect target tab** — Encrypt params are ignored when `t=decrypt` and vice versa, preventing the wrong form from consuming and clearing params
- **Input styles** — Better focus states and accessibility across encrypt and decrypt forms
- **HomeContent layout** — Improved spacing and visual consistency
- **Documentation** — All docs now have cross-navigation, corrected component count (24), translation count (~415 keys), and new preferences documented
- **Dependencies** — All packages updated to latest stable versions with `~` (patch-only) ranges

### Fixed

- **Share link security** — Main passphrase no longer leaked in the URL when a reveal key was configured
- **Decrypt auto-fill** — Passphrase from `/?t=decrypt&p=...` URLs now correctly populates the input field
- **Form param collision** — EncryptForm no longer reads and clears URL params meant for DecryptForm (and vice versa)

## [0.1.0] - 2026-04-07

### New

- **AES-256-GCM encryption** with PBKDF2-SHA256 key derivation (300k, 600k, or 1M iterations)
- **Text and file modes** — Encrypt plain text or any file (images, ZIPs, PDFs, etc.)
- **Chunked encryption** — Files over 16MB are split into chunks with unique IVs per chunk
- **ZEFB3 binary format** for single-key files, **ZEFR3** for files with a reveal key
- **Reveal key** — Share a secondary key without exposing the main passphrase
- **Dual passphrase** — Require two separate keys for decryption (two-person authorization)
- **Secret question** — Additional authentication with PBKDF2-hashed answer (100k iterations)
- **IP restriction** — Limit decryption to specific IPv4/IPv6 addresses
- **Built-in expiration** — 30 minutes to 2 weeks, or no expiration
- **Max decryption attempts** — Client-side attempt limiting per file
- **Compression** — Gzip or Deflate via CompressionStream API before encryption
- **Dynamic file limits** — Auto-detects RAM, CPU, GPU, and platform to set safe maximums
- **Secure key generator** — 5 modes (Unicode, Secure, Alphanumeric, Hex, UUID v7), 64 to 1024 characters
- **URL parameters** — Pre-configure encrypt/decrypt forms via URL for workflow automation
- **Drag-and-drop** — File upload supports both click and drag-and-drop
- **Progress bar** — Real-time encryption/decryption progress with device benchmarking
- **3 languages** — Spanish, English, Portuguese (~415 translation keys)
- **Dark and light mode** — Auto-detects OS preference, persists user choice
- **WCAG 2.1 AA** — All text passes 4.5:1 contrast ratio
- **Mobile-first** — Responsive design with safe-area-inset support
- **PWA** — Installable as a Progressive Web App with service worker
- **Liquid glass design** — CSS custom properties, glass morphism, smooth animations
- **Legal pages** — Privacy (GDPR, CCPA, LGPD), Terms (Colombia Law 1581)
- **LLM context** — `/llms.txt` following the llmstxt.org standard
- **125 tests** — Vitest with 100% line coverage across 7 test files
- **Legacy support** — ZEFER3 and ZEFER2 formats supported for backward-compatible decryption
- **GitHub templates** — Issue templates for bugs, features, and security reports

[0.2.0]: https://github.com/carrilloapps/zefer/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/carrilloapps/zefer/releases/tag/v0.1.0

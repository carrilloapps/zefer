# Changelog

All notable changes to Zefer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Key generator preferences persistence (mode and length saved across sessions)
- Author information and social links to install page
- AI assistants guide section with step-by-step usage
- Toggle visibility for passphrase input fields
- Character requirements in translations

### Changed
- Share link now uses reveal key instead of main passphrase when available
- URL parameter reading respects target tab (encrypt params ignored on decrypt tab and vice versa)
- Input styles improved for better accessibility
- HomeContent layout enhanced for better UI consistency

### Fixed
- Share link no longer exposes main passphrase when reveal key is set
- Decrypt form now correctly auto-fills passphrase from URL parameters
- URL parameters no longer consumed by the wrong form component

## [0.1.0] - 2026-04-01

### Added
- AES-256-GCM encryption with PBKDF2-SHA256 key derivation (300k/600k/1M iterations)
- Text and file encryption modes
- Chunked encryption for files over 16MB with unique IVs per chunk
- ZEFB3 binary format (single key) and ZEFR3 binary format (with reveal key)
- Reveal key — share a secondary key without exposing the main passphrase
- Dual passphrase — two-person authorization via combined key derivation
- Secret question with PBKDF2-SHA256 hashed answer (100k iterations)
- IP restriction (IPv4/IPv6 allowlist inside encrypted payload)
- Built-in expiration (30 minutes to 2 weeks)
- Max decryption attempts with localStorage tracking
- Gzip and Deflate compression via CompressionStream API
- Dynamic file limits based on RAM, CPU, GPU, and platform detection
- Secure key generator with 5 modes (Unicode, Secure, Alphanumeric, Hex, UUID v7)
- Key lengths from 64 to 1024 characters with rejection sampling
- URL parameters for workflow automation (15 encrypt params, 4 decrypt params)
- Drag-and-drop file upload for both encrypt and decrypt
- Real-time encryption/decryption progress bar with device benchmarking
- Internationalization with 3 languages (Spanish, English, Portuguese)
- Light and dark mode with OS preference detection
- WCAG 2.1 AA compliance (4.5:1 contrast ratio)
- Mobile-first responsive design with safe-area-inset support
- PWA support with service worker and manifest
- Liquid glass design system with CSS custom properties
- Legal compliance pages (GDPR, CCPA, LGPD, Colombia Law 1581)
- LLM context file (`/llms.txt`) following llmstxt.org standard
- GitHub issue templates (bug report, feature request, security vulnerability)
- 125 Vitest tests with 100% line coverage
- Legacy format support (ZEFER3, ZEFER2) for backward-compatible decryption

[Unreleased]: https://github.com/carrilloapps/zefer/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/carrilloapps/zefer/releases/tag/v0.1.0

# Changelog

All notable changes to Zefer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-04-11

### New

- **Competitor comparison pages** — 5 new `/vs/` pages: Hat.sh, Picocrypt, Bitwarden Send, Cryptomator, and VeraCrypt with reusable `VsContent` component, FAQPage schema, and BreadcrumbList on each
- **Hat.sh dedicated page** (`/vs/hat-sh`) — Full comparison with feature table, detailed encryption analysis, and "Who should use what" section
- **Passphrase strength meter** — Visual indicator below passphrase input with 4 levels (weak/fair/good/strong) and color-coded bar animation
- **PWA installation guide** — Detailed accordion with step-by-step instructions for Chrome/Edge, Safari (iOS/macOS), and Firefox (Android), including command-path code blocks
- **Install page redesign** — App Store-style layout with hero CTA, feature trust strip, PWA accordion, documentation nav links, and competitor comparison links

### Improved

- **Color contrast (WCAG 2.1 AA)** — Fixed `text-primary/60` and `text-primary/70` opacity badges in navbar and drawer; replaced `theme-faint` with `theme-muted` on drawer section labels
- **CLS prevention** — Body scroll lock now compensates scrollbar width when drawer opens, preventing layout shift
- **LCP optimization** — Added `content-visibility: auto` on below-fold home sections (quick steps, resources) so browser skips rendering until scroll
- **GPU compositing** — Added `will-change: transform` to ambient blobs and blob-accent for hardware-accelerated animation
- **Font loading** — Added `display: "swap"` to Geist Sans and Geist Mono to eliminate FOIT (Flash of Invisible Text)
- **Render performance** — Memoized `phrases` array in HomeContent with `useMemo` to prevent recalculation on every render
- **SEO titles** — Expanded short titles: "How It Works" → "How Zefer Encrypts Files with AES-256-GCM", "Project" → "Open-Source Client-Side Encryption Tool", "Device & Performance" → "Device Detection and Encryption Performance"
- **SEO descriptions** — Trimmed over-length descriptions on `/how`, `/install`, and `/install/guide` to 120-160 character range
- **OG/Twitter images** — Explicit `images` field added to home page and all 5 `/vs/*` pages for reliable social media previews
- **Security headers** — Added `X-Permitted-Cross-Domain-Policies: none`
- **Default TTL** — Changed from 24 hours to 30 minutes for safer sharing defaults
- **Advanced panel animation** — Replaced conditional render with CSS `grid-template-rows` transition for smooth expand/collapse without CLS
- **Dropzone UX** — Larger padding, dashed border, green glow on drag-active state
- **Input focus glow** — Added green box-shadow ring on input focus (dark and light mode variants)
- **Documentation** — Updated CLAUDE.md, AGENTS.md, and llms.txt with all new routes, components, translation counts, and performance rules

### Fixed

- **Unused useRef in ThemeToggle** — Removed `btnRef` that was declared but never used
- **Drawer contrast** — "E2E ENCRYPTED" badge and "LEGAL" section label now pass WCAG 2.1 AA contrast ratio

### Removed

- **Comparison table component** — Replaced heavyweight grid table with simple link cards to `/vs/` pages (reduced InstallContent from 377 to 167 lines)

## [0.3.0] - 2026-04-11

### New

- **Native mobile drawer** — Full-screen navigation menu with iOS-style grouped rows, drag handle, solid background, safe-area support, and active-state touch feedback
- **Telegram-style theme toggle** — Theme changes now reveal with an expanding circle animation from the toggle button using the View Transitions API
- **Typewriter hero** — The homepage headline cycles through rotating phrases ("securely", "with no servers", "in your browser", "without a trace", "with zero knowledge") with a blinking cursor, translated in all 3 languages
- **Security Policy page** (`/security`) — Vulnerability reporting, response timeline, in-scope/out-of-scope, and full cryptographic architecture table
- **Code of Conduct page** (`/conduct`) — Community standards, enforcement levels, and reporting channels
- **FAQ schema** — 5 structured FAQ entries on the How It Works page for Google rich results
- **BreadcrumbList schema** — JSON-LD breadcrumbs on all subpages for enhanced SERP display

### Improved

- **Mobile navbar** — Simplified to logo + hamburger only; theme toggle and language selector moved inside the drawer
- **Mobile footer** — Compact single-line layout with key legal links instead of the full 4-column grid
- **Hero heading** — "Zefer" now renders in white with animated green/cyan text-shadow glow; tagline uses fluid `clamp()` sizing
- **Dark mode atmosphere** — Increased blob intensity, stronger grid visibility, and a radial glow behind the hero section
- **SEO metadata** — Expanded keywords, explicit `twitter.card` on all pages, longer Twitter descriptions, richer OpenGraph descriptions
- **WebApplication schema** — Added `featureList` (11 features), `screenshot`, `installUrl`, `releaseNotes`, `softwareHelp`, and `sourceOrganization`
- **Robots.txt** — Now disallows `/api/`, `/_next/`, and `/sw.js`; includes `host` directive
- **Security headers** — Added `Strict-Transport-Security` (HSTS with preload) and `X-DNS-Prefetch-Control`
- **Privacy page** — Renamed from "Privacy & Security" to "Privacy Policy" to eliminate overlap with the new Security Policy page
- **Footer restructured** — Security section now links to `/how` (encryption), `/privacy` (zero-knowledge), and `/security` (policy); no duplicate links
- **Internal linking** — Homepage now links to `/how`, `/project`, `/device` in a Resources section with proper H2 headings
- **Typewriter language sync** — Changing the language now instantly restarts the animation with the new phrases

### Fixed

- **Typewriter memory leak** — Replaced recursive setTimeout pattern with async/await loop and proper cancellation flag
- **View transition accessibility** — `prefers-reduced-motion: reduce` disables both the theme circle animation and the hero glow animation

### Removed

- **Changelog page** — Removed `/changelog` route, component, and all 38 translation keys; changelog remains on GitHub only

## [0.2.0] - 2026-04-11

### New

- **Key generator preferences** — Your chosen mode (Unicode, Secure, Alpha, Hex, UUID) and length (64-1024) are now remembered across sessions
- **AI assistants guide** — New `/install/guide` page with step-by-step instructions for using Zefer with AI tools
- **Passphrase visibility toggle** — Show/hide buttons on all passphrase input fields
- **Character requirements** — Clear minimum length indicators on passphrase fields
- **Author section** — Social links and profile information on the install page
- **Professional documentation** — Security policy, Code of Conduct, Changelog, Contributing guide, issue template chooser
- **JSON-LD structured data** — WebApplication schema with author, version, and language information for search engines
- **Per-page SEO metadata** — Every route now has its own title, description, keywords, OpenGraph, Twitter card, and canonical URL
- **PWA screenshots** — Manifest now includes screenshots for the install prompt on mobile devices

### Improved

- **Share links are now safer** — When a reveal key is set, the share link uses only the reveal key instead of exposing the main passphrase
- **URL parameters respect target tab** — Encrypt params are ignored when `t=decrypt` and vice versa, preventing the wrong form from consuming and clearing params
- **Touch targets** — All icon-only buttons now meet 36x36px minimum (theme toggle, language selector, copy, close, file remove, passphrase toggle)
- **Heading hierarchy** — Footer section labels changed from `<h4>` to `<p>` to avoid skipping heading levels
- **Aria labels** — All toggle buttons now have dynamic aria-labels ("Show/Hide passphrase"), expand/collapse buttons have `aria-expanded`
- **Social preview images** — Redesigned OpenGraph, Twitter/X, and Apple touch icon with ambient glows, grid overlay, version badge, and tech pills
- **Search engine indexing** — Legal pages (`/privacy`, `/terms`) now have `noindex, follow` robots directive and are excluded from the sitemap
- **Input styles** — Better focus states and accessibility across encrypt and decrypt forms
- **Documentation** — All docs have cross-navigation, corrected counts (24 components, ~415 translations), SEO rules, accessibility rules, and new route guide
- **Dependencies** — All packages updated to latest stable versions with `~` (patch-only) ranges; TypeScript updated from 5 to 6

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

[0.4.0]: https://github.com/carrilloapps/zefer/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/carrilloapps/zefer/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/carrilloapps/zefer/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/carrilloapps/zefer/releases/tag/v0.1.0

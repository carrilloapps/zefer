# Changelog

All notable changes to Zefer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2026-06-05

### Added

- **Generator/Analyzer tabs** — `/generator` is now a two-tab password lab; every generated key gets its own strength meter, score and effective bits, sorted highest → lowest
- **2 new key types** — Base58 *Readable* (no `0O1lI`, safe to dictate or hand-copy) and *PIN* (digits only), shared with the home popover via the canonical `MODES` list
- **Advanced generation options** (collapsible panel, persisted): exclude ambiguous characters, exclude custom characters, guarantee all character classes, no consecutive repeats, dash grouping every 4/6/8
- **Stop-slider controls** — length (presets 16–1024 + custom up to 2048) and quantity (1–50, default 1) use a horizontal slider with dot markers mathematically centered on the thumb path, plus a manual input
- **Security report** (`SecurityInsights`, shared by the config panel and the analyzer tab): 4 attack scenarios (10²–10¹⁵ guesses/s), cybersecurity framework checks (NIST SP 800-63B, OWASP ≥64 bits, long-term ≥100 bits, AES-128 ≥128 bits, post-quantum Grover), total keyspace, post-quantum entropy, and comparison vs an average human password (~40 bits) — collapsible on the generator tab
- **Plain-language tooltips** — 12 explanations (es/en/pt) for entropy, scenarios, each framework check, keyspace, post-quantum bits and the average comparison
- **Deep .zefer analysis** (`/analyzer`) — structural integrity (chunk-framing walk, corruption/truncation detection, chunk count, estimated content size), ciphertext randomness via Shannon entropy, salt/IV hex, full-file SHA-256 fingerprint, KDF resistance table (per-GPU guess rate from the file's iterations + crack times for typical passphrase strengths vs a 1,000-GPU fleet) and severity-tagged security observations (weak KDF, public hint/note, reveal-key surface, compression side-channel, low entropy, broken structure)

### Fixed

- **"Infinity years"** — crack times are computed in log space (`2^bits` overflows `Number` past ~1024 bits); extreme configs now render `≈10ⁿ years` with Unicode superscripts
- **Checked toggles never turned green** — Tailwind cannot variant plain CSS classes; native `.peer:checked ~` selectors now style the track and knob (also fixes the home dual-key toggles)
- **Saved keygen preferences were never applied** — local state initialized before `localStorage` hydration; the popover now adopts preferences when they arrive
- **Scenario labels wrapping** — shortened and truncate-protected; technical detail moved into the scenarios tooltip
- **Service Worker in development** — now registers only in production, preventing stale-chunk issues while developing

### Documentation

- README, AGENTS.md, CLAUDE.md, `docs/ARCHITECTURE.md`, `public/llms.txt` and `public/agents.md` updated with the generator/analyzer pages, the password engine API, new preferences and design-system classes; privacy policy now states explicitly that the tools process everything locally

## [0.5.0] - 2026-06-05

### Added

- **Password generator page (`/generator`)** — Advanced standalone generator: 5 modes (Unicode, Secure, Alphanumeric, Hex, UUID v7), configurable length (16–256) and quantity (1–25), per-key copy, copy-all, and `.txt` download. Generation via `crypto.getRandomValues` with rejection sampling
- **Password analyzer** — Live analysis of any password on `/generator`: estimated alphabet, maximum and effective entropy, brute-force crack-time for online (10⁴/s) and offline GPU (10¹²/s) attackers, character-class breakdown, and structural weakness detection (leaked-list match, sequences, keyboard patterns, repeats, embedded years)
- **`.zefer` file analyzer page (`/analyzer`)** — Inspect the public header of any `.zefer` file without the passphrase: format (ZEFB3/ZEFR3/legacy), content mode, PBKDF2 iterations with KDF level, compression, sizes, reveal-key presence, public hint/note. 100% client-side via the File API
- **Shared password library (`app/lib/passwords.ts`)** — Charsets, unbiased generation, entropy and analysis extracted from KeyGenerator for reuse

### Improved

- **Mobile header** — Persistent scroll-aware liquid-glass app bar: transparent over the hero, elevates with blur + hairline + shadow on scroll; logo badge with live E2E pill; morphing hamburger (lines → X); drawer items reveal with staggered spring animation; "Encrypt a secret" CTA and Tools group in the drawer. All motion respects `prefers-reduced-motion`
- **Navigation** — Generator and Analyzer links in desktop nav, mobile drawer, and footer

### Fixed

- **Legal banner stacking** — The banner no longer paints above the open mobile drawer or page content; it now lives inside the main stacking context
- **Desktop popovers clipped** — Language dropdown (`.glass-nav`), key generator popover, and expiration select ( `.hero-glow`) are no longer cut off by `overflow: hidden` ancestors
- **`<html lang>`** — Now follows the active locale (WCAG 3.1.1)
- **Collapsed advanced panel** — No longer reachable by keyboard or screen readers while hidden; toggle exposes `aria-expanded`/`aria-controls`
- **Localized aria-labels** — All hardcoded English `aria-label`s replaced with i18n keys (es/en/pt); form fields gained associated labels, `id`/`name`, and proper `autocomplete`

## [0.4.1] - 2026-04-11

### Improved

- **Theme transition** — Smoother circle reveal animation (1.4s with cubic-bezier(0.22, 1, 0.36, 1)), fade-out with mid-hold at 60% opacity, toggle button blocked only during transition via `transition.finished` promise
- **Native mobile header** — Flush-to-top app bar (h-12, 48px) with safe-area-inset-top padding, 0.5px hairline border, backdrop blur. Separate desktop floating glass nav preserved for tablets and desktops
- **Consistent layout widths** — `max-w-2xl` (672px) for hero/subtitle text, `max-w-3xl` (768px) for all content containers. Eliminated all `max-w-4xl` usage
- **Advanced panel** — No longer renders as glass card inside glass card. Uses `border-t` separator integrated into the parent form card
- **PWA offline** — Full offline support: service worker caches all 17 pages, static assets (JS/CSS/fonts/icons), and `/api/author` profile. Network-first for pages (always fresh when online, cached when offline), cache-first for static. Offline fallback to cached home page
- **Overflow prevention** — `overflow-x: hidden` on html and body, `overflow: hidden` on `.hero-glow`, blob-accent uses `min(400px, 100vw)`, removed `-mx-2` from scrollable table wrappers
- **Offline author fallback** — ProjectContent now shows local fallback data when `/api/author` fails offline (previously showed infinite skeleton)

### Fixed

- **CSS not loading** — Removed custom `Cache-Control` header on `/_next/static/*` that was interfering with Next.js internal static asset caching (caused build warning and potential CSS delivery issues)
- **Horizontal scroll on Android** — Fixed hero-glow pseudo-element (700px) causing overflow on small viewports, blob-accent (400px) now viewport-clamped, desktop nav overflow-hidden with responsive link visibility
- **WCAG contrast** — Removed `text-primary/60` and `text-primary/70` opacity on E2E badge and drawer labels, replaced with full `text-primary` and `theme-muted`
- **Skeleton on refresh** — Changed service worker page strategy from stale-while-revalidate to network-first. Stale-while-revalidate was serving cached HTML with outdated JS chunk references, causing the skeleton to persist indefinitely after deploys
- **OG/Twitter image readability** — Increased all text sizes by ~25% (subtitle 21→26px, pills 13→16px, brand 32→44px), raised opacity from 0.15-0.4 to 0.35-0.7 range, added gradient background for depth. Text is now legible at the ~50% size social platforms render previews

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

[0.4.1]: https://github.com/carrilloapps/zefer/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/carrilloapps/zefer/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/carrilloapps/zefer/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/carrilloapps/zefer/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/carrilloapps/zefer/releases/tag/v0.1.0

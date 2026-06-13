# Changelog

All notable changes to Zefer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.10.0] - 2026-06-13

### Added

- **Product-tour video subproject** (`video/`) — a self-contained [Remotion](https://www.remotion.dev) project that renders a 16:9, ~34s **en_US** product spot: brand intro, "what is Zefer", an animated interactive UI demo (cursor types a secret, sets a passphrase, clicks Encrypt, an AES-256-GCM progress bar runs, a `.zefer` file is "downloaded"), a feature grid, channels + terminal, and a CTA. It mirrors the web app's design system — **Geist / Geist Mono** type and the **lucide-react** icon set — with a modular `src/` (lib/components/scenes). Its own `package.json` keeps the app's deps clean. The rendered MP4 is distributed via YouTube and stays out of the repo (`out/` is git-ignored); only the source is versioned.
- **`/how`: "Use Zefer your way" section** — cards for the four channels (Web app, CLI, MCP server, Node.js library) linking to `/`, `/install`, `/mcp` and `/library`, reinforcing that every channel shares the same engine and `.zefer` format.
- **`/how`: product-tour video slot** — a modern, responsive YouTube embed that appears once a video ID is configured (hidden otherwise, so the live page stays clean).
- README now references the `video/` subproject and how to render it.

## [0.9.1] - 2026-06-13

### Added

- **OpenGraph MCP integration** — `opengraph-mcp` (opengraph.to) added to `.mcp.json` so agents can inspect OG/Twitter tags and scores. Includes `scripts/og-review.mjs` (drives any OG MCP over stdio) and `scripts/og-audit.mjs` (offline OG/SEO compliance audit over the prerendered HTML).

### Fixed

- **100/100 OpenGraph/SEO compliance on every page** — lengthened the titles of the noindex legal pages (`/privacy`, `/security`, `/conduct`) so all 19 pages pass the full OG/Twitter/title/description/favicon/H1 checklist (was 99.2/100 avg; the three noindex pages had short titles).

## [0.9.0] - 2026-06-12

### Added

- **New `/library` page** — a dedicated, indexable page for the **library channel**: what it is, install, ESM/CommonJS import, the exposed API with real signatures (`encodeZefer`, `decodeZefer`, `generateWithOptions`, `analyzePassword`), runnable examples (encrypt, decrypt, keygen + analyze), important notes (no auto-benchmark, in-memory, cross-compatibility) and CTAs. Includes `BreadcrumbList` + `FAQPage` JSON-LD. This completes the three channels — **CLI** (documented in `/install`), **MCP server** (`/mcp`) and **library** (`/library`) — each correctly located.
- **`/install`: "As a library" option** — the CLI section now documents the third way to use zefer-cli alongside the standalone binary and npm, with ESM/CommonJS examples and a link to the full `/library` guide.
- **Home "Resources & documentation"** now surfaces all channels: added a **CLI** chip (→ `/install`) and a **Library** chip (→ `/library`) next to MCP. The main nav still highlights only MCP by design.
- **Footer** product column gains a **Library** link.
- AI/LLM docs aligned: `llms.txt`, `AGENTS.md`, `agents.md`, `CLAUDE.md` and `README.md` document the library API signatures and link to `/library`.

## [0.8.1] - 2026-06-12

### Fixed

- **Instant page navigation** — the navbar, footer and in-content links used plain `<a href>`, so every page change triggered a full document reload (network round-trip + re-hydration), felt as a ~10–50 ms blank/delay. Combined with 0.8.0's server-side rendering, each reload also briefly showed the default-language (English) content before the client switched to the saved locale. All 40 internal route links now use Next.js `<Link>` for prefetched client-side transitions: navigation is instant, the language/theme provider stays mounted (no flash), and only `/llms.txt` and external links remain plain anchors.

## [0.8.0] - 2026-06-12

### Fixed

- **Server-side rendering restored across the whole site** — `ThemeProvider`/`LanguageProvider` previously rendered a skeleton/`null` until client hydration, so the static HTML had **no `<h1>`, no visible content and no per-page JSON-LD**. Non-JS crawlers (ClaudeBot, GPTBot, PerplexityBot) and first-wave indexing saw an empty shell. Providers now always render `children` (server paints the default `en`/`dark`, matching `<html>`, so hydration stays safe; saved locale/theme apply after mount). All 18 pages now ship full content + a real H1 in the static HTML
- **Per-page Open Graph / Twitter tags no longer dropped** — every subpage defined its own `openGraph`/`twitter`, which Next.js shallow-merges, silently discarding the layout's `og:site_name`, `og:locale`, `og:type`, `twitter:site` and `twitter:creator`. Centralized in `pageMetadata()` so all routes ship the complete, consistent set
- **`/device` rendered empty server-side** (returned `null` until client device detection); the header, H1 and static guide now render on the server, with only the live-detection table gated behind a "detecting…" placeholder
- Title/description lengths normalized to 40–60 / 120–160 chars on indexable pages; removed the redundant `Zefer … | Zefer` home title

### Added

- **`app/lib/seo.ts` — `pageMetadata()` helper**: single source of truth for canonical, robots (noindex flag), and the full Open Graph + Twitter set (incl. `siteName`, `locale`, `alternateLocale`, `og:type`, `twitter:site`/`creator`, images) on every route
- **Google-compatible favicon** (`app/favicon.ico`, PNG-in-ICO) — Google ignores the SVG favicon, so the icon now shows in search results
- **`FAQPage` + `WebSite` JSON-LD on the home page** (now static in HTML) so AI assistants and search engines can build an overview: what Zefer is, free, zero-knowledge, no account, what a `.zefer` file is
- **`useUrlParams()` hook** — reads URL query params on the client after mount, replacing `useSearchParams()` on the home/forms so the page is no longer forced into CSR
- Author entity enriched (`sameAs`: GitHub, LinkedIn, X, Bluesky, Dev.to, Substack, Stack Overflow)
- **zefer-cli v1.3.0 documented** — the new programmatic library channel (ESM + CommonJS: `encodeZefer`, `decodeZefer`, `generateWithOptions`, `analyzePassword`) across `/project`, `README.md`, `llms.txt`, `AGENTS.md`, `agents.md` and `CLAUDE.md`; zefer-cli now runs three ways: CLI, MCP server and library

## [0.7.0] - 2026-06-05

### Added

- **`/mcp` page** — zefer-cli as a Model Context Protocol server: 2-step setup (global **and** npx), smart-detection explanation, the 5 exposed tools as rich entries (icon, key-parameter chips with required markers, returns line, call example), an example JSON-RPC call, and **per-tool accordions** with copy-ready configs for Claude Code (incl. `claude mcp add`), Claude Desktop, Cursor, Windsurf, VS Code (Copilot `servers` format), Zed (`context_servers`) and generic stdio clients — each with global + npx variants and **one-click install buttons** for Cursor and VS Code (official deep links). Linked from the navbar, mobile drawer, footer, home resources and `/how`
- **Syntax highlighting site-wide** — shared `CodeBlock` with a dependency-free tokenizer (JSON keys/strings/numbers/booleans/comments; bash commands/flags/strings/vars), hover copy button, and theme-variable token colors (dark/light, WCAG-checked); applied to `/mcp` and `/install`
- **Donations FAB bubble** — a small invitation appears 25 s after load and every 3 min (auto-hides in 9 s, X silences the session); icon-only design (lucide `Coffee` badge), primary-accented border and glow
- **VS pages: new capability rows** — password generator & analysis, encrypted-file inspector and AI integration (MCP) on all five comparisons with honest per-competitor statuses; Zefer spec card lists the built-in tools and the MCP-enabled CLI
- AI-integration docs refreshed everywhere: `llms.txt` and `agents.md` gained an MCP section (global + npx configs), AGENTS.md documents `zefer mcp`, README routes/AI sections updated

### Changed

- **"Proyecto" → "Desarrollo"** in the main menu; the dropdown holds "Sobre el proyecto" and "Sobre el autor" ("Donar" lives in the FAB now)
- Footer PRODUCT column trimmed to Generator, Analyzer, MCP and Performance

### Fixed

- Interrogative headings: "¿Cómo funciona?", "¿Cómo usar Zefer?", "¿Cómo reportar?", "¿Qué incluir en el reporte?", "¿Cómo se generan las contraseñas?" (es `¿…?` / pt `…?`)
- Outdated Picocrypt comparison row: Zefer **does** have a CLI
- "Exposed tools" no longer nests glass cards inside glass cards (site-wide `.glass .glass` = 0)
- Dev servers no longer replay stale chunks: any service worker registered before the prod-only gate is actively unregistered in development

## [0.6.0] - 2026-06-05

### Added

- **Generator/Analyzer tabs** — `/generator` is now a two-tab password lab; every generated key gets its own strength meter, score and effective bits, sorted highest → lowest
- **2 new key types** — Base58 *Readable* (standard Bitcoin alphabet, no `0 O I l` — safe to dictate or hand-copy) and *PIN* (digits only), shared with the home popover via the canonical `MODES` list
- **Advanced generation options** (collapsible panel, persisted): exclude ambiguous characters, exclude custom characters, guarantee all character classes, no consecutive repeats, dash grouping every 4/6/8
- **Stop-slider controls** — length (presets 16–1024 + custom up to 2048) and quantity (1–50, default 1) use a horizontal slider with dot markers mathematically centered on the thumb path, plus a manual input
- **Security report** (`SecurityInsights`, shared by the config panel and the analyzer tab): 4 attack scenarios (10²–10¹⁵ guesses/s), cybersecurity framework checks (NIST SP 800-63B, OWASP ≥64 bits, long-term ≥100 bits, AES-128 ≥128 bits, post-quantum Grover), total keyspace, post-quantum entropy, and comparison vs an average human password (~40 bits) — collapsible on the generator tab
- **Plain-language tooltips** — 12 explanations (es/en/pt) for entropy, scenarios, each framework check, keyspace, post-quantum bits and the average comparison
- **Deep .zefer analysis** (`/analyzer`) — structural integrity (chunk-framing walk, corruption/truncation detection, chunk count, estimated content size), ciphertext randomness via Shannon entropy, salt/IV hex, full-file SHA-256 fingerprint, KDF resistance table (per-GPU guess rate from the file's iterations + crack times for typical passphrase strengths vs a 1,000-GPU fleet) and severity-tagged security observations (weak KDF, public hint/note, reveal-key surface, compression side-channel, low entropy, broken structure)

### Changed

- **Realistic file-size limits** — the old formula derived the limit from the V8 heap cap (~4 GB on every desktop, freezing all machines at ~1.5 GB). Limits are now tiered by reported RAM + CPU threads: workstations (20+ threads or 64+ GB RAM) reach **10 GB**, mid-range desktops 2–8 GB, mobile 256 MB–1.5 GB. `/device` page explanation updated accordingly; file reads now fail gracefully with a clear message if the browser cannot allocate

### Fixed

- **"Decrypt this file"** on `/analyzer` now hands the analyzed file directly to the decrypt form (client-side navigation handoff) instead of landing on an empty form
- **"Infinity years"** — crack times are computed in log space (`2^bits` overflows `Number` past ~1024 bits); extreme configs now render `≈10ⁿ years` with Unicode superscripts
- **Checked toggles never turned green** — Tailwind cannot variant plain CSS classes; native `.peer:checked ~` selectors now style the track and knob (also fixes the home dual-key toggles)
- **Saved keygen preferences were never applied** — local state initialized before `localStorage` hydration; the popover now adopts preferences when they arrive
- **Scenario labels wrapping** — shortened and truncate-protected; technical detail moved into the scenarios tooltip
- **Service Worker in development** — now registers only in production, preventing stale-chunk issues while developing

### UI

- **`/how` — password generation explained**: new section documenting the engine (CSPRNG, rejection sampling, 7 alphabets, analysis/scoring with attack scenarios and compliance, advanced options) with a link to `/generator`
- **"Proyecto" dropdown**: project, donate and author links consolidated into a modern dropdown on desktop and an accordion row inside the mobile drawer (aria-expanded/haspopup, outside-click close)
- **Donations FAB**: floating Buy Me a Coffee button (safe-area aware, pulsing glow via `color-mix`, reduced-motion safe) on every page

### Testing

- **36 new unit tests for the password engine** (`app/lib/passwords.ts` added to the coverage gates): charsets and modes, unbiased generation (including the rejection-sampling branch via a mocked CSPRNG), advanced options, analysis warnings and scoring bands, crack-time buckets (no `Infinity`), compliance checks and superscript formatting — suite grows from 125 to 161 tests, 100% line coverage maintained

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

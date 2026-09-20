# Changelog

All notable changes to Zefer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.12.0] - 2026-09-20

A security, accessibility and quality release. No change to the `.zefer` binary
format or to the cryptographic parameters — files stay fully cross-compatible
with [zefer-cli](https://github.com/carrilloapps/zefer-cli), in both directions.

### Changed

- **Migrated the interactive UI to Radix UI** (`radix-ui`). `Dialog`,
  `DropdownMenu`, `Popover`, `Select`, `Tooltip`, `Tabs` and `Switch` now come
  from vetted primitives instead of hand-rolled implementations, which brings
  focus trapping and restoration, outside-click and Escape dismissal, typeahead,
  roving tabindex and the correct ARIA roles and relationships to every menu,
  popover, tab strip and toggle in the app. The visual design is unchanged: the
  primitives are styled entirely through the existing theme variables and glass
  classes, with no hardcoded colors.
- **Upgraded the toolchain**: Next.js to 16.3.5 and Vitest to 4.1.11. The Vitest
  config moved to `vitest.config.mts`, so the ESM-only configuration loads
  correctly under TypeScript 6 instead of being resolved as CommonJS.

### Security

- **14 vulnerable dependencies resolved**, including a **CRITICAL** advisory in
  `next` (11 CVEs fixed by the move to 16.3.x) and high-severity advisories in
  `brace-expansion`, `browserslist`, `nanoid`, `postcss`, `sharp` and `vite`,
  plus medium and low ones in `@humanfs/node`, `@vitest/mocker`,
  `baseline-browser-mapping`, `vitest` and `@babel/core`.
- **ReDoS in the password analyzer** (`app/lib/passwords.ts`). A pattern used to
  score passwords could backtrack catastrophically on a crafted input, freezing
  the tab of anyone who pasted it into `/generator`. The analysis is now linear
  in the length of the input.
- **Command-injection surface removed from `scripts/og-review.mjs`**, which
  spawned a child process with `shell: true` on Windows.
- **Incomplete sanitization in `McpContent.tsx`**, where a single-argument
  `String.replace` substituted only the first occurrence of a placeholder while
  the generated snippet implied all of them were replaced.
- **`.gitleaks.toml` added.** It inherits every default rule and disables none.
  It carries one narrowly scoped, documented allowlist: the dotted i18n lookup
  keys in `PrivacyContent.tsx` match the shape of a generic API key, and are
  exempted only for that rule, only in that file, and only when the string also
  matches the translation-key pattern. Zefer is 100% client-side and holds no
  keys or tokens; no finding is suppressed inline anywhere in the codebase.

### Fixed

- **ESLint was crashing, so the project was effectively unlinted.**
  `eslint.config.mjs` now loads, and the whole repository passes at **zero
  errors and zero warnings**. This was the root cause behind a large share of
  the static-analysis findings fixed in this release — the gate existed but
  never ran.
- **Secret-question retry in `DecryptForm`.** After a wrong answer, the question
  input disappeared, leaving no way to retry without re-uploading the file, and
  every resubmission consumed one of the file's `maxAttempts` — so a typo could
  permanently lock a file that was never brute-forced. The question now stays on
  screen for a retry, and a wrong answer no longer burns a decryption attempt.
- **Layout shift from the mobile drawer reduced from ~6 px to ~0.4 px.** Opening
  the drawer locks body scroll, and the scrollbar it removes was not fully
  compensated, nudging the whole page sideways.
- **`/terms` page title corrected.**

### Accessibility

- **Dropzones are real `<button>` elements.** They were clickable `<div>`s, so
  they were unreachable by keyboard and invisible to assistive technology. They
  now carry the correct role, appear in the tab order, and respond to both
  `Enter` and `Space` — `Space` in particular is what a native button does and
  what a screen-reader user expects.
- **Native semantics for status output**: encryption and decryption progress use
  `<progress>`, results and live messages use `<output>`, and grouped form
  controls use `<fieldset>` / `<legend>` instead of a styled heading.
- **Tooltips and help bubbles wired with `aria-describedby`**, so their content
  is announced with the control they describe rather than being an orphaned
  hover-only affordance.

### Tests

- **969 tests across 60 files**, with coverage enforced at **100% on statements,
  branches, functions *and* lines** (previously 100% lines with branches at
  99.47%, and no component coverage at all). The suite now covers the client
  components — rendered with `@testing-library/react` on jsdom — alongside the
  crypto and format layer, the route metadata, the sitemap and the generated
  OG/Twitter images.
- New test dependencies: `jsdom`, `@testing-library/react`,
  `@testing-library/user-event` and `@testing-library/jest-dom`.

### Added

- **`.github/workflows/ci.yml`** — the repository had no CI at all. Every push
  and pull request to `main` now runs `npm ci` → lint → typecheck →
  `test:coverage` (the 100% gate) → build, on Node.js 20 and 22.
- **`.github/workflows/security.yml`** — a monthly sweep (plus manual dispatch)
  running Semgrep, Trivy, Gitleaks and SonarQube. The first three upload SARIF,
  so findings land in the repository's Security → Code scanning tab; SonarQube
  is skipped cleanly when its secrets are not configured, instead of failing the
  run. Every action is pinned to a full commit SHA.
- **`.github/dependabot.yml`** — monthly npm and GitHub Actions updates. Minor
  and patch updates are grouped into a single pull request; majors are isolated
  in their own. There are deliberately **no `ignore:` rules**, because Dependabot
  applies them to security updates as well — ignoring majors in bulk would
  silence a CVE whose only patch ships in a major release.
- **`docs/RELEASING.md`** — the six-file version checklist, the quality gates,
  social-image verification and the tag/release/deploy steps.
- `images.remotePatterns` configured in `next.config.ts` for the remote avatar
  served on `/project`.

### Removed

- **`.github/CONTRIBUTING.md`.** It was a second, shorter contributing guide
  living alongside `docs/CONTRIBUTING.md`, and it had already drifted (stale
  test counts, an outdated rule list). GitHub resolves `CONTRIBUTING.md` from
  `.github/`, the repository root and `docs/` in that order, so
  [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) is still linked from the issue
  and pull-request UI — with one source of truth instead of two.

[0.12.0]: https://github.com/carrilloapps/zefer/compare/v0.11.0...v0.12.0

## [0.11.0] - 2026-06-16

### Added

- **Multi-GB files, end to end.** Encryption and decryption now stream the file in 16 MB slices (`Blob.slice`) instead of loading it into a single `ArrayBuffer`, so large files (e.g. 2.4 GB) no longer hit the browser's ~2 GB per-allocation cap that previously failed with "may exceed available memory". Compression and decompression also stream. The binary format is byte-identical, so files stay fully cross-compatible with the CLI.
- **Native sharing (Web Share API).** Share the decrypt link, **send the encrypted `.zefer` file** directly to WhatsApp/Telegram/Slack/email via the OS share sheet, and share generated passwords from the generator — each on its own channel. A security note reminds users to send the file and the passphrase through **different** channels. Download remains the always-available fallback; the send button is shown disabled with an explanation when the browser lacks support.
- **Site-wide keyboard control.** A global shortcut layer makes the app fully operable from the keyboard — `E` encrypt, `D` decrypt, `G` generator, `Z` analyzer, `H` home, `T` theme — and `?` opens a help overlay listing every shortcut (Esc closes). A keyboard affordance in the desktop navbar makes the commands discoverable.
- **Double-click the "file" encrypt tab** to open the file picker directly.

### Fixed

- **Infinite render loop on the home page** when a `?t=encrypt`/`?t=decrypt` query param was present (the tab effect re-asserted the URL value every render), which also broke client navigation away from the page. The URL tab is now applied once on mount.

### Security

- **Decompression-bomb guard** on the streaming path: decompression aborts if the output exceeds the original size authenticated inside the AES-256-GCM payload (`meta.fileSize`), so a crafted or corrupt compressed stream can't expand without bound.

## [0.10.1] - 2026-06-13

### Added

- **Server-side rendering across the whole site.** Pages now ship full content, a real `<h1>`, and per-page JSON-LD in the static HTML, so search engines and non-JS AI crawlers (ClaudeBot, GPTBot, PerplexityBot) see the real page instead of a skeleton.
- **`app/lib/seo.ts` — centralized metadata** (`pageMetadata()`): every route ships a complete, consistent Open Graph + Twitter set (`og:site_name`, `og:locale`, `og:type`, `twitter:site`/`creator`, images), canonical, and the noindex flag — **100/100** on the full OG/SEO checklist across all pages.
- **Google-compatible `favicon.ico`** (Google ignores SVG favicons) and **`FAQPage` + `WebSite` JSON-LD** on the home page for AI and search overviews.
- **New `/library` page** documenting zefer-cli as a programmatic Node.js library (`encodeZefer`, `decodeZefer`, `generateWithOptions`, `analyzePassword`; ESM and CommonJS).
- **`/how`: "Use Zefer your way"** — the four channels (Web app, CLI, MCP server, Node.js library) with links, reinforcing that they share the same engine and `.zefer` format.
- **OpenGraph MCP** integrated in `.mcp.json`, plus OG/SEO audit tooling in `scripts/`.
- Documented **zefer-cli v1.3.0** (the library channel) across the site and the AI docs (`llms.txt`, `AGENTS.md`, `agents.md`, `CLAUDE.md`, `README`), and enriched the author entity (`sameAs`).

### Fixed

- **Instant navigation** — internal links use `next/link` for prefetched client-side transitions: no full-page reloads and no language/theme flash.
- Normalized title/description lengths to SEO ranges on indexable pages; `/device` now renders its content server-side.

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

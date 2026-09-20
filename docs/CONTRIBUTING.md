# Contributing

> [README](../README.md) · [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md) · [Deployment](DEPLOYMENT.md) · [Releasing](RELEASING.md) · **Contributing**

Thank you for your interest in contributing to Zefer. This document is the **single canonical contributing guide** for the repository: setup, conventions, and the contribution process all live here.

Please read the [Code of Conduct](../CODE_OF_CONDUCT.md) before participating.

## Quick Links

- [Code of Conduct](../CODE_OF_CONDUCT.md)
- [Security Policy](../SECURITY.md) — how to report a vulnerability
- [Cryptographic architecture](SECURITY.md)
- [Architecture](ARCHITECTURE.md)
- [Releasing](RELEASING.md)

## Types of Contributions

| Type | Label | Description |
|------|-------|-------------|
| Bug fix | `bug` | Fix broken functionality |
| Feature | `enhancement` | Add new functionality |
| Docs | `documentation` | Improve documentation |
| Security | `security` | Fix security issues ([report responsibly](../SECURITY.md)) |

## Prerequisites

- Node.js 20+
- npm 10+

> `npm ci` is the only supported install path in CI. npm 10.9.x has an Arborist bug
> (`Cannot read properties of null (reading 'edgesOut')`) when it re-resolves the
> dependency tree, so avoid `npm update` there.

## Setup

```bash
git clone https://github.com/carrilloapps/zefer.git
cd zefer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  api/           # Server-side API routes (/api/author only)
  components/    # 34 React client components
  lib/           # 14 core logic modules (crypto, compression, device, i18n, seo, etc.)
  [page]/        # Next.js file-based routing
  globals.css    # Design system (CSS variables, glass effects, animations)
docs/            # Documentation
public/          # Static assets (llms.txt)
```

## Quality Gates

Every one of these must be green before a pull request is merged — they are the
same checks `.github/workflows/ci.yml` runs on Node.js 20 and 22:

```bash
npm run lint           # ESLint (flat config) — zero errors, zero warnings
npm run typecheck      # tsc --noEmit — zero errors
npm run test:coverage  # Vitest + coverage gate
npm run build          # Production Next.js build
npm run validate       # all of the above, in order
```

### Testing

```bash
npm test               # Vitest, single run
npm run test:watch     # watch mode for development
npm run test:coverage  # single run behind the coverage gate
```

The suite is **969 tests across 60 files** (`app/**/__tests__/`), covering the
crypto and format layer, the client components (rendered with
`@testing-library/react` on jsdom), the route metadata, the sitemap and the
generated OG/Twitter images.

**Coverage is enforced at 100%** for statements, branches, functions *and* lines
over all of `app/**` (`vitest.config.mts`). Lowering a threshold, excluding a
file or adding a `v8 ignore` hint is not an accepted way to make the gate pass:
write the missing test, or delete the unreachable code.

### Continuous Integration

| Workflow | Trigger | What it does |
|---|---|---|
| `.github/workflows/ci.yml` | Push / PR to `main` | `npm ci` → lint → typecheck → tests at 100% coverage → build, on Node.js 20 and 22 |
| `.github/workflows/security.yml` | Monthly cron + manual dispatch | Semgrep, Trivy, Gitleaks and SonarQube; the first three upload SARIF to Code scanning |
| `.github/dependabot.yml` | Monthly | npm and GitHub Actions updates — minor/patch grouped into one PR, majors isolated in their own |

## Conventions

### Code Style

- TypeScript strict mode
- ESLint with the Next.js flat config (`eslint.config.mjs`)
- Components use default exports (`"use client"` with PascalCase filenames)
- All interactive elements need `cursor-pointer`

### UI Primitives

Overlay and stateful primitives come from **Radix UI** (`radix-ui`): `Dialog`,
`DropdownMenu`, `Popover`, `Select`, `Tooltip`, `Tabs` and `Switch`. Prefer a
Radix primitive over a hand-rolled one — it brings focus management, dismissal,
typeahead and the correct ARIA roles for free. Styling still goes through the
theme classes below; never style a primitive with a hardcoded Tailwind color.

### Theming

All colors MUST use CSS custom properties or theme utility classes:

```tsx
// Correct
<p className="theme-muted">Text</p>
<div className="glass">Card</div>

// Wrong
<p className="text-gray-500">Text</p>
```

Available theme classes:
- `theme-heading`, `theme-text`, `theme-muted`, `theme-faint` — text hierarchy
- `theme-primary-faint`, `theme-primary-border` — primary accents
- `theme-danger`, `theme-warning` — semantic colors
- `glass`, `glass-nav`, `glass-banner` — glass morphism

### i18n

All user-facing text MUST be in `app/lib/i18n.ts` with translations in all three languages (es, en, pt):

```typescript
"key.name": {
  es: "Texto en espanol",
  en: "English text",
  pt: "Texto em portugues",
},
```

There are currently ~1,045 translation keys across 3 languages.

Links to GitHub profiles or repositories go in `<a>` elements, never inside a
translation string. Author attribution is the plain text "José Carrillo".

### Accessibility

- All text must pass WCAG 2.1 AA (4.5:1 contrast ratio)
- Form inputs need associated `<label>` elements; grouped controls use `<fieldset>` / `<legend>`
- Icon-only buttons need `aria-label` (dynamic when the state changes)
- Tooltips and help bubbles are wired with `aria-describedby`
- Progress uses `<progress>`; live results use `<output>`
- Dropzones are real `<button>` elements and respond to `Enter` **and** `Space`
- Animations must respect `prefers-reduced-motion`
- File uploads must support both click and drag-and-drop

### Responsive

- Mobile-first: default styles for mobile, `sm:` / `md:` / `lg:` for larger
- Use `min-[Xpx]:` for breakpoints between Tailwind defaults
- Popovers: `fixed` on mobile, `absolute` on desktop
- Inputs: `font-size: 16px` minimum on mobile (prevents iOS zoom)

## Making Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run `npm run validate` — typecheck, lint, tests and build must all pass
5. Test both dark and light mode
6. Test on a mobile viewport (375px)
7. Submit a pull request

## Adding a New Language

1. Add the locale to `LOCALES` array in `app/lib/i18n.ts`
2. Add translations for every key in the `translations` object
3. The language will automatically appear in the language selector

## Adding a New Advanced Option

1. Add state to `EncryptForm.tsx`
2. Add to the `EncodeOptions` interface in `app/lib/zefer.ts`
3. Add to the `ZeferMeta` interface (inside the encrypted payload)
4. Handle in `encodeZefer()` and `decodeZefer()`
5. Add post-decryption check in `DecryptForm.tsx`
6. Add i18n keys for all three languages
7. Add URL parameter support (long + short alias) in `app/lib/useUrlParams.ts`
8. Add tests for the new feature
9. Update documentation (CLAUDE.md, AGENTS.md, README.md, llms.txt)

## Adding a New Persisted Preference

1. Add the field to the `Preferences` interface in `app/lib/preferences.ts`
2. Add a default value to the `DEFAULTS` object
3. Add a getter and setter in the `usePreferences()` return object
4. Use the preference in the relevant component

Current persisted preferences: `ttl`, `iterations`, `compression`, `inputMode`,
`tab`, `keygenMode`, `keygenLength`, `keygenCount`, `keygenAdvanced`.

## Releasing a New Version

The full checklist lives in [docs/RELEASING.md](RELEASING.md). Every one of these
files must be updated in the same commit:

1. `CHANGELOG.md` — add new version entry with date
2. `package.json` — update `"version"` field
3. `app/layout.tsx` — update `softwareVersion` in the JSON-LD schema
4. `app/opengraph-image.tsx` — update version badge text
5. `app/twitter-image.tsx` — update version badge text
6. `app/sitemap.ts` — update `lastModified` date

## Adding a New Route

1. Create `app/[route]/page.tsx` with a `metadata` export
2. Include: `title`, `description`, `keywords`, `openGraph` (url, title, description), `twitter` (title, description), `alternates.canonical`
3. For legal/utility pages: add `robots: { index: false, follow: true }`
4. For indexable pages: add the route to `app/sitemap.ts` with appropriate priority
5. Add i18n keys for the page content
6. Update route tables in CLAUDE.md, AGENTS.md and README.md

## Accessibility Rules

- All icon-only buttons must have `aria-label` (dynamic when state changes)
- All touch targets must be at least 36x36px (`w-9 h-9`)
- Headings must follow strict descending order (h1 → h2 → h3) — footer labels use `<p>`, not headings
- Expand/collapse controls need `aria-expanded` and descriptive `aria-label`

## Security Considerations

- Never store secrets, passphrases, or plaintext in `localStorage`, cookies, or server logs
- All security metadata must live inside the encrypted payload, not the public header
- New features should not increase the information visible to an attacker without the key
- Test with both dark and light mode, all three languages, and mobile/desktop

Scanner findings are fixed at the source. Inline suppressions (`// eslint-disable`,
`// NOSONAR`, `nosemgrep`) and lowered thresholds are not accepted. A genuine false
positive is documented with explicit scanner configuration — see `.gitleaks.toml`
for the pattern.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).

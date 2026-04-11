# Contributing

> [README](../README.md) · [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md) · [Deployment](DEPLOYMENT.md) · **Contributing**

Thank you for your interest in contributing to Zefer. This document explains how to set up the development environment, the project conventions, and the contribution process.

Please read the [Code of Conduct](../CODE_OF_CONDUCT.md) before participating.

## Prerequisites

- Node.js 20+
- npm 10+

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
  components/    # 24 React client components
  lib/           # 10 core logic modules (crypto, compression, device, i18n, etc.)
  [page]/        # Next.js file-based routing
  globals.css    # Design system (CSS variables, glass effects, animations)
docs/            # Documentation
public/          # Static assets (llms.txt)
```

## Testing

```bash
npm test              # Run 125 tests (Vitest)
npm run test:watch    # Watch mode for development
```

Coverage thresholds enforced: 100% lines, 100% functions, 100% statements, 99% branches.

**Always run tests before submitting a PR.**

## Conventions

### Code Style

- TypeScript strict mode
- ESLint with Next.js config
- Components use default exports (`"use client"` with PascalCase filenames)
- All interactive elements need `cursor-pointer`

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

There are currently ~415 translation keys across 3 languages.

### Accessibility

- All text must pass WCAG 2.1 AA (4.5:1 contrast ratio)
- Form inputs need associated `<label>` elements
- Icon-only buttons need `aria-label`
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
4. Run tests: `npm test`
5. Run the build: `npm run build`
6. Verify no TypeScript errors: `npx tsc --noEmit`
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
7. Add URL parameter support (long + short alias) in the `useEffect` block
8. Add tests for the new feature
9. Update documentation (CLAUDE.md, README.md, llms.txt)

## Adding a New Persisted Preference

1. Add the field to the `Preferences` interface in `app/lib/preferences.ts`
2. Add a default value to the `DEFAULTS` object
3. Add a getter and setter in the `usePreferences()` return object
4. Use the preference in the relevant component

Current persisted preferences: `tab`, `inputMode`, `ttl`, `iterations`, `compression`, `keygenMode`, `keygenLength`.

## Releasing a New Version

When bumping the version, update ALL of these files together:

1. `CHANGELOG.md` — add new version entry with date
2. `package.json` — update `"version"` field
3. `app/layout.tsx` — update `softwareVersion` in JSON-LD schema
4. `app/opengraph-image.tsx` — update version badge text
5. `app/twitter-image.tsx` — update version badge text
6. `app/sitemap.ts` — update `lastModified` date

## Adding a New Route

1. Create `app/[route]/page.tsx` with a `metadata` export
2. Include: `title`, `description`, `keywords`, `openGraph` (url, title, description), `twitter` (title, description), `alternates.canonical`
3. For legal/utility pages: add `robots: { index: false, follow: true }`
4. For indexable pages: add the route to `app/sitemap.ts` with appropriate priority
5. Add i18n keys for the page content
6. Update route tables in CLAUDE.md and README.md

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

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).

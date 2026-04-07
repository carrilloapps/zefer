# Contributing

Thank you for your interest in contributing to Zefer. This document explains how to set up the development environment, the project conventions, and the contribution process.

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
  api/           # Server-side API routes (minimal)
  components/    # React components (all client-side)
  lib/           # Core logic (crypto, compression, device, i18n, etc.)
  [page]/        # Next.js file-based routing
  globals.css    # Design system (CSS variables, glass effects, animations)
scripts/
  generate-secret.mjs   # Instance secret generator
docs/            # Documentation
```

## Conventions

### Code Style

- TypeScript strict mode
- ESLint with Next.js config
- No default exports except for pages and layouts (Next.js requirement)
- Components are `"use client"` when they use hooks, state, or browser APIs

### Theming

All colors MUST use CSS custom properties or theme utility classes:

```tsx
// Correct
<p className="theme-muted">Text</p>
<p className="theme-heading">Heading</p>
<div className="glass">Card</div>

// Wrong
<p className="text-gray-500">Text</p>
<p className="text-white">Heading</p>
```

Available theme classes:
- `theme-heading` — strongest text
- `theme-text` — body text
- `theme-muted` — secondary text
- `theme-faint` — tertiary text (still WCAG AA compliant)
- `theme-primary-faint` — primary background tint
- `theme-primary-border` — primary border
- `theme-danger`, `theme-warning` — semantic colors
- `glass`, `glass-nav`, `glass-banner` — glass morphism

### i18n

All user-facing text MUST be in `app/lib/i18n.ts` with translations in all three languages (es, en, pt):

```typescript
"key.name": {
  es: "Texto en español",
  en: "English text",
  pt: "Texto em português",
},
```

### Accessibility

- All text must pass WCAG 2.1 AA (4.5:1 contrast ratio)
- Interactive elements need `cursor-pointer`
- Form inputs need associated `<label>` elements
- Icon-only buttons need `aria-label`
- Animations must respect `prefers-reduced-motion`

### Responsive

- Mobile-first: default styles for mobile, `sm:` / `md:` / `lg:` for larger screens
- Use `min-[Xpx]:` for breakpoints between Tailwind defaults
- Popovers: `fixed` on mobile, `absolute` on desktop
- Grids: stack on mobile, columns on desktop
- Inputs: `font-size: 16px` minimum on mobile (prevents iOS zoom)

## Making Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run the build: `npm run build`
5. Verify no TypeScript errors
6. Submit a pull request

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
7. Add to the How page features section

## Security Considerations

- Never store secrets, passphrases, or plaintext in `localStorage`, cookies, or server logs
- All security metadata must live inside the encrypted payload, not the public header
- New features should not increase the information visible to an attacker without the key
- Test with both dark and light mode, all three languages, and mobile/desktop

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

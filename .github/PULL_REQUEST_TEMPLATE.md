## Description

<!-- What does this PR do? -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor
- [ ] Documentation
- [ ] CI/CD

## Checklist

### Build & Tests

- [ ] `npm run build` passes with no errors
- [ ] `npm test` passes (125 tests)

### Code Conventions

- [ ] All text uses i18n keys (no hardcoded strings in es, en, pt)
- [ ] All colors use theme variables (no hardcoded Tailwind color classes)
- [ ] Tested in both dark and light mode
- [ ] Tested on mobile viewport (375px)

### Accessibility

- [ ] All text passes WCAG 2.1 AA contrast (4.5:1)
- [ ] Icon-only buttons have `aria-label` (dynamic when state changes)
- [ ] Icon-only buttons are at least 36x36px (`w-9 h-9`)
- [ ] Headings follow strict descending order (h1 → h2 → h3)
- [ ] Expand/collapse controls have `aria-expanded` and descriptive `aria-label`

### SEO (if adding/modifying routes)

- [ ] Page exports `metadata` with: title, description, keywords, openGraph, twitter, canonical
- [ ] Legal/utility pages use `robots: { index: false, follow: true }`
- [ ] Indexable pages are added to `app/sitemap.ts`
- [ ] Non-indexable pages are excluded from sitemap

### Security

- [ ] Security metadata is inside the encrypted payload, not the header
- [ ] Translations provided for es, en, and pt

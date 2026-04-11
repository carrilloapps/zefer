# Contributing to Zefer

Thank you for your interest in contributing to Zefer! This guide will help you get started.

## Quick Links

- [Code of Conduct](../CODE_OF_CONDUCT.md)
- [Security Policy](../SECURITY.md)
- [Full Contributing Guide](../docs/CONTRIBUTING.md)
- [Architecture](../docs/ARCHITECTURE.md)
- [Security Details](../docs/SECURITY.md)

## Getting Started

```bash
git clone https://github.com/carrilloapps/zefer.git
cd zefer
npm install
npm run dev
```

**Prerequisites:** Node.js 20+, npm 10+

## Before Submitting a PR

1. Run `npm test` — all 125 tests must pass
2. Run `npx tsc --noEmit` — no type errors
3. Run `npm run build` — production build succeeds
4. Test both dark and light mode
5. Test on mobile viewport (375px)
6. Ensure all text uses i18n keys (es, en, pt)
7. Ensure all colors use CSS variables or `theme-*` classes

## Key Rules

- **No hardcoded colors** — use `theme-*` classes or `var(--*)`
- **No hardcoded strings** — all text in `app/lib/i18n.ts` with 3 translations
- **Security metadata inside encrypted payload** — never in the public header
- **WCAG 2.1 AA** — all text must pass 4.5:1 contrast ratio
- **Components are `"use client"`** — this is a client-heavy app

## Types of Contributions

| Type | Label | Description |
|------|-------|-------------|
| Bug fix | `bug` | Fix broken functionality |
| Feature | `enhancement` | Add new functionality |
| Docs | `documentation` | Improve documentation |
| Security | `security` | Fix security issues ([report responsibly](../SECURITY.md)) |

For detailed conventions, project structure, and step-by-step guides, see [docs/CONTRIBUTING.md](../docs/CONTRIBUTING.md).

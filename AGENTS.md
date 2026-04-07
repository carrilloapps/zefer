<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Zefer Agent Guidelines

## Project Overview

Zefer is a 100% client-side encryption tool. Files are encrypted in the browser using AES-256-GCM and downloaded as `.zefer` files. No server stores user data.

## Key Rules

1. **All colors must use CSS variables or theme-* classes** — never hardcode Tailwind color classes
2. **All text must be in i18n.ts** with translations in es, en, pt
3. **Security metadata must be inside the encrypted payload** — never in the public header
4. **ZEFER_INSTANCE_SECRET must never be committed** — it lives only in the hosting environment
5. **Components are "use client"** — this is a client-heavy app
6. **Minimum passphrase length is 6 characters**
7. **Test both dark and light mode** after any CSS change
8. **All text must pass WCAG 2.1 AA** (4.5:1 contrast ratio)

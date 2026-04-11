# Deployment

> [README](../README.md) · [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md) · **Deployment** · [Contributing](CONTRIBUTING.md)

## Vercel (Recommended)

The fastest way to deploy Zefer:

1. Push your repository to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Deploy — no additional configuration needed

Vercel auto-detects Next.js and handles everything. All pages are prerendered at build time except `/api/author` (serverless function).

## Docker

Production-ready Dockerfile:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t zefer .
docker run -p 3000:3000 zefer
```

## Static Export

Zefer is almost entirely static. You can export it for any hosting provider:

```js
// next.config.ts
const nextConfig: NextConfig = {
  output: "export",
};
```

```bash
npm run build
# Output in /out — deploy to Netlify, Cloudflare Pages, S3, GitHub Pages, etc.
```

**Note:** Static export disables the `/api/author` route. The creator section on `/project` will use fallback data instead of live GitHub profile data.

## Self-Hosted (Node.js)

Run Zefer on your own server:

```bash
git clone https://github.com/carrilloapps/zefer.git
cd zefer
npm ci
npm run build
npm start
```

Use a reverse proxy (nginx, Caddy) to add HTTPS.

## Self-Hosting Checklist

| Step | Why |
|------|-----|
| Node.js 20+ installed | Required runtime |
| `npm test` passes (125 tests) | Ensures nothing is broken |
| `npm run build` succeeds | Generates optimized production build |
| HTTPS enabled | **Required** — Web Crypto API only works in secure contexts |
| Domain configured in `app/layout.tsx` (`siteUrl`) | Correct canonical URLs and OpenGraph metadata |
| Domain configured in `app/sitemap.ts` | Correct sitemap URLs for search engines |
| Domain configured in `app/robots.ts` | Correct sitemap reference |

## Environment Variables

Zefer has **no required environment variables**. Everything runs client-side with zero configuration.

The only server-side component (`/api/author`) uses the public GitHub API without authentication. If you experience rate limiting, you can optionally set:

```env
# Optional — increases GitHub API rate limit from 60/h to 5000/h
GITHUB_TOKEN=ghp_your_personal_access_token
```

## HTTPS Requirement

The Web Crypto API (`SubtleCrypto`) is only available in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts). This means:

- `https://` — works
- `http://localhost` — works (development)
- `http://192.168.x.x` — **does not work** (encryption will fail)

If you're running behind a reverse proxy, ensure it terminates TLS before reaching Zefer.

## Performance

All routes are static (prerendered at build time) except:

| Route | Type | Response Time |
|-------|------|---------------|
| All pages | Static HTML | Instant (CDN-cached) |
| `/api/author` | Serverless | ~50ms first call, cached for 1 hour |
| OG/Twitter images | Static PNG | Generated at build time |

Typical Lighthouse scores: 95+ Performance, 100 Accessibility, 100 Best Practices, 100 SEO.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Encryption fails silently | Ensure HTTPS is enabled — Web Crypto API requires secure context |
| `/api/author` returns error | GitHub API rate limit — wait 1 hour or set `GITHUB_TOKEN` |
| Build fails on `opengraph-image` | Ensure Node.js 20+ — OG image generation requires modern APIs |
| CSS looks wrong after deploy | Clear CDN/browser cache — Tailwind CSS v4 uses new hashing |
| PWA not installing | Verify `manifest.webmanifest` is served with correct MIME type |
| Service worker not updating | Users need to close all tabs and reopen — standard SW lifecycle |

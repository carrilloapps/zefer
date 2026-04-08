# Deployment

## Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Deploy

All pages are static except `/api/author` (serverless function, GitHub profile cache).

## Docker

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

```bash
docker build -t zefer .
docker run -p 3000:3000 zefer
```

## Static Export

Zefer is almost entirely static. You can export as a static site:

```js
// next.config.ts
const nextConfig: NextConfig = {
  output: "export",
};
```

```bash
npm run build
# Output in /out — deploy to any static host (Netlify, Cloudflare Pages, S3, etc.)
```

**Note:** Static export disables the `/api/author` route. The creator section on `/project` will use fallback data.

## Self-Hosting Checklist

- [ ] Node.js 20+ installed
- [ ] `npm run build` succeeds
- [ ] `npm test` passes (125 tests)
- [ ] HTTPS enabled (required for Web Crypto API)
- [ ] Correct domain in `app/layout.tsx` metadata (`siteUrl`)
- [ ] Correct domain in `app/sitemap.ts`
- [ ] Correct domain in `app/robots.ts`

## Performance

All routes are static (prerendered at build time) except:
- `/api/author` — 1 serverless function (~50ms first call, cached 1h)

Typical Lighthouse scores: 95+ Performance, 100 Accessibility, 100 Best Practices, 100 SEO.

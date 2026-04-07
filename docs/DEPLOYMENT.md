# Deployment

## Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Set environment variable (optional, for strict mode):
   ```
   ZEFER_INSTANCE_SECRET=<your-secret>
   ```
4. Deploy

All pages are static except `/api/instance` and `/api/author` (serverless functions).

## Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build
docker build -t zefer .

# Run (with strict mode)
docker run -p 3000:3000 -e ZEFER_INSTANCE_SECRET=<your-secret> zefer

# Run (without strict mode)
docker run -p 3000:3000 zefer
```

## Static Export

Zefer is almost entirely static. If you don't need strict mode (`/api/instance`), you can export as a static site:

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

**Note:** Static export disables the `/api/instance` and `/api/author` routes. Strict mode will not be available. The creator section on `/project` will use fallback data.

## Environment Variables

| Variable | Required | Where to Set | Description |
|---|---|---|---|
| `ZEFER_INSTANCE_SECRET` | No | Hosting env (never in code) | Enables strict encryption. 64+ hex chars recommended. |

### Generating the Secret

```bash
# Using the built-in script
npm run generate-secret

# Manually
openssl rand -hex 128
```

**This value must NEVER change** after files have been encrypted with strict mode. Changing it makes all strict-mode `.zefer` files permanently undecryptable.

## Self-Hosting Checklist

- [ ] `npm run build` succeeds
- [ ] Environment variable set (if using strict mode)
- [ ] HTTPS enabled (required for Web Crypto API)
- [ ] Correct domain in `app/layout.tsx` metadata (`siteUrl`)
- [ ] Correct domain in `app/sitemap.ts`
- [ ] Correct domain in `app/robots.ts`

## Performance

All routes are static (prerendered at build time) except:
- `/api/instance` — 1 serverless function (~5ms, returns cached hash)
- `/api/author` — 1 serverless function (~50ms first call, cached 1h)

Typical Lighthouse scores: 95+ Performance, 100 Accessibility, 100 Best Practices, 100 SEO.

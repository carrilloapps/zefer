# Releasing

> [README](../README.md) · [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md) · [Deployment](DEPLOYMENT.md) · [Contributing](CONTRIBUTING.md) · **Releasing**

Zefer is a web app, not a published package: a release is a version bump plus a
deploy. There is no npm publish step and no release token to configure.

The one thing that is easy to get wrong is that the version number is **repeated
in six places**, three of which are rendered into images at build time. They must
all move together, in the same commit.

---

## The version checklist

| # | File | What to change |
|---|---|---|
| 1 | `CHANGELOG.md` | Add a new `## [x.y.z] - YYYY-MM-DD` section at the top, plus its compare link |
| 2 | `package.json` | `"version"` |
| 3 | `app/layout.tsx` | `softwareVersion` in the `WebApplication` JSON-LD schema |
| 4 | `app/opengraph-image.tsx` | The version badge text |
| 5 | `app/twitter-image.tsx` | The version badge text |
| 6 | `app/sitemap.ts` | `lastModified` → the release date |

Items 3–6 are covered by tests (`app/__tests__/layout.test.tsx`,
`app/__tests__/image-routes.test.tsx`, `app/__tests__/sitemap.test.ts`), so a
half-finished bump fails the suite rather than shipping silently.

---

## Choosing the number

Zefer follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html). While
the app is pre-1.0, `0.MINOR.PATCH` is read as:

| Change | Version bump |
|---|---|
| Bug fix, copy change, internal refactor | `patch` |
| New page, new security option, new UI capability, dependency migration | `minor` |
| Binary format change (new magic bytes, new ZEFB/ZEFR version) | `minor` while pre-1.0 — **must also ship in [zefer-cli](https://github.com/carrilloapps/zefer-cli) at the same time** |

A `.zefer` file written by the web app must stay byte-for-byte readable by the
CLI, the MCP server and the library, and vice versa. Any change to
`app/lib/crypto.ts`, `app/lib/chunked-crypto.ts` or `app/lib/zefer.ts` is a
cross-repository change.

---

## Step by step

### 1 — Update the six files

Edit them by hand; there is no `npm version` hook here, because four of the six
are source files rather than metadata.

### 2 — Run the gates

```bash
npm run validate   # typecheck + lint + test + build
```

`npm run test:coverage` must also stay at 100% on statements, branches,
functions and lines. `.github/workflows/ci.yml` re-runs all of this on Node.js
20 and 22 for the push and the pull request.

### 3 — Verify the generated social images

```bash
npm run build
node scripts/og-review.mjs
```

The OG and Twitter images are generated at build time by
`app/opengraph-image.tsx` and `app/twitter-image.tsx` (Satori / `ImageResponse`).
Check that the version badge reads the new number.

### 4 — Commit, tag and push

```bash
git add -A
git commit -m "chore(release): vX.Y.Z — <one-line summary>"
git tag vX.Y.Z
git push origin main --tags
```

### 5 — Create the GitHub Release

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes-file <(sed -n '/## \[X.Y.Z\]/,/^## \[/p' CHANGELOG.md)
```

Or paste the changelog section into the release body by hand.

### 6 — Deploy

Deployment is covered in [DEPLOYMENT.md](DEPLOYMENT.md). After the deploy is
live, confirm:

- `https://zefer.carrillo.app/` loads and the service worker updates (the SW
  caches all pages; a stale cache shows the previous release)
- The OG image at `/opengraph-image` shows the new version badge
- `/sitemap.xml` carries the new `lastmod`

---

## Changelog format

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Use the standard section headings — `Added`, `Changed`, `Fixed`, `Removed`,
`Security` — and put the compare link directly under the section:

```markdown
## [0.12.0] - 2026-09-20

### Added

- ...

### Security

- ...

[0.12.0]: https://github.com/carrilloapps/zefer/compare/v0.11.0...v0.12.0
```

---

## Keeping the CLI in step

[zefer-cli](https://github.com/carrilloapps/zefer-cli) versions independently —
the two repositories do not share a version number. What they do share is the
`.zefer` binary format and the cryptographic parameters. When a release touches
either, ship both sides together and note the counterpart version in both
changelogs. The CLI's own process is documented in its
[`docs/RELEASING.md`](https://github.com/carrilloapps/zefer-cli/blob/main/docs/RELEASING.md).

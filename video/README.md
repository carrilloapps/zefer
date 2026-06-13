# Zefer — social video promos (Remotion)

Isolated [Remotion](https://www.remotion.dev) subproject that renders branded promo
videos for Zefer in every social aspect ratio. It has its **own** `package.json`, so
the main Next.js app's dependencies stay clean.

## Formats → networks

| Composition | Size | Use for |
|---|---|---|
| `Promo-9x16` | 1080×1920 | TikTok, Instagram/Facebook Reels, YouTube Shorts, Stories |
| `Promo-1x1` | 1080×1080 | Facebook, Instagram, LinkedIn feed |
| `Promo-16x9` | 1920×1080 | X / Twitter, LinkedIn, YouTube |
| `Promo-4x5` | 1080×1350 | Instagram / Facebook feed (max real estate) |

All export H.264 / yuv420p MP4 — the most broadly compatible codec across networks.

## Usage

```bash
cd video
npm install
npm run studio        # live preview / edit at http://localhost:3000
npm run render:all    # render all four formats into out/
# or one at a time:
npm run render:9x16   # render:1x1 · render:16x9 · render:4x5
```

Rendered files land in `out/` (git-ignored). The composition source is in `src/`
(`ZeferPromo.tsx` is the adaptive scene; `Root.tsx` registers one composition per format).

## Editing

`ZeferPromo.tsx` is fully responsive: it derives a `u` unit from `min(width, height)`
and switches the encryption-flow layout between column (portrait) and row (landscape),
so the same scenes look right in every ratio. Tweak copy, colors (`GREEN`, `BG`),
timings (the `Sequence` `from`/`durationInFrames`) or scenes there.

## Licensing

Remotion is **free** for individuals and small teams, and for open-source projects —
which is how Zefer (MIT, by José Carrillo) uses it here. Companies with 4+ people that
use Remotion need a paid Company License. See https://remotion.dev/license. This
subproject is for producing Zefer's own marketing assets.

# Zefer — Product-Spot Video (Remotion)

An isolated [Remotion](https://www.remotion.dev) subproject that renders Zefer's
promotional **product spot**. It has its **own** `package.json`, so the main
Next.js app's dependencies stay clean.

- **Format:** 16:9 — 1920×1080, 30 fps, ~34 s, H.264 / yuv420p.
- **Design system:** mirrors the web app — **Geist / Geist Mono** typefaces
  (inlined in `src/fonts-data.ts`, so no network is needed during a render), the
  same theme tokens as `app/globals.css`, and the **lucide-react** icon set.
- **Narrative (en_US):** brand intro → "what is Zefer" → an animated, interactive
  product demo (a cursor types a secret, sets a passphrase, clicks Encrypt, an
  AES-256-GCM progress bar runs, and a `.zefer` file is "downloaded") → a feature
  grid → channels with a terminal → a closing call to action.

## Usage

```bash
cd video
npm install
npm run studio    # live preview and editing at http://localhost:3000
npm run render    # render to out/zefer-16x9.mp4
```

The `out/` directory is git-ignored. Remotion downloads its own headless browser
on the first render. If that download fails (for example, on a sandboxed or CI
machine), point Remotion at a system Chrome instead:

```bash
# macOS / Linux
REMOTION_BROWSER_EXECUTABLE="/path/to/chrome" npm run render

# Windows (PowerShell)
$env:REMOTION_BROWSER_EXECUTABLE="C:\Program Files\Google\Chrome\Application\chrome.exe"; npm run render
```

## Structure

```
src/
  index.ts            registerRoot plus a side-effect that registers the fonts
  Root.tsx            the Promo-16x9 <Composition>
  ZeferPromo.tsx      composes the six scenes over the shared backdrop
  fonts-data.ts       Geist / Geist Mono inlined as base64 (self-contained)
  lib/
    theme.ts          design tokens (colors and font families) from globals.css
    timeline.ts       fps, duration, and scene frame ranges (single source of truth)
    animation.ts      the enter() entrance helper and the clamp option
    fonts.ts          injects the @font-face rules at load time
  components/
    Shield.tsx        the animated logo
    layout.tsx        the Backdrop, Center, and Eyebrow primitives
  scenes/
    Brand.tsx · Value.tsx · Demo.tsx · Features.tsx · Channels.tsx · Cta.tsx
```

Edit the copy and timing of a scene in `src/scenes/*`, the design tokens in
`src/lib/theme.ts`, and the scene durations in `src/lib/timeline.ts`. Codec and
output settings live in `remotion.config.ts`.

## Licensing

Remotion is **free** for individuals, small teams, and open-source projects,
which is how Zefer (MIT, by José Carrillo) uses it here. Companies with four or
more people that use Remotion need a paid Company License — see
https://remotion.dev/license.

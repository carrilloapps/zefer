import { FONT_FACES } from "../fonts-data";

// Register Geist / Geist Mono as inline data: URIs before React mounts. They
// decode with no network fetch, so they load reliably across Remotion's
// periodic page reloads — a blocking delayRender() intermittently hung and
// failed renders near the end. Imported for its side effect from index.ts.
if (typeof document !== "undefined") {
  const css = FONT_FACES
    .map(
      (f) =>
        `@font-face{font-family:'${f.family}';font-style:normal;font-weight:${f.weight};font-display:block;src:url(${f.data}) format('woff2')}`,
    )
    .join("");
  const style = document.createElement("style");
  style.setAttribute("data-zefer-fonts", "");
  style.textContent = css;
  document.head.appendChild(style);
  // Proactively kick off decoding (non-blocking).
  FONT_FACES.forEach((f) => {
    try {
      void document.fonts.load(`${f.weight} 24px '${f.family}'`);
    } catch {
      /* noop */
    }
  });
}

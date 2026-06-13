import type { CSSProperties } from "react";
import { interpolate, spring } from "remotion";

/** interpolate() options that clamp both ends — used everywhere. */
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Fade + slide-up entrance driven by a spring that starts at `delay` frames. */
export function enter(frame: number, fps: number, delay: number): CSSProperties {
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return { opacity: s, transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px)` };
}

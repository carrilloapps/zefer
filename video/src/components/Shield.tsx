import type { FC } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../lib/theme";

/** Zefer's shield logo — scales/fades in with a pulsing glow. */
export const Shield: FC<{ size: number; delay?: number }> = ({ size, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.8 } });
  const scale = interpolate(s, [0, 1], [0.6, 1]);
  const glow = interpolate(frame % 90, [0, 45, 90], [0.35, 0.75, 0.35]);
  return (
    <div style={{ opacity: s, transform: `scale(${scale})` }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        style={{ filter: `drop-shadow(0 0 ${size * 0.07}px rgba(34,197,94,${glow}))`, display: "block" }}
      >
        <path
          d="M16 2L4 8v8c0 7.18 5.1 13.88 12 15.4C22.9 29.88 28 23.18 28 16V8L16 2z"
          fill="rgba(34,197,94,0.10)"
          stroke={COLORS.green}
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
        <path d="M11 16l4 4 6-7" stroke={COLORS.green} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

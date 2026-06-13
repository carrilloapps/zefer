import type { FC, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../lib/theme";
import { enter } from "../lib/animation";

/** Full-frame background: grid + radial green glow over the dark base. */
export const Backdrop: FC = () => (
  <>
    <AbsoluteFill style={{ background: COLORS.bg }} />
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(circle at 50% 42%, black, transparent 78%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 42%, black, transparent 78%)",
      }}
    />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, rgba(34,197,94,0.16), transparent 60%)" }} />
  </>
);

/** Centered column used by most scenes. */
export const Center: FC<{ children: ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 22, textAlign: "center" }}
  >
    {children}
  </AbsoluteFill>
);

/** Small uppercase mono kicker above a scene's headline. */
export const Eyebrow: FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        ...enter(frame, fps, delay),
        fontFamily: FONTS.mono,
        fontSize: 22,
        letterSpacing: 5,
        color: COLORS.green,
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
};

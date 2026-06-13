import type { FC } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../lib/theme";
import { enter } from "../lib/animation";
import { Center } from "../components/layout";
import { Shield } from "../components/Shield";

export const CtaScene: FC<{ networks?: string }> = ({ networks }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Center>
      <Shield size={130} delay={2} />
      <div style={{ ...enter(f, fps, 12), fontSize: 78, fontWeight: 800, color: COLORS.text }}>
        zefer<span style={{ color: COLORS.green }}>.carrillo.app</span>
      </div>
      <div style={{ ...enter(f, fps, 20), fontSize: 30, color: COLORS.muted, fontWeight: 500 }}>Free &amp; open source · MIT</div>
      {networks ? (
        <div style={{ ...enter(f, fps, 28), marginTop: 18, fontFamily: FONTS.mono, fontSize: 19, color: COLORS.faint }}>{networks}</div>
      ) : null}
    </Center>
  );
};

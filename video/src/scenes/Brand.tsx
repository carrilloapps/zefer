import type { FC } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../lib/theme";
import { enter } from "../lib/animation";
import { Center } from "../components/layout";
import { Shield } from "../components/Shield";

export const BrandScene: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Center>
      <Shield size={210} delay={2} />
      <div style={{ ...enter(frame, fps, 16), fontSize: 132, fontWeight: 800, color: COLORS.text, letterSpacing: -3, lineHeight: 1 }}>
        Zefer
      </div>
      <div style={{ ...enter(frame, fps, 26), fontSize: 38, fontWeight: 600, color: COLORS.muted }}>
        Encrypt &amp; share secrets securely
      </div>
      <div
        style={{
          ...enter(frame, fps, 34),
          fontFamily: FONTS.mono,
          fontSize: 20,
          letterSpacing: 3,
          color: COLORS.green,
          padding: "8px 18px",
          borderRadius: 999,
          border: "1px solid rgba(34,197,94,0.3)",
          background: "rgba(34,197,94,0.08)",
        }}
      >
        E2E · AES-256-GCM · ZERO-KNOWLEDGE
      </div>
    </Center>
  );
};

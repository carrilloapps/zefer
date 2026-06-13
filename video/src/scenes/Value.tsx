import type { FC } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../lib/theme";
import { enter } from "../lib/animation";
import { Center, Eyebrow } from "../components/layout";

export const ValueScene: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Center>
      <Eyebrow text="What is Zefer?" />
      <div style={{ ...enter(frame, fps, 8), fontSize: 60, fontWeight: 700, color: COLORS.text, maxWidth: 1300, lineHeight: 1.18 }}>
        Turn any text or file into a password-protected{" "}
        <span style={{ color: COLORS.green, fontFamily: FONTS.mono }}>.zefer</span> file
      </div>
      <div style={{ ...enter(frame, fps, 18), fontSize: 30, color: COLORS.muted, fontWeight: 500, maxWidth: 1100, lineHeight: 1.4 }}>
        Encrypted entirely in your browser. No servers, no accounts — your data never leaves your device.
      </div>
    </Center>
  );
};

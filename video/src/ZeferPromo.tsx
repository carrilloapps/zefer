import type { FC } from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "./lib/theme";
import { clamp } from "./lib/animation";
import { SCENES } from "./lib/timeline";
import { Backdrop } from "./components/layout";
import { BrandScene } from "./scenes/Brand";
import { ValueScene } from "./scenes/Value";
import { DemoScene } from "./scenes/Demo";
import { FeaturesScene } from "./scenes/Features";
import { ChannelsScene } from "./scenes/Channels";
import { CtaScene } from "./scenes/Cta";

/** The Zefer product spot: 6 sequenced scenes over a shared backdrop. */
export const ZeferPromo: FC<{ networks?: string }> = ({ networks }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const outro = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ fontFamily: FONTS.sans, opacity: outro }}>
      <Backdrop />
      <Sequence {...SCENES.brand}><BrandScene /></Sequence>
      <Sequence {...SCENES.value}><ValueScene /></Sequence>
      <Sequence {...SCENES.demo}><DemoScene /></Sequence>
      <Sequence {...SCENES.features}><FeaturesScene /></Sequence>
      <Sequence {...SCENES.channels}><ChannelsScene /></Sequence>
      <Sequence {...SCENES.cta}><CtaScene networks={networks} /></Sequence>
    </AbsoluteFill>
  );
};

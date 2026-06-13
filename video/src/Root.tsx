import type { FC } from "react";
import { Composition } from "remotion";
import { ZeferPromo } from "./ZeferPromo";
import { FPS, DURATION_IN_FRAMES } from "./lib/timeline";

// 16:9 (1920×1080) — covers X, LinkedIn, YouTube and embeds.
export const RemotionRoot: FC = () => (
  <Composition
    id="Promo-16x9"
    component={ZeferPromo}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{ networks: "X · LinkedIn · YouTube" }}
  />
);

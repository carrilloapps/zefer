import { Composition } from "remotion";
import { ZeferPromo } from "./ZeferPromo";

const FPS = 30;
const DURATION_S = 13;

const FORMATS = [
  { id: "Promo-9x16", width: 1080, height: 1920, networks: "TikTok · Reels · Shorts · Stories" },
  { id: "Promo-1x1", width: 1080, height: 1080, networks: "Facebook · Instagram · LinkedIn feed" },
  { id: "Promo-16x9", width: 1920, height: 1080, networks: "X · LinkedIn · YouTube" },
  { id: "Promo-4x5", width: 1080, height: 1350, networks: "Instagram · Facebook feed" },
] as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {FORMATS.map((f) => (
        <Composition
          key={f.id}
          id={f.id}
          component={ZeferPromo}
          durationInFrames={DURATION_S * FPS}
          fps={FPS}
          width={f.width}
          height={f.height}
          defaultProps={{ networks: f.networks }}
        />
      ))}
    </>
  );
};

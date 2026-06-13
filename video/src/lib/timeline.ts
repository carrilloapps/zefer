// Single source of truth for the spot's timing. Frame ranges are absolute;
// inside each Sequence, useCurrentFrame() is re-based to 0 by Remotion.
export const FPS = 30;
export const DURATION_S = 34;
export const DURATION_IN_FRAMES = DURATION_S * FPS; // 1020

export const SCENES = {
  brand: { from: 0, durationInFrames: 90 },
  value: { from: 90, durationInFrames: 96 },
  demo: { from: 186, durationInFrames: 372 },
  features: { from: 558, durationInFrames: 210 },
  channels: { from: 768, durationInFrames: 138 },
  cta: { from: 906, durationInFrames: DURATION_IN_FRAMES - 906 },
} as const;

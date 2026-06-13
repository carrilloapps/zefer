// Design tokens mirrored from the Zefer web app (app/globals.css, dark theme).
export const COLORS = {
  green: "#22c55e", // --primary
  greenDim: "#16a34a", // --primary-hover
  cyan: "#06b6d4", // --gradient-to
  bg: "#050a0e",
  panel: "rgba(12,20,28,0.97)", // --glass-solid
  glass: "rgba(255,255,255,0.04)", // --glass-bg
  inputBg: "#0a0f15",
  text: "#ffffff", // --heading
  muted: "rgba(255,255,255,0.55)", // ≈ --text-muted
  faint: "rgba(255,255,255,0.38)", // ≈ --text-faint
  line: "rgba(255,255,255,0.08)", // --glass-border
  primaryFaint: "rgba(34,197,94,0.1)", // --primary-faint
  primaryBorder: "rgba(34,197,94,0.25)",
} as const;

// The web app's typefaces (self-hosted, registered in lib/fonts.ts).
export const FONTS = {
  sans: "'Geist Sans', 'Segoe UI', system-ui, -apple-system, sans-serif",
  mono: "'Geist Mono', 'Consolas', 'SF Mono', monospace",
} as const;

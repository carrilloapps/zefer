// Render every social format to out/ with network-friendly names.
// Auto-detects a system Chrome/Edge (Remotion's bundled-browser download can
// fail in sandboxed/CI environments); falls back to Remotion's own browser.
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";

mkdirSync("out", { recursive: true });

const CANDIDATES = [
  process.env.REMOTION_BROWSER_EXECUTABLE,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const chrome = CANDIDATES.find((p) => existsSync(p));
const browserFlag = chrome ? ` --browser-executable=${JSON.stringify(chrome)}` : "";
if (chrome) console.log(`Using system browser: ${chrome}`);

const FORMATS = [
  ["Promo-9x16", "zefer-9x16-tiktok-reels-shorts-stories.mp4"],
  ["Promo-1x1", "zefer-1x1-facebook-instagram-linkedin.mp4"],
  ["Promo-16x9", "zefer-16x9-x-linkedin-youtube.mp4"],
  ["Promo-4x5", "zefer-4x5-instagram-facebook-feed.mp4"],
];

for (const [id, out] of FORMATS) {
  console.log(`\n=== Rendering ${id} -> out/${out} ===`);
  execSync(`npx remotion render src/index.ts ${id} out/${out}${browserFlag}`, { stdio: "inherit" });
}
console.log("\nAll formats rendered to out/.");

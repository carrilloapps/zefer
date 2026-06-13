import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// H.264 + yuv420p is the most broadly compatible codec for every network.
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");

// If Remotion can't download its own headless browser (sandboxed/CI machines),
// point it at a system Chrome via REMOTION_BROWSER_EXECUTABLE. No-op otherwise.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}

import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// H.264 + yuv420p is the most broadly compatible codec for every social network.
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");

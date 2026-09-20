import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Every social/app image is an `ImageResponse` built by Satori. Rendering one
 * end to end proves the JSX it is given is layout-valid (Satori throws on, say,
 * a multi-child `div` without `display: flex`) and that the PNG it produces
 * really has the dimensions the route advertises to crawlers and manifests.
 */
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Width/height from the PNG IHDR chunk, which always follows the signature. */
async function pngSize(response: Response): Promise<{ width: number; height: number }> {
  const bytes = Buffer.from(await response.arrayBuffer());

  expect(bytes.subarray(0, 8)).toEqual(PNG_SIGNATURE);
  expect(bytes.subarray(12, 16).toString("ascii")).toBe("IHDR");

  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const images = [
  { name: "opengraph-image", load: () => import("@/app/opengraph-image"), width: 1200, height: 630 },
  { name: "twitter-image", load: () => import("@/app/twitter-image"), width: 1200, height: 630 },
  { name: "apple-icon", load: () => import("@/app/apple-icon"), width: 180, height: 180 },
];

describe.each(images)("$name", ({ load, width, height }) => {
  it("exports the size and content type Next.js uses for the meta tags", async () => {
    const mod = await load();

    expect(mod.size).toEqual({ width, height });
    expect(mod.contentType).toBe("image/png");
  });

  it("renders a PNG at the declared size", async () => {
    const { default: image } = await load();
    const response = image();

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("content-type")).toBe("image/png");
    await expect(pngSize(response)).resolves.toEqual({ width, height });
  });
});

describe("social image alt text", () => {
  it("describes both social cards for screen readers", async () => {
    const og = await import("@/app/opengraph-image");
    const twitter = await import("@/app/twitter-image");

    expect(og.alt).toBe("Zefer — Share Secrets Securely");
    expect(twitter.alt).toBe("Zefer — Share Secrets Securely");
  });
});

describe("social image version badge", () => {
  it.each(["opengraph-image.tsx", "twitter-image.tsx"])(
    "%s shows the released version",
    async (file) => {
      const { version } = (await import("../../package.json")) as { version: string };
      const source = await readFile(path.resolve(import.meta.dirname, "..", file), "utf8");

      expect(source).toContain(`>v${version}<`);
    },
  );
});

const icons = [
  { name: "icon-192.png", load: () => import("@/app/icon-192.png/route"), size: 192 },
  { name: "icon-512.png", load: () => import("@/app/icon-512.png/route"), size: 512 },
  {
    name: "icon-512-maskable.png",
    load: () => import("@/app/icon-512-maskable.png/route"),
    size: 512,
  },
];

describe.each(icons)("$name", ({ load, size }) => {
  // The Edge Runtime is deprecated in Next 16; these routes declare no
  // `runtime`, so they prerender statically on the default Node runtime.
  it("declares no explicit runtime", async () => {
    expect(Object.keys(await load())).not.toContain("runtime");
  });

  it("serves a square PNG at the manifest's declared size", async () => {
    const { GET } = await load();
    const response = await GET();

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("content-type")).toBe("image/png");
    await expect(pngSize(response)).resolves.toEqual({ width: size, height: size });
  });
});

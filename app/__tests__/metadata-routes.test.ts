import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import manifest from "@/app/manifest";
import sitemap from "@/app/sitemap";

const SITE_URL = "https://zefer.carrillo.app";

describe("robots.txt", () => {
  it("opens the site to every crawler", () => {
    const [rule] = robots().rules as { userAgent: string; allow: string }[];

    expect(rule.userAgent).toBe("*");
    expect(rule.allow).toBe("/");
  });

  it("keeps the API, build output and service worker out of the index", () => {
    const [rule] = robots().rules as { disallow: string[] }[];

    expect(rule.disallow).toEqual(["/api/", "/_next/", "/sw.js"]);
  });

  it("points at the sitemap and declares the canonical host", () => {
    const { sitemap: sitemapUrl, host } = robots();

    expect(sitemapUrl).toBe(`${SITE_URL}/sitemap.xml`);
    expect(host).toBe(SITE_URL);
  });

  it("never disallows a route the sitemap advertises", () => {
    const [rule] = robots().rules as { disallow: string[] }[];
    const paths = sitemap().map((entry) => entry.url.replace(SITE_URL, "") || "/");

    for (const path of paths) {
      for (const blocked of rule.disallow) expect(path.startsWith(blocked)).toBe(false);
    }
  });
});

describe("web app manifest", () => {
  it("installs as a standalone app scoped to the whole origin", () => {
    const { display, scope, start_url, orientation } = manifest();

    expect(display).toBe("standalone");
    expect(scope).toBe("/");
    expect(start_url).toBe("/");
    expect(orientation).toBe("portrait-primary");
  });

  it("names and describes the app for the install prompt", () => {
    const { name, short_name, description, categories } = manifest();

    expect(name).toBe("Zefer — Share Secrets Securely");
    expect(short_name).toBe("Zefer");
    expect(short_name!.length).toBeLessThanOrEqual(12);
    expect(description).toEqual(expect.any(String));
    expect(categories).toEqual(["security", "utilities", "productivity"]);
  });

  it("ships every icon size the install prompt needs, including a maskable one", () => {
    const icons = manifest().icons!;

    expect(icons.map((icon) => icon.src)).toEqual([
      "/icon.svg",
      "/icon-192.png",
      "/icon-512.png",
      "/icon-512-maskable.png",
    ]);
    expect(icons.find((icon) => icon.purpose === "maskable")?.sizes).toBe("512x512");
    for (const icon of icons) expect(icon.type).toMatch(/^image\//);
  });

  it("offers a wide and a narrow screenshot", () => {
    const screenshots = manifest().screenshots as unknown as {
      src: string;
      sizes: string;
      form_factor: string;
      label: string;
    }[];

    expect(screenshots.map((shot) => shot.form_factor)).toEqual(["wide", "narrow"]);
    expect(screenshots.map((shot) => shot.src)).toEqual(["/opengraph-image", "/twitter-image"]);
    for (const shot of screenshots) {
      expect(shot.sizes).toBe("1200x630");
      expect(shot.label.length).toBeGreaterThan(0);
    }
  });

  it("paints the splash screen in the dark theme's background", () => {
    // Matches the dark entry of the root layout's `viewport.themeColor`, so the
    // install splash does not flash a different background than the app.
    expect(manifest().background_color).toBe("#050a0e");
    expect(manifest().theme_color).toMatch(/^#[0-9a-f]{6}$/);
  });
});

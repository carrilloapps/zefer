import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * `next/font/google` reaches out to the font CDN at build time; the layout only
 * cares about the CSS variable names it hands back.
 */
vi.mock("next/font/google", () => ({
  Geist: ({ variable }: { variable: string }) => ({ variable: `font-sans ${variable}` }),
  Geist_Mono: ({ variable }: { variable: string }) => ({ variable: `font-mono ${variable}` }),
}));

// The layout only wires providers together; each one has its own suite.
vi.mock("@/app/components/LanguageProvider", () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-provider="language">{children}</div>
  ),
}));
vi.mock("@/app/components/ThemeProvider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-provider="theme">{children}</div>
  ),
}));
vi.mock("@/app/components/LegalBanner", () => ({ default: () => <div data-widget="legal-banner" /> }));
vi.mock("@/app/components/DonateFab", () => ({ default: () => <div data-widget="donate-fab" /> }));
vi.mock("@/app/components/ToastProvider", () => ({ default: () => <div data-widget="toasts" /> }));
vi.mock("@/app/components/KeyboardShortcuts", () => ({
  default: () => <div data-widget="shortcuts" />,
}));
vi.mock("../globals.css", () => ({}));

const SITE_URL = "https://zefer.carrillo.app";

async function renderLayout() {
  const { default: RootLayout } = await import("@/app/layout");
  return renderToStaticMarkup(
    <RootLayout>
      <main data-child="page" />
    </RootLayout>,
  );
}

/** The single `application/ld+json` blob the root layout injects. */
async function structuredData(): Promise<Record<string, unknown>> {
  const match = /<script type="application\/ld\+json">(.*?)<\/script>/.exec(await renderLayout());
  expect(match).not.toBeNull();
  return JSON.parse(match![1]) as Record<string, unknown>;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("root layout metadata", () => {
  it("resolves relative metadata URLs against the canonical origin", async () => {
    const { metadata } = await import("@/app/layout");

    expect(metadata.metadataBase).toBeInstanceOf(URL);
    expect(metadata.metadataBase!.toString()).toBe(`${SITE_URL}/`);
    expect(metadata.alternates?.canonical).toBe(SITE_URL);
  });

  it("suffixes child page titles with the brand", async () => {
    const { metadata } = await import("@/app/layout");

    expect(metadata.title).toEqual({
      default: "Zefer — Share Secrets Securely",
      template: "%s | Zefer",
    });
  });

  it("lets crawlers index the site with full previews", async () => {
    const { metadata } = await import("@/app/layout");

    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    });
  });

  it("declares the site-wide Open Graph and Twitter identity", async () => {
    const { metadata } = await import("@/app/layout");

    expect(metadata.openGraph).toMatchObject({
      type: "website",
      locale: "en_US",
      alternateLocale: ["es_VE", "pt_BR"],
      url: SITE_URL,
      siteName: "Zefer",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      site: "@carrilloapps",
      creator: "@carrilloapps",
    });
  });

  it("attributes the site to its author as plain text", async () => {
    const { metadata } = await import("@/app/layout");

    expect(metadata.authors).toEqual([{ name: "José Carrillo", url: "https://carrillo.app" }]);
    expect(metadata.creator).toBe("José Carrillo");
    expect(metadata.publisher).toBe("José Carrillo");
  });
});

describe("root layout viewport", () => {
  it("pairs a theme color with each color scheme", async () => {
    const { viewport } = await import("@/app/layout");

    expect(viewport.themeColor).toEqual([
      { media: "(prefers-color-scheme: dark)", color: "#050a0e" },
      { media: "(prefers-color-scheme: light)", color: "#f8fafb" },
    ]);
  });

  it("allows pinch zoom up to 5x and covers the display cutout", async () => {
    const { viewport } = await import("@/app/layout");

    expect(viewport.width).toBe("device-width");
    expect(viewport.initialScale).toBe(1);
    expect(viewport.maximumScale).toBe(5);
    expect(viewport.viewportFit).toBe("cover");
  });
});

describe("root layout document", () => {
  it("server-renders in the default dark theme with the font variables applied", async () => {
    const markup = await renderLayout();

    expect(markup).toContain('data-theme="dark"');
    expect(markup).toContain("--font-geist-sans");
    expect(markup).toContain("--font-geist-mono");
  });

  it("nests the page inside the theme and language providers", async () => {
    const markup = await renderLayout();

    expect(markup.indexOf('data-provider="theme"')).toBeLessThan(
      markup.indexOf('data-provider="language"'),
    );
    expect(markup.indexOf('data-provider="language"')).toBeLessThan(
      markup.indexOf('data-child="page"'),
    );
  });

  it("mounts the global widgets once each", async () => {
    const markup = await renderLayout();

    for (const widget of ["legal-banner", "donate-fab", "toasts", "shortcuts"]) {
      expect(markup.split(`data-widget="${widget}"`)).toHaveLength(2);
    }
  });

  it("preconnects to the font hosts and prefetches the GitHub API", async () => {
    const markup = await renderLayout();

    expect(markup).toContain('rel="preconnect" href="https://fonts.googleapis.com"');
    expect(markup).toContain('rel="preconnect" href="https://fonts.gstatic.com"');
    expect(markup).toContain('rel="dns-prefetch" href="https://api.github.com"');
  });

  it("restores the saved theme before paint", async () => {
    const markup = await renderLayout();

    expect(markup).toContain("localStorage.getItem('zefer-theme')");
    expect(markup).toContain("prefers-color-scheme: light");
  });

  it("registers the service worker in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const markup = await renderLayout();

    expect(markup).toContain('navigator.serviceWorker.register("/sw.js")');
    expect(markup).not.toContain("getRegistrations");
  });

  it("unregisters stale service workers outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const markup = await renderLayout();

    expect(markup).toContain("navigator.serviceWorker.getRegistrations()");
    expect(markup).not.toContain('register("/sw.js")');
  });
});

describe("root layout structured data", () => {
  it("describes the site as a free WebApplication", async () => {
    const data = await structuredData();

    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("WebApplication");
    expect(data.name).toBe("Zefer");
    expect(data.url).toBe(SITE_URL);
    expect(data.applicationCategory).toBe("SecurityApplication");
    expect(data.isAccessibleForFree).toBe(true);
    expect(data.offers).toMatchObject({ "@type": "Offer", price: "0", priceCurrency: "USD" });
    expect(data.license).toBe("https://opensource.org/licenses/MIT");
  });

  it("matches the released package version", async () => {
    const { version } = (await import("../../package.json")) as { version: string };

    expect((await structuredData()).softwareVersion).toBe(version);
  });

  it("lists the encryption feature set", async () => {
    const featureList = (await structuredData()).featureList as string[];

    expect(featureList).toEqual(expect.arrayContaining([
      "AES-256-GCM encryption",
      "PBKDF2-SHA256 key derivation",
      "100% client-side processing",
      "Zero-knowledge architecture",
    ]));
    expect(new Set(featureList).size).toBe(featureList.length);
  });

  it("links the documented help, install and release-notes entry points", async () => {
    const data = await structuredData();

    expect(data.screenshot).toBe(`${SITE_URL}/opengraph-image`);
    expect(data.installUrl).toBe(`${SITE_URL}/install`);
    expect(data.releaseNotes).toBe(
      "https://github.com/carrilloapps/zefer/blob/main/CHANGELOG.md",
    );
    expect(data.softwareHelp).toEqual({
      "@type": "CreativeWork",
      url: `${SITE_URL}/install/guide`,
    });
  });

  it("credits the author with absolute profile URLs only", async () => {
    const author = (await structuredData()).author as { name: string; sameAs: string[] };

    expect(author.name).toBe("José Carrillo");
    expect(author.sameAs).toContain("https://github.com/carrilloapps");
    for (const profile of author.sameAs) expect(profile).toMatch(/^https:\/\//);
  });

  it("serves the three supported languages", async () => {
    expect((await structuredData()).inLanguage).toEqual(["en", "es", "pt"]);
  });
});

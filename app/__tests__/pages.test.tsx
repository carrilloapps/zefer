import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Metadata } from "next";
import { SITE_URL } from "@/app/lib/seo";

/**
 * Every route file is a thin shell: an exported `metadata` object built from
 * `pageMetadata`, zero or more JSON-LD blobs, and a single content component.
 * The content components belong to their own suites, so they are stubbed with
 * a marker that proves the route wired the right one (and passed the right
 * props) without dragging their trees into this file.
 */
function marker(name: string) {
  const Marker = () => <div data-content={name} />;
  Marker.displayName = name;
  return Marker;
}

vi.mock("@/app/components/HomeContent", () => ({ default: marker("HomeContent") }));
vi.mock("@/app/components/HowContent", () => ({ default: marker("HowContent") }));
vi.mock("@/app/components/AnalyzerContent", () => ({ default: marker("AnalyzerContent") }));
vi.mock("@/app/components/ConductContent", () => ({ default: marker("ConductContent") }));
vi.mock("@/app/components/DeviceContent", () => ({ default: marker("DeviceContent") }));
vi.mock("@/app/components/GeneratorContent", () => ({ default: marker("GeneratorContent") }));
vi.mock("@/app/components/InstallContent", () => ({ default: marker("InstallContent") }));
vi.mock("@/app/components/GuideContent", () => ({ default: marker("GuideContent") }));
vi.mock("@/app/components/LibraryContent", () => ({ default: marker("LibraryContent") }));
vi.mock("@/app/components/McpContent", () => ({ default: marker("McpContent") }));
vi.mock("@/app/components/PrivacyContent", () => ({ default: marker("PrivacyContent") }));
vi.mock("@/app/components/ProjectContent", () => ({ default: marker("ProjectContent") }));
vi.mock("@/app/components/SecurityPolicyContent", () => ({ default: marker("SecurityPolicyContent") }));
vi.mock("@/app/components/TermsContent", () => ({ default: marker("TermsContent") }));
vi.mock("@/app/components/HatShContent", () => ({ default: marker("HatShContent") }));
vi.mock("@/app/components/NotFoundContent", () => ({ default: marker("NotFoundContent") }));
vi.mock("@/app/components/VsContent", () => ({
  default: ({ competitor }: { competitor: string }) => (
    <div data-content="VsContent" data-competitor={competitor} />
  ),
}));

interface PageModule {
  metadata: Metadata;
  default: () => React.ReactNode;
}

interface Route {
  /** Path after the origin, "" for the home page. */
  path: string;
  load: () => Promise<PageModule>;
  /** The content component the route must render. */
  content: string;
  /** `@type` of every JSON-LD block the route emits, in document order. */
  jsonLd: string[];
  /** Legal/doc pages opt out of indexing but keep links followed. */
  noIndex?: boolean;
  /** The home page renders its title verbatim, with no " | Zefer" suffix. */
  absoluteTitle?: boolean;
  /** Extra props the content component must receive. */
  competitor?: string;
}

const TITLE_SUFFIX = " | Zefer";

const routes: Route[] = [
  {
    path: "",
    load: () => import("@/app/page"),
    content: "HomeContent",
    jsonLd: ["FAQPage", "WebSite"],
    absoluteTitle: true,
  },
  {
    path: "/how",
    load: () => import("@/app/how/page"),
    content: "HowContent",
    jsonLd: ["BreadcrumbList", "FAQPage"],
  },
  {
    path: "/analyzer",
    load: () => import("@/app/analyzer/page"),
    content: "AnalyzerContent",
    jsonLd: ["BreadcrumbList", "FAQPage"],
  },
  {
    path: "/conduct",
    load: () => import("@/app/conduct/page"),
    content: "ConductContent",
    jsonLd: ["BreadcrumbList"],
    noIndex: true,
  },
  {
    path: "/device",
    load: () => import("@/app/device/page"),
    content: "DeviceContent",
    jsonLd: ["BreadcrumbList"],
  },
  {
    path: "/generator",
    load: () => import("@/app/generator/page"),
    content: "GeneratorContent",
    jsonLd: ["BreadcrumbList", "FAQPage"],
  },
  {
    path: "/install",
    load: () => import("@/app/install/page"),
    content: "InstallContent",
    jsonLd: ["BreadcrumbList"],
  },
  {
    path: "/install/guide",
    load: () => import("@/app/install/guide/page"),
    content: "GuideContent",
    jsonLd: ["BreadcrumbList"],
  },
  {
    path: "/library",
    load: () => import("@/app/library/page"),
    content: "LibraryContent",
    jsonLd: ["BreadcrumbList", "FAQPage"],
  },
  {
    path: "/mcp",
    load: () => import("@/app/mcp/page"),
    content: "McpContent",
    jsonLd: ["BreadcrumbList", "FAQPage"],
  },
  {
    path: "/privacy",
    load: () => import("@/app/privacy/page"),
    content: "PrivacyContent",
    jsonLd: [],
    noIndex: true,
  },
  {
    path: "/project",
    load: () => import("@/app/project/page"),
    content: "ProjectContent",
    jsonLd: ["BreadcrumbList"],
  },
  {
    path: "/security",
    load: () => import("@/app/security/page"),
    content: "SecurityPolicyContent",
    jsonLd: ["BreadcrumbList"],
    noIndex: true,
  },
  {
    path: "/terms",
    load: () => import("@/app/terms/page"),
    content: "TermsContent",
    jsonLd: [],
    noIndex: true,
  },
  {
    path: "/vs/hat-sh",
    load: () => import("@/app/vs/hat-sh/page"),
    content: "HatShContent",
    jsonLd: ["BreadcrumbList", "FAQPage"],
  },
  {
    path: "/vs/picocrypt",
    load: () => import("@/app/vs/picocrypt/page"),
    content: "VsContent",
    competitor: "picocrypt",
    jsonLd: ["BreadcrumbList", "FAQPage"],
  },
  {
    path: "/vs/bitwarden-send",
    load: () => import("@/app/vs/bitwarden-send/page"),
    content: "VsContent",
    competitor: "bitwarden",
    jsonLd: ["BreadcrumbList", "FAQPage"],
  },
  {
    path: "/vs/cryptomator",
    load: () => import("@/app/vs/cryptomator/page"),
    content: "VsContent",
    competitor: "cryptomator",
    jsonLd: ["BreadcrumbList", "FAQPage"],
  },
  {
    path: "/vs/veracrypt",
    load: () => import("@/app/vs/veracrypt/page"),
    content: "VsContent",
    competitor: "veracrypt",
    jsonLd: ["BreadcrumbList", "FAQPage"],
  },
];

/** The `<title>` a browser ends up showing, after the layout's template. */
function renderedTitle(route: Route, metadata: Metadata): string {
  const title = metadata.title;
  if (route.absoluteTitle) {
    expect(title).toEqual({ absolute: expect.any(String) });
    return (title as { absolute: string }).absolute;
  }
  expect(title).toEqual(expect.any(String));
  return `${title as string}${TITLE_SUFFIX}`;
}

function jsonLdBlocks(markup: string): Record<string, unknown>[] {
  const scripts = markup.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g);
  return [...scripts].map((match) => JSON.parse(match[1]) as Record<string, unknown>);
}

describe.each(routes)("route $path", (route) => {
  it("titles the page within the 40-60 character SEO window", async () => {
    const { metadata } = await route.load();
    const title = renderedTitle(route, metadata);
    expect(title.length).toBeGreaterThanOrEqual(40);
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it("describes the page within the 120-160 character SEO window", async () => {
    const { metadata } = await route.load();
    expect(metadata.description).toEqual(expect.any(String));
    expect(metadata.description!.length).toBeGreaterThanOrEqual(120);
    expect(metadata.description!.length).toBeLessThanOrEqual(160);
  });

  it("canonicalizes to its own absolute URL", async () => {
    const { metadata } = await route.load();
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}${route.path}`);
  });

  it("declares a complete Open Graph block with an explicit image", async () => {
    const { metadata } = await route.load();
    const og = metadata.openGraph as Record<string, unknown> | undefined;

    expect(og).toBeDefined();
    expect(og!.url).toBe(`${SITE_URL}${route.path}`);
    expect(og!.siteName).toBe("Zefer");
    expect(og!.locale).toBe("en_US");
    expect(og!.title).toEqual(expect.any(String));
    expect(og!.description).toEqual(expect.any(String));
    expect(og!.images).toEqual([
      { url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: expect.any(String) },
    ]);
  });

  it("declares a summary_large_image Twitter card with an explicit image", async () => {
    const { metadata } = await route.load();
    const twitter = metadata.twitter as Record<string, unknown> | undefined;

    expect(twitter).toBeDefined();
    expect(twitter!.card).toBe("summary_large_image");
    expect(twitter!.site).toBe("@carrilloapps");
    expect(twitter!.creator).toBe("@carrilloapps");
    expect(twitter!.title).toEqual(expect.any(String));
    expect(twitter!.description).toEqual(expect.any(String));
    expect(twitter!.images).toEqual([`${SITE_URL}/twitter-image`]);
  });

  it("opts out of indexing only when it is a legal or policy page", async () => {
    const { metadata } = await route.load();
    expect(metadata.robots).toEqual(route.noIndex ? { index: false, follow: true } : undefined);
  });

  it("renders its content component", async () => {
    const { default: Page } = await route.load();
    const markup = renderToStaticMarkup(<Page />);

    expect(markup).toContain(`data-content="${route.content}"`);
    if (route.competitor) expect(markup).toContain(`data-competitor="${route.competitor}"`);
  });

  it("emits well-formed structured data", async () => {
    const { default: Page } = await route.load();
    const blocks = jsonLdBlocks(renderToStaticMarkup(<Page />));

    expect(blocks.map((block) => block["@type"])).toEqual(route.jsonLd);
    for (const block of blocks) expect(block["@context"]).toBe("https://schema.org");
  });

  it("points its breadcrumb trail at its own URL", async () => {
    const { default: Page } = await route.load();
    const crumbs = jsonLdBlocks(renderToStaticMarkup(<Page />)).find(
      (block) => block["@type"] === "BreadcrumbList",
    );

    if (!route.jsonLd.includes("BreadcrumbList")) {
      expect(crumbs).toBeUndefined();
      return;
    }

    const items = crumbs!.itemListElement as { position: number; name: string; item: string }[];
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items[0]).toMatchObject({ position: 1, name: "Home", item: SITE_URL });
    expect(items.at(-1)!.item).toBe(`${SITE_URL}${route.path}`);
    expect(items.map((item) => item.position)).toEqual(items.map((_, index) => index + 1));
  });

  it("answers at least two questions when it ships an FAQ", async () => {
    const { default: Page } = await route.load();
    const faq = jsonLdBlocks(renderToStaticMarkup(<Page />)).find(
      (block) => block["@type"] === "FAQPage",
    );

    if (!route.jsonLd.includes("FAQPage")) {
      expect(faq).toBeUndefined();
      return;
    }

    const questions = faq!.mainEntity as {
      "@type": string;
      name: string;
      acceptedAnswer: { "@type": string; text: string };
    }[];

    expect(questions.length).toBeGreaterThanOrEqual(2);
    for (const question of questions) {
      expect(question["@type"]).toBe("Question");
      expect(question.name.length).toBeGreaterThan(0);
      expect(question.acceptedAnswer["@type"]).toBe("Answer");
      expect(question.acceptedAnswer.text.length).toBeGreaterThan(0);
    }
  });
});

describe("not-found", () => {
  it("is hidden from crawlers entirely", async () => {
    const { metadata } = await import("@/app/not-found");

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.title).toBe("Page Not Found");
    expect(metadata.description).toEqual(expect.any(String));
  });

  it("renders the 404 content", async () => {
    const { default: NotFound } = await import("@/app/not-found");

    expect(renderToStaticMarkup(<NotFound />)).toContain('data-content="NotFoundContent"');
  });
});

describe("home page structured data", () => {
  it("publishes a WebSite entity for the canonical origin", async () => {
    const { default: Home } = await import("@/app/page");
    const website = jsonLdBlocks(renderToStaticMarkup(<Home />)).find(
      (block) => block["@type"] === "WebSite",
    );

    expect(website).toMatchObject({
      name: "Zefer",
      url: SITE_URL,
      inLanguage: ["en", "es", "pt"],
      publisher: { "@type": "Person", name: "José Carrillo", url: "https://carrillo.app" },
    });
  });
});

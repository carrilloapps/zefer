import { describe, it, expect } from "vitest";
import { pageMetadata, SITE_URL } from "../seo";

describe("pageMetadata", () => {
  it("derives every field from title/description when nothing is overridden", () => {
    const meta = pageMetadata({
      path: "/how",
      title: "How it works",
      description: "Seven steps from plaintext to a password-protected .zefer file.",
    });

    expect(meta.title).toBe("How it works");
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/how`);
    expect(meta.keywords).toBeUndefined();
    expect(meta.robots).toBeUndefined();

    expect(meta.openGraph).toMatchObject({
      type: "website",
      locale: "en_US",
      alternateLocale: ["es_VE", "pt_BR"],
      url: `${SITE_URL}/how`,
      siteName: "Zefer",
      title: "How it works",
      description: "Seven steps from plaintext to a password-protected .zefer file.",
    });
    expect(meta.openGraph?.images).toEqual([
      { url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "How it works" },
    ]);

    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      site: "@carrilloapps",
      creator: "@carrilloapps",
      title: "How it works",
      description: "Seven steps from plaintext to a password-protected .zefer file.",
    });
    expect(meta.twitter?.images).toEqual([`${SITE_URL}/twitter-image`]);
  });

  it("honours every override and builds the home canonical from an empty path", () => {
    const meta = pageMetadata({
      path: "",
      title: "Zefer — client-side encryption",
      absoluteTitle: true,
      description: "Base description",
      keywords: ["encryption", "aes-256-gcm"],
      ogTitle: "OG title",
      ogDescription: "OG description",
      twitterTitle: "Twitter title",
      twitterDescription: "Twitter description",
      imageAlt: "Custom alt",
      index: false,
    });

    expect(meta.title).toEqual({ absolute: "Zefer — client-side encryption" });
    expect(meta.alternates?.canonical).toBe(SITE_URL);
    expect(meta.keywords).toEqual(["encryption", "aes-256-gcm"]);
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(meta.openGraph).toMatchObject({ title: "OG title", description: "OG description" });
    expect(meta.openGraph?.images).toEqual([
      { url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "Custom alt" },
    ]);
    expect(meta.twitter).toMatchObject({
      title: "Twitter title",
      description: "Twitter description",
    });
  });

  it("falls back from twitter to the Open Graph pair, not to the base pair", () => {
    const meta = pageMetadata({
      path: "/vs/hat-sh",
      title: "Base title",
      description: "Base description",
      ogTitle: "OG only",
      ogDescription: "OG description only",
      index: true,
    });

    expect(meta.twitter).toMatchObject({
      title: "OG only",
      description: "OG description only",
    });
    // imageAlt defaults to the OG title, not the base title.
    expect(meta.openGraph?.images).toEqual([
      { url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "OG only" },
    ]);
    // index: true is indexable, same as omitting it.
    expect(meta.robots).toBeUndefined();
  });
});

import type { Metadata } from "next";

/**
 * Centralized SEO metadata builder.
 *
 * Next.js shallowly merges the `metadata` export: when a page defines its own
 * `openGraph` or `twitter` object, it *replaces* the parent layout's object
 * entirely (it does NOT inherit `siteName`, `locale`, `site`, etc.). Every page
 * must therefore declare the full set itself. This helper guarantees that every
 * route ships a complete, consistent set of Open Graph and Twitter tags so no
 * page silently loses og:site_name / og:locale / twitter:site again.
 */

export const SITE_URL = "https://zefer.carrillo.app";
const TWITTER_HANDLE = "@carrilloapps";
const OG_IMAGE = { url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630 };
const TWITTER_IMAGE = `${SITE_URL}/twitter-image`;

export interface PageSeo {
  /** Path after the origin: "" for home, "/how", "/vs/hat-sh", … */
  path: string;
  /** Base <title>. Gets " | Zefer" appended via the layout template unless `absoluteTitle`. */
  title: string;
  /** When true, render the title verbatim (no " | Zefer" suffix). Use for the home page. */
  absoluteTitle?: boolean;
  description: string;
  keywords?: string[];
  /** Open Graph title — defaults to `title`. */
  ogTitle?: string;
  /** Open Graph description — defaults to `description`. */
  ogDescription?: string;
  /** Twitter title — defaults to `ogTitle`/`title`. */
  twitterTitle?: string;
  /** Twitter description — defaults to `ogDescription`/`description`. */
  twitterDescription?: string;
  /** Alt text for the social image — defaults to the OG title. */
  imageAlt?: string;
  /** Set to false for legal/doc pages that should not be indexed (links still followed). */
  index?: boolean;
}

export function pageMetadata(input: PageSeo): Metadata {
  const url = `${SITE_URL}${input.path}`;
  const ogTitle = input.ogTitle ?? input.title;
  const ogDescription = input.ogDescription ?? input.description;
  const imageAlt = input.imageAlt ?? ogTitle;
  const indexable = input.index !== false;

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    ...(input.keywords ? { keywords: input.keywords } : {}),
    alternates: { canonical: url },
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: ["es_VE", "pt_BR"],
      url,
      siteName: "Zefer",
      title: ogTitle,
      description: ogDescription,
      images: [{ ...OG_IMAGE, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: input.twitterTitle ?? ogTitle,
      description: input.twitterDescription ?? ogDescription,
      images: [TWITTER_IMAGE],
    },
  };
}

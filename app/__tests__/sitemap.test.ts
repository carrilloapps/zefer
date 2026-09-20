import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import sitemap from "@/app/sitemap";

const APP_DIR = path.resolve(__dirname, "..");
const BASE_URL = "https://zefer.carrillo.app";

/**
 * Routes that are published but are not App Router pages, so they have no
 * `page.tsx` to discover on disk.
 */
const NON_PAGE_ROUTES = ["/llms.txt"];

/** Every directory under `app/` that renders a page, as a route path. */
function discoverRoutes(dir: string, prefix = ""): string[] {
  const routes: string[] = [];

  for (const entry of readdirSync(dir)) {
    // Route groups, private folders and the API surface are never pages.
    if (entry.startsWith("_") || entry.startsWith("(") || entry === "api") continue;

    const full = path.join(dir, entry);
    if (!statSync(full).isDirectory()) continue;

    const route = `${prefix}/${entry}`;
    if (hasPage(full)) routes.push(route);
    routes.push(...discoverRoutes(full, route));
  }

  return routes;
}

function hasPage(dir: string): boolean {
  return readdirSync(dir).includes("page.tsx");
}

/** A page opts out of indexing with `index: false` in its exported metadata. */
function isNoIndex(route: string): boolean {
  const file = path.join(APP_DIR, route, "page.tsx");
  return /index:\s*false/.test(readFileSync(file, "utf8"));
}

const entries = sitemap();
const urls = entries.map((entry) => entry.url);
const paths = urls.map((url) => url.replace(BASE_URL, "") || "/");

const routes = [...(hasPage(APP_DIR) ? ["/"] : []), ...discoverRoutes(APP_DIR)];
const indexable = routes.filter((route) => route === "/" || !isNoIndex(route));
const excluded = routes.filter((route) => route !== "/" && isNoIndex(route));

describe("sitemap", () => {
  it("lists every indexable route", () => {
    expect(paths).toEqual(expect.arrayContaining(indexable));
  });

  it("omits routes that opt out of indexing", () => {
    for (const route of excluded) expect(paths).not.toContain(route);
  });

  it("lists no route that does not exist", () => {
    const known = new Set([...routes, ...NON_PAGE_ROUTES]);
    for (const route of paths) expect(known).toContain(route);
  });

  it("has no duplicate entries", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("uses the canonical absolute origin for every entry", () => {
    for (const url of urls) {
      expect(url.startsWith(`${BASE_URL}/`) || url === BASE_URL).toBe(true);
      expect(url).not.toMatch(/\/$/);
    }
  });

  it("dates every entry", () => {
    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(Number.isNaN(new Date(entry.lastModified as Date).getTime())).toBe(false);
    }
  });
});

// OpenGraph / SEO compliance audit over the prerendered HTML.
// Mirrors the checks opengraph.to (opengraph-mcp) reports: score, issues, tags.
import { readFileSync, existsSync } from "node:fs";

const pages = [
  "index", "how", "generator", "analyzer", "mcp", "library", "device",
  "install", "install/guide", "project", "privacy", "terms", "security",
  "conduct", "vs/hat-sh", "vs/picocrypt", "vs/bitwarden-send",
  "vs/cryptomator", "vs/veracrypt",
];

const get = (h, re) => { const m = h.match(re); return m ? m[1] : null; };
const has = (h, re) => re.test(h);

function audit(p) {
  const fp = `.next/server/app/${p}.html`;
  if (!existsSync(fp)) return { p, missing: true };
  const h = readFileSync(fp, "utf8");
  const title = get(h, /<title>([^<]*)<\/title>/);
  const desc = get(h, /<meta name="description" content="([^"]*)"/);
  const checks = {
    title: !!title,
    titleLen: title ? title.length >= 30 && title.length <= 60 : false,
    description: !!desc,
    descLen: desc ? desc.length >= 110 && desc.length <= 160 : false,
    canonical: has(h, /<link rel="canonical"/),
    faviconIcoOrPng: has(h, /rel="icon"[^>]*favicon\.ico/) || has(h, /rel="icon"[^>]*\.png/),
    h1: (h.match(/<h1[^>]*>/g) || []).length === 1,
    "og:title": has(h, /property="og:title"/),
    "og:description": has(h, /property="og:description"/),
    "og:type": has(h, /property="og:type"/),
    "og:url": has(h, /property="og:url"/),
    "og:image": has(h, /property="og:image"/),
    "og:image:alt": has(h, /property="og:image:alt"/),
    "og:site_name": has(h, /property="og:site_name"/),
    "og:locale": has(h, /property="og:locale"/),
    "twitter:card": has(h, /name="twitter:card"/),
    "twitter:title": has(h, /name="twitter:title"/),
    "twitter:description": has(h, /name="twitter:description"/),
    "twitter:image": has(h, /name="twitter:image"/),
    "twitter:site": has(h, /name="twitter:site"/),
    "twitter:creator": has(h, /name="twitter:creator"/),
  };
  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(Boolean).length;
  const fails = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  return { p, score: Math.round((passed / total) * 100), passed, total, fails, titleLen: title?.length, descLen: desc?.length };
}

const results = pages.map(audit);
let sum = 0, n = 0;
for (const r of results) {
  if (r.missing) { console.log(`MISSING  /${r.p}`); continue; }
  sum += r.score; n++;
  const flag = r.fails.length ? `  ⚠ ${r.fails.join(", ")}` : "  ✓ all pass";
  console.log(`${String(r.score).padStart(3)}/100  /${r.p.replace("index", "")}  (T:${r.titleLen} D:${r.descLen})${flag}`);
}
console.log(`\nAVERAGE: ${(sum / n).toFixed(1)}/100 across ${n} pages`);

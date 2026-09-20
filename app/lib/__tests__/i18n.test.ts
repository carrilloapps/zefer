import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { LOCALES, t, type Locale, type TranslationKey } from "../i18n";

/**
 * `translations` is module-private, so the parity invariant is checked against
 * the source of truth: the file itself. Every entry is sliced out by key, then
 * each locale's literal is read back and compared to what `t()` returns.
 */
const FULL_SOURCE = readFileSync(path.resolve(import.meta.dirname, "../i18n.ts"), "utf8");
const END = FULL_SOURCE.indexOf("} as const;");
const SOURCE = FULL_SOURCE.slice(0, END);

const KEY_RE = /^\s*"([^"]+)":\s*\{/gm;

interface Entry {
  key: string;
  body: string;
}

const entries: Entry[] = (() => {
  const starts: { key: string; open: number; at: number }[] = [];
  for (const m of SOURCE.matchAll(KEY_RE)) {
    starts.push({ key: m[1], open: m.index, at: m.index + m[0].length });
  }
  return starts.map(({ key, at }, i) => ({
    key,
    body: SOURCE.slice(at, i + 1 < starts.length ? starts[i + 1].open : SOURCE.length),
  }));
})();

/**
 * String literals are consumed as whole tokens first, so an `en:` that happens
 * to live *inside* a translation ("Expira en:") is never mistaken for a key.
 */
const TOKEN_RE = /"(?:[^"\\]|\\.)*"|([a-z]{2})\s*:/g;

function localeStrings(body: string): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {};
  let pending: string | null = null;
  for (const m of body.matchAll(TOKEN_RE)) {
    if (m[1]) {
      pending = m[1];
    } else if (pending) {
      out[pending as Locale] = JSON.parse(m[0]) as string;
      pending = null;
    }
  }
  return out;
}

const parsed = new Map(entries.map((e) => [e, localeStrings(e.body)] as const));

/** Reads a locale's string literal out of an entry body, unescaping it. */
function literal(entry: Entry, locale: Locale): string | undefined {
  return parsed.get(entry)?.[locale];
}

describe("i18n translations", () => {
  it("parses a plausible number of entries from the source", () => {
    expect(entries.length).toBeGreaterThan(500);
  });

  it("defines es, en and pt for every key — identical key sets", () => {
    const missing: string[] = [];
    const extra: string[] = [];
    for (const entry of entries) {
      const strings = parsed.get(entry)!;
      for (const locale of ["es", "en", "pt"] as const) {
        if (strings[locale] === undefined) missing.push(`${entry.key}.${locale}`);
      }
      for (const found of Object.keys(strings)) {
        if (!["es", "en", "pt"].includes(found)) extra.push(`${entry.key}.${found}`);
      }
    }
    expect(missing).toEqual([]);
    expect(extra).toEqual([]);
  });

  it("has no duplicate keys", () => {
    const seen = new Set<string>();
    const dupes = entries.filter(({ key }) => (seen.has(key) ? true : (seen.add(key), false)));
    expect(dupes.map((d) => d.key)).toEqual([]);
  });

  it("returns the declared string for every key in every locale", () => {
    const mismatches: string[] = [];
    for (const entry of entries) {
      for (const locale of ["es", "en", "pt"] as const) {
        if (t(entry.key as TranslationKey, locale) !== literal(entry, locale)) {
          mismatches.push(`${entry.key}.${locale}`);
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  it("never leaves a translation blank", () => {
    const blanks = entries.filter((entry) =>
      (["es", "en", "pt"] as const).some((l) => literal(entry, l)?.trim() === ""),
    );
    expect(blanks.map((b) => b.key)).toEqual([]);
  });
});

describe("t", () => {
  it("resolves a known key per locale", () => {
    expect(t("nav.project", "es")).toBe("Proyecto");
    expect(t("nav.project", "en")).toBe("Project");
    expect(t("nav.project", "pt")).toBe("Projeto");
  });

  it("falls back to English for an unknown locale", () => {
    expect(t("nav.project", "fr" as Locale)).toBe("Project");
  });

  it("returns the key itself when the key is unknown", () => {
    expect(t("does.not.exist" as TranslationKey, "es")).toBe("does.not.exist");
  });
});

describe("LOCALES", () => {
  it("lists exactly the three supported locales with a label and flag", () => {
    expect(LOCALES.map((l) => l.code)).toEqual(["es", "en", "pt"]);
    for (const locale of LOCALES) {
      expect(locale.label).toBeTruthy();
      expect(locale.flag).toMatch(/^[A-Z]{2}$/);
    }
  });
});

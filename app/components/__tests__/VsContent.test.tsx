/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import VsContent from "../VsContent";
import { t, type TranslationKey } from "@/app/lib/i18n";

/** Every competitor the five /vs/* routes hand to this component. */
const VARIANTS = ["picocrypt", "bitwarden", "cryptomator", "veracrypt"] as const;

/** What each variant is expected to render — the page-level contract. */
const EXPECTED: Record<
  (typeof VARIANTS)[number],
  {
    titleKey: TranslationKey;
    subtitleKey: TranslationKey;
    tldrKey: TranslationKey;
    otherName: string;
    rows: number;
    specs: TranslationKey[];
    sectionTitles: TranslationKey[];
    otherChooseKey: TranslationKey;
    otherForKeys: TranslationKey[];
    links: string[];
  }
> = {
  picocrypt: {
    titleKey: "vs.pico.title",
    subtitleKey: "vs.pico.subtitle",
    tldrKey: "vs.pico.tldr",
    otherName: "Picocrypt",
    rows: 15,
    specs: ["vs.pico.spec.1", "vs.pico.spec.2", "vs.pico.spec.3", "vs.pico.spec.4"],
    sectionTitles: ["vs.section.encryption", "vs.pico.section.platform", "vs.section.access"],
    otherChooseKey: "vs.pico.choose",
    otherForKeys: ["vs.pico.for.1", "vs.pico.for.2", "vs.pico.for.3"],
    links: ["https://github.com/Picocrypt/Picocrypt"],
  },
  bitwarden: {
    titleKey: "vs.bw.title",
    subtitleKey: "vs.bw.subtitle",
    tldrKey: "vs.bw.tldr",
    otherName: "Bitwarden Send",
    rows: 14,
    specs: ["vs.bw.spec.1", "vs.bw.spec.2", "vs.bw.spec.3", "vs.bw.spec.4"],
    sectionTitles: ["vs.bw.section.account", "vs.section.access", "vs.bw.section.pricing"],
    otherChooseKey: "vs.bw.choose",
    otherForKeys: ["vs.bw.for.1", "vs.bw.for.2", "vs.bw.for.3"],
    links: ["https://bitwarden.com/products/send/"],
  },
  cryptomator: {
    titleKey: "vs.cm.title",
    subtitleKey: "vs.cm.subtitle",
    tldrKey: "vs.cm.tldr",
    otherName: "Cryptomator",
    rows: 13,
    specs: ["vs.cm.spec.1", "vs.cm.spec.2", "vs.cm.spec.3", "vs.cm.spec.4"],
    sectionTitles: ["vs.cm.section.model", "vs.cm.section.cloud", "vs.section.ux"],
    otherChooseKey: "vs.cm.choose",
    otherForKeys: ["vs.cm.for.1", "vs.cm.for.2", "vs.cm.for.3"],
    links: ["https://cryptomator.org", "https://github.com/cryptomator/cryptomator"],
  },
  veracrypt: {
    titleKey: "vs.vc.title",
    subtitleKey: "vs.vc.subtitle",
    tldrKey: "vs.vc.tldr",
    otherName: "VeraCrypt",
    rows: 12,
    specs: ["vs.vc.spec.1", "vs.vc.spec.2", "vs.vc.spec.3", "vs.vc.spec.4"],
    sectionTitles: ["vs.vc.section.scope", "vs.vc.section.threat", "vs.section.ux"],
    otherChooseKey: "vs.vc.choose",
    otherForKeys: ["vs.vc.for.1", "vs.vc.for.2", "vs.vc.for.3"],
    links: ["https://veracrypt.fr", "https://github.com/veracrypt/VeraCrypt"],
  },
};

function renderVariant(competitor: (typeof VARIANTS)[number]) {
  return render(
    <LanguageProvider>
      <VsContent competitor={competitor} />
    </LanguageProvider>
  );
}

describe.each(VARIANTS)("VsContent — %s", (competitor) => {
  const exp = EXPECTED[competitor];

  it("renders the hero, the TL;DR and the competitor name derived from the title", () => {
    renderVariant(competitor);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(t(exp.titleKey, "en"));
    expect(screen.getByText(t(exp.subtitleKey, "en"))).toBeInTheDocument();
    expect(screen.getByText(t(exp.tldrKey, "en"))).toBeInTheDocument();
    // "Zefer vs <Name>" is split on " vs " for the spec card and the table header.
    expect(screen.getAllByText(exp.otherName).length).toBeGreaterThanOrEqual(1);
  });

  it("keeps one h1 and no heading below h2", () => {
    renderVariant(competitor);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
  });

  it("lists this competitor's spec bullets", () => {
    renderVariant(competitor);
    for (const k of exp.specs) expect(screen.getByText(t(k, "en"))).toBeInTheDocument();
    // Zefer's own spec card is shared across all variants.
    expect(screen.getByText(t("vs.zefer.mcp", "en"))).toBeInTheDocument();
    expect(screen.getByText("AES-256-GCM")).toBeInTheDocument();
  });

  it("renders the feature table with a verdict per side", () => {
    renderVariant(competitor);
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(exp.rows + 1);
    const head = within(rows[0]).getAllByRole("columnheader").map((c) => c.textContent);
    expect(head).toEqual([t("vs.feature", "en"), "Zefer", exp.otherName]);
    expect(table.querySelectorAll("tbody td.text-center svg")).toHaveLength(exp.rows * 2);
  });

  it("renders the detailed sections and the audience columns", () => {
    renderVariant(competitor);
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    for (const k of exp.sectionTitles) expect(h2s).toContain(t(k, "en"));
    expect(h2s).toContain(t("vs.choose.zefer", "en"));
    expect(h2s).toContain(t(exp.otherChooseKey, "en"));
    for (const k of exp.otherForKeys) expect(screen.getByText(t(k, "en"))).toBeInTheDocument();
    for (const k of ["vs.zefer.for.1", "vs.zefer.for.2", "vs.zefer.for.3", "vs.zefer.for.4"] as const) {
      expect(screen.getByText(t(k, "en"))).toBeInTheDocument();
    }
  });

  it("renders every outbound link safely plus the CTA back home", () => {
    renderVariant(competitor);
    for (const url of exp.links) {
      const link = screen.getByRole("link", { name: (_n, el) => el.getAttribute("href") === url });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(screen.getByRole("link", { name: new RegExp(t("vs.cta.button", "en")) })).toHaveAttribute("href", "/");
  });
});

describe("VsContent verdict marks", () => {
  it("paints supported, missing and partial states distinctly", () => {
    // picocrypt is the only variant with a "partial" on the Zefer side (offline).
    const { unmount } = renderVariant("picocrypt");
    const pico = screen.getByRole("table");
    expect(pico.querySelectorAll('tbody td.text-center svg[class*="--warning-text"]')).toHaveLength(1);
    expect(pico.querySelectorAll("tbody td.text-center svg.theme-faint").length).toBeGreaterThan(0);
    expect(pico.querySelectorAll("tbody td.text-center svg.text-primary").length).toBeGreaterThan(0);
    unmount();

    // bitwarden carries two "partial" marks on the competitor side (free, mcp)
    // plus one on password tools.
    renderVariant("bitwarden");
    const bw = screen.getByRole("table");
    expect(bw.querySelectorAll('tbody td.text-center svg[class*="--warning-text"]')).toHaveLength(3);
  });

  it("marks a feature Zefer lacks as missing on the Zefer side", () => {
    renderVariant("veracrypt");
    const row = screen.getByText(t("vs.feat.fulldisk", "en")).closest("tr");
    expect(row).not.toBeNull();
    const cells = within(row as HTMLTableRowElement).getAllByRole("cell");
    expect(cells[1].querySelector("svg")).toHaveClass("theme-faint");
    expect(cells[2].querySelector("svg")).toHaveClass("text-primary");
  });
});

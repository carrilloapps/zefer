/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import HatShContent from "../HatShContent";
import { t } from "@/app/lib/i18n";

function renderPage() {
  return render(
    <LanguageProvider>
      <HatShContent />
    </LanguageProvider>
  );
}

describe("HatShContent", () => {
  it("renders the comparison hero from i18n", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(t("vs.hatsh.title", "en"));
    expect(screen.getByText(t("vs.hatsh.subtitle", "en"))).toBeInTheDocument();
    expect(screen.getByText(t("vs.hatsh.tldr", "en"))).toBeInTheDocument();
  });

  it("keeps a single h1 and puts every section under h2 (descending hierarchy)", () => {
    renderPage();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2s).toContain("Zefer");
    expect(h2s).toContain("Hat.sh");
    expect(h2s).toContain(t("vs.section.encryption", "en"));
    expect(h2s).toContain(t("vs.section.pubkey", "en"));
  });

  it("renders one comparison row per feature with a verdict for each side", () => {
    renderPage();
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    // 1 header row + 16 feature rows
    expect(rows).toHaveLength(17);
    const head = within(rows[0]).getAllByRole("columnheader").map((c) => c.textContent);
    expect(head).toEqual([t("vs.feature", "en"), "Zefer", "Hat.sh"]);
    for (const row of rows.slice(1)) {
      expect(within(row).getAllByRole("cell")).toHaveLength(3);
    }
  });

  it("paints the three verdict states: supported, missing and partial", () => {
    const { container } = renderPage();
    const table = screen.getByRole("table");
    // Zefer supports 14 features fully, lacks public-key, and is partial on i18n.
    expect(within(table).getByText(t("vs.feat.pubkey", "en"))).toBeInTheDocument();
    expect(within(table).getByText(t("vs.feat.i18n", "en"))).toBeInTheDocument();
    // 2 verdict columns x 16 rows = 32 verdict icons, all three states present.
    const verdicts = table.querySelectorAll("tbody td.text-center svg");
    expect(verdicts).toHaveLength(32);
    // "no" → 11 missing marks (1 on the Zefer side, 10 on Hat.sh's)
    expect(table.querySelectorAll("tbody td.text-center svg.theme-faint")).toHaveLength(11);
    // "partial" → exactly one amber mark (i18n coverage)
    expect(table.querySelectorAll('tbody td.text-center svg[class*="--warning-text"]')).toHaveLength(1);
    // "yes" → the remaining marks
    expect(container.querySelectorAll("tbody td.text-center svg.text-primary")).toHaveLength(20);
  });

  it("lists the audience bullets for both tools", () => {
    renderPage();
    for (const k of ["vs.zefer.for.1", "vs.zefer.for.2", "vs.zefer.for.3", "vs.zefer.for.4"] as const) {
      expect(screen.getByText(t(k, "en"))).toBeInTheDocument();
    }
    for (const k of ["vs.hatsh.for.1", "vs.hatsh.for.2", "vs.hatsh.for.3"] as const) {
      expect(screen.getByText(t(k, "en"))).toBeInTheDocument();
    }
  });

  it("links out safely and back to the encrypt flow", () => {
    renderPage();
    const site = screen.getByRole("link", { name: "hat.sh" });
    expect(site).toHaveAttribute("href", "https://hat.sh");
    expect(site).toHaveAttribute("rel", "noopener noreferrer");
    expect(site).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: t("vs.hatsh.repo", "en") })).toHaveAttribute(
      "href",
      "https://github.com/sh-dv/hat.sh"
    );
    expect(screen.getByRole("link", { name: new RegExp(t("vs.cta.button", "en")) })).toHaveAttribute("href", "/");
  });
});

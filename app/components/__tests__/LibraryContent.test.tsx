/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import LibraryContent from "../LibraryContent";
import { t } from "@/app/lib/i18n";

function renderPage() {
  return render(
    <LanguageProvider>
      <LibraryContent />
    </LanguageProvider>
  );
}

describe("LibraryContent", () => {
  it("renders the hero and the requirement note from i18n", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(t("lib.title", "en"));
    expect(screen.getByText(t("lib.subtitle", "en"))).toBeInTheDocument();
    expect(screen.getByText(t("lib.what.desc", "en"))).toBeInTheDocument();
    expect(screen.getByText(t("lib.req", "en"))).toBeInTheDocument();
  });

  it("keeps the heading hierarchy descending (h1 → h2 → h3)", () => {
    renderPage();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2s).toEqual([
      t("lib.what.title", "en"),
      t("lib.install.title", "en"),
      t("lib.api.title", "en"),
      t("lib.examples.title", "en"),
      t("lib.notes.title", "en"),
    ]);
    // The only h3 sits inside the install section, after its h2.
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      t("lib.import.title", "en"),
    ]);
  });

  it("shows the install command and both module-system imports", () => {
    renderPage();
    const blocks = document.querySelectorAll(".code-block code");
    const joined = Array.from(blocks, (b) => b.textContent).join("\n");
    expect(joined).toContain("npm install zefer-cli");
    expect(joined).toContain('import { encodeZefer, decodeZefer, generateWithOptions, analyzePassword } from "zefer-cli";');
    expect(joined).toContain('const { encodeZefer, analyzePassword } = require("zefer-cli");');
  });

  it("documents all four exported API signatures with their descriptions", () => {
    renderPage();
    const sigs = [
      "encodeZefer(options) → Promise<Buffer>",
      "decodeZefer(input, passphrase, options) → Promise<{ ok, payload }>",
      "generateWithOptions(mode, length, options) → string",
      "analyzePassword(password) → report",
    ];
    for (const sig of sigs) expect(screen.getByText(sig)).toBeInTheDocument();
    for (const k of ["lib.api.encode.desc", "lib.api.decode.desc", "lib.api.keygen.desc", "lib.api.analyze.desc"] as const) {
      expect(screen.getByText(t(k, "en"))).toBeInTheDocument();
    }
    // Only the rows after the first carry a separator border.
    const rows = document.querySelectorAll(".py-3\\.5");
    expect(rows).toHaveLength(4);
    expect(rows[0].className).toContain("pt-0");
    expect(rows[1].className).toContain("border-t");
  });

  it("renders the three runnable examples", () => {
    renderPage();
    for (const k of ["lib.example.encrypt", "lib.example.decrypt", "lib.example.keygen"] as const) {
      expect(screen.getByText(t(k, "en"))).toBeInTheDocument();
    }
    const joined = Array.from(document.querySelectorAll(".code-block code"), (b) => b.textContent).join("\n");
    expect(joined).toContain('await writeFile("secret.zefer", buf);');
    expect(joined).toContain("if (res.ok) console.log(res.payload.content);");
    expect(joined).toContain('generateWithOptions("base58", 24, { groupSize: 6 })');
  });

  it("lists every caveat note", () => {
    renderPage();
    expect(screen.getByText(t("lib.notes.1", "en"))).toBeInTheDocument();
    expect(screen.getByText(t("lib.notes.2", "en"))).toBeInTheDocument();
    // notes.3 appears twice: in the list and again above the CTAs.
    expect(screen.getAllByText(t("lib.notes.3", "en"))).toHaveLength(2);
  });

  it("links to the docs, npm and the repo, all opened safely", () => {
    renderPage();
    const expected: [string, string][] = [
      [t("lib.cta.docs", "en"), "https://github.com/carrilloapps/zefer-cli/blob/main/docs/LIBRARY.md"],
      [t("lib.cta.npm", "en"), "https://www.npmjs.com/package/zefer-cli"],
      [t("lib.cta.repo", "en"), "https://github.com/carrilloapps/zefer-cli"],
    ];
    for (const [name, href] of expected) {
      const link = screen.getByRole("link", { name: new RegExp(name) });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});

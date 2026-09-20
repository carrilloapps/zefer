/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { render, within } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import ConductContent from "../ConductContent";

function renderConduct() {
  return render(<LanguageProvider><ConductContent /></LanguageProvider>).container;
}

/** The page body, excluding the shared Navbar/Footer chrome. */
function body(container: HTMLElement): HTMLElement {
  const section = container.querySelector("main > section");
  if (!section) throw new Error("page section not found");
  return section as HTMLElement;
}

describe("ConductContent", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Contributor Covenant title and subtitle once, as the page h1", () => {
    const container = renderConduct();
    const scope = within(body(container));

    expect(scope.getByRole("heading", { level: 1, name: "Code of Conduct" })).toBeInTheDocument();
    expect(scope.getByText(/Our commitment to an open, welcoming, and inclusive community/)).toBeInTheDocument();
  });

  it("links out to the CODE_OF_CONDUCT.md source safely", () => {
    const container = renderConduct();
    const link = within(body(container)).getByRole("link", { name: /View on GitHub/i });

    expect(link).toHaveAttribute("href", "https://github.com/carrilloapps/zefer/blob/main/CODE_OF_CONDUCT.md");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("lists five positive and five unacceptable behaviours", () => {
    const container = renderConduct();
    const scope = within(body(container));

    const positive = scope.getByRole("heading", { level: 2, name: "Positive behavior" });
    const negative = scope.getByRole("heading", { level: 2, name: "Unacceptable behavior" });

    expect(positive.parentElement?.querySelectorAll("li")).toHaveLength(5);
    expect(negative.parentElement?.querySelectorAll("li")).toHaveLength(5);
    expect(scope.getByText("Using welcoming and inclusive language")).toBeInTheDocument();
    expect(scope.getByText("Trolling, insulting or derogatory comments")).toBeInTheDocument();
  });

  it("numbers the four enforcement levels and labels impact and consequence", () => {
    const container = renderConduct();
    const scope = within(body(container));

    const levels = scope.getAllByRole("heading", { level: 3 });
    expect(levels.map((h) => h.textContent)).toEqual([
      "1. Correction",
      "2. Warning",
      "3. Temporary Ban",
      "4. Permanent Ban",
    ]);
    expect(scope.getAllByText("Impact:")).toHaveLength(4);
    expect(scope.getAllByText("Consequence:")).toHaveLength(4);
  });

  it("offers GitHub and Telegram as reporting channels and no email", () => {
    const container = renderConduct();
    const scope = within(body(container));
    const handles = scope.getAllByRole("link", { name: "@carrilloapps" });

    expect(handles.map((a) => a.getAttribute("href"))).toEqual([
      "https://github.com/carrilloapps",
      "https://t.me/carrilloapps",
    ]);
    expect(container.innerHTML).not.toContain("mailto:");
  });

  it("keeps a strict h1 → h2 → h3 heading order", () => {
    const container = renderConduct();
    const levels = Array.from(body(container).querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) =>
      Number(h.tagName[1])
    );

    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });

  it("credits the Contributor Covenant", () => {
    const container = renderConduct();
    expect(body(container).textContent).toContain("Contributor Covenant");
  });
});

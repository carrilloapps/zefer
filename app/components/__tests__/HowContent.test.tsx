/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { render, within } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import HowContent from "../HowContent";

function renderHow() {
  const { container } = render(<LanguageProvider><HowContent /></LanguageProvider>);
  const section = container.querySelector("main > section");
  if (!section) throw new Error("page section not found");
  return { container, section: section as HTMLElement, scope: within(section as HTMLElement) };
}

/** The card a heading belongs to. */
function cardOf(heading: HTMLElement): HTMLElement {
  const card = heading.closest("div.glass");
  if (!card) throw new Error(`no card around "${heading.textContent}"`);
  return card as HTMLElement;
}

describe("HowContent", () => {
  it("renders the page header and the client-side overview", () => {
    const { scope } = renderHow();

    expect(scope.getByRole("heading", { level: 1, name: "How it works" })).toBeInTheDocument();
    expect(scope.getByText("HOW IT WORKS")).toBeInTheDocument();
    expect(scope.getByRole("heading", { level: 2, name: "Overview" })).toBeInTheDocument();
    expect(scope.getByText(/100% client-side tool/)).toBeInTheDocument();
  });

  it("numbers the seven steps 01..07 and connects all but the last", () => {
    const { section, scope } = renderHow();

    const badges = Array.from(section.querySelectorAll("span.absolute")).map((s) => s.textContent);
    expect(badges).toEqual(["01", "02", "03", "04", "05", "06", "07"]);

    // One dashed connector between consecutive steps, none after the last.
    expect(section.querySelectorAll(".border-dashed")).toHaveLength(badges.length - 1);
    expect(scope.getByRole("heading", { level: 3, name: "Step 1: Content input" })).toBeInTheDocument();
  });

  it("lists the five advanced security options", () => {
    const { scope } = renderHow();
    const card = cardOf(scope.getByRole("heading", { level: 2, name: "Advanced security options" }));

    expect(card.querySelectorAll(".glass-hover")).toHaveLength(5);
    expect(within(card).getByRole("heading", { level: 3, name: "Configurable security level" })).toBeInTheDocument();
  });

  it("publishes the twelve technical specifications with their values", () => {
    const { scope } = renderHow();
    const card = cardOf(scope.getByRole("heading", { level: 2, name: "Technical specifications" }));
    const rows = Array.from(card.querySelectorAll(".border-b"));

    expect(rows).toHaveLength(12);
    expect(rows[0].textContent).toBe("Encryption algorithmAES-256-GCM");
    expect(card.textContent).toContain("PBKDF2-SHA256");
    expect(card.textContent).toContain("32 bytes (256 bits)");
    expect(card.textContent).toContain("None (100% client-side)");
  });

  it("explains the six password-generation guarantees in order and links to the lab", () => {
    const { scope } = renderHow();
    const card = cardOf(scope.getByRole("heading", { level: 2, name: "How passwords are generated" }));

    const badges = Array.from(card.querySelectorAll("span.font-mono")).map((s) => s.textContent);
    expect(badges).toEqual(["01", "02", "03", "04", "05", "06"]);
    expect(within(card).getByRole("heading", { level: 3, name: "Cryptographic randomness (CSPRNG)" })).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: /Advanced password generator/ })).toHaveAttribute("href", "/generator");
  });

  it("links the four delivery channels to their own pages", () => {
    const { scope } = renderHow();
    const card = cardOf(scope.getByRole("heading", { level: 2, name: "Use Zefer your way" }));

    const links = within(card).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/", "/install", "/mcp", "/library"]);
    expect(links.map((a) => a.querySelector("h3")?.textContent?.trim())).toEqual([
      "Web app",
      "Command line",
      "MCP server",
      "Node.js library",
    ]);
  });

  it("closes with a call to action pointing home", () => {
    const { scope } = renderHow();

    expect(scope.getByRole("heading", { level: 2, name: "Try it now" })).toBeInTheDocument();
    expect(scope.getByText("Create your first encrypted .zefer file in seconds.")).toBeInTheDocument();
    const cta = scope.getByRole("link", { name: /Try it now/ });
    expect(cta).toHaveAttribute("href", "/");
    expect(cta).toHaveClass("btn-primary");
  });

  it("keeps a strict h1 → h2 → h3 heading order", () => {
    const { section } = renderHow();
    const levels = Array.from(section.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => Number(h.tagName[1]));

    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });
});

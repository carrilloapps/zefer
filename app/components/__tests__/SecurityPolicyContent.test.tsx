/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { render, within } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import SecurityPolicyContent from "../SecurityPolicyContent";

function renderPolicy() {
  const { container } = render(<LanguageProvider><SecurityPolicyContent /></LanguageProvider>);
  const section = container.querySelector("main > section");
  if (!section) throw new Error("page section not found");
  return { container, section: section as HTMLElement, scope: within(section as HTMLElement) };
}

describe("SecurityPolicyContent", () => {
  it("renders the policy heading and subtitle", () => {
    const { scope } = renderPolicy();

    expect(scope.getByRole("heading", { level: 1, name: "Security Policy" })).toBeInTheDocument();
    expect(scope.getByText(/How to report vulnerabilities and our security architecture/)).toBeInTheDocument();
  });

  it("links to SECURITY.md and to the advisory form, both safely", () => {
    const { scope } = renderPolicy();

    const source = scope.getByRole("link", { name: /View on GitHub/ });
    expect(source).toHaveAttribute("href", "https://github.com/carrilloapps/zefer/blob/main/SECURITY.md");

    const advisory = scope.getByRole("link", { name: "Report a vulnerability" });
    expect(advisory).toHaveAttribute("href", "https://github.com/carrilloapps/zefer/security/advisories/new");

    for (const link of [source, advisory]) {
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveAttribute("target", "_blank");
    }
  });

  it("offers Telegram as the private channel and exposes no email", () => {
    const { container, scope } = renderPolicy();

    expect(scope.getByRole("link", { name: "@carrilloapps" })).toHaveAttribute("href", "https://t.me/carrilloapps");
    expect(container.innerHTML).not.toContain("mailto:");
  });

  it("lists five things to include in a report", () => {
    const { scope } = renderPolicy();
    const heading = scope.getByRole("heading", { level: 2, name: "What to include" });

    expect(heading.parentElement?.querySelectorAll("li")).toHaveLength(5);
  });

  it("publishes the three response-time commitments", () => {
    const { scope } = renderPolicy();

    expect(scope.getByText("Acknowledgment")).toBeInTheDocument();
    expect(scope.getByText("48h")).toBeInTheDocument();
    expect(scope.getByText("7 days")).toBeInTheDocument();
    expect(scope.getByText("ASAP")).toBeInTheDocument();
  });

  it("splits the scope into seven in-scope and four out-of-scope entries", () => {
    const { scope } = renderPolicy();

    const inScope = scope.getByRole("heading", { level: 2, name: "In scope" });
    const outScope = scope.getByRole("heading", { level: 2, name: "Out of scope" });

    expect(inScope.parentElement?.querySelectorAll("li")).toHaveLength(7);
    expect(outScope.parentElement?.querySelectorAll("li")).toHaveLength(4);
    expect(scope.getByText("Cryptographic weaknesses (AES-256-GCM, PBKDF2-SHA256)")).toBeInTheDocument();
    expect(scope.getByText("localStorage attempt tracking bypass")).toBeInTheDocument();
  });

  it("documents the four cryptographic primitives in a table with headers", () => {
    const { scope } = renderPolicy();
    const table = scope.getByRole("table");

    expect(within(table).getAllByRole("columnheader").map((th) => th.textContent)).toEqual([
      "Primitive",
      "Algorithm",
      "Parameters",
    ]);

    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(4);
    expect(rows[0].textContent).toContain("Symmetric encryption");
    expect(rows[0].textContent).toContain("AES-256-GCM");
    expect(rows[0].textContent).toContain("256-bit key, 96-bit IV, 128-bit auth tag");
    expect(table.textContent).toContain("PBKDF2-SHA256");
    expect(table.textContent).toContain("crypto.getRandomValues");
  });

  it("keeps a strict descending heading order", () => {
    const { section } = renderPolicy();
    const levels = Array.from(section.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => Number(h.tagName[1]));

    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });
});

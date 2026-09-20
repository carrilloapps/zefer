/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { render, within } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import TermsContent from "../TermsContent";

function renderTerms() {
  const { container } = render(<LanguageProvider><TermsContent /></LanguageProvider>);
  const section = container.querySelector("main > section");
  if (!section) throw new Error("page section not found");
  return { container, section: section as HTMLElement, scope: within(section as HTMLElement) };
}

describe("TermsContent", () => {
  it("renders the legal badge, heading and intro", () => {
    const { scope } = renderTerms();

    expect(scope.getByText("LEGAL TERMS")).toBeInTheDocument();
    expect(scope.getByRole("heading", { level: 1, name: "Terms & Conditions" })).toBeInTheDocument();
    expect(scope.getByText(/you accept the following terms and conditions/)).toBeInTheDocument();
  });

  it("renders one card per clause, thirteen in total", () => {
    const { scope } = renderTerms();
    const titles = scope.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);

    expect(titles).toHaveLength(13);
    expect(titles).toContain("Service description");
    expect(titles).toContain("MIT License");
    // No duplicate clause titles — each section key must render once.
    expect(new Set(titles).size).toBe(13);
  });

  it("gives every clause a non-empty description", () => {
    const { section } = renderTerms();

    for (const heading of Array.from(section.querySelectorAll("h2"))) {
      const desc = heading.nextElementSibling;
      expect(desc?.tagName).toBe("P");
      expect(desc?.textContent?.length ?? 0).toBeGreaterThan(20);
    }
  });

  it("links to the privacy policy and back home", () => {
    const { scope } = renderTerms();

    expect(scope.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
    expect(scope.getByRole("link", { name: /Back to home/ })).toHaveAttribute("href", "/");
  });

  it("starts the heading hierarchy at h1 and never skips a level", () => {
    const { section } = renderTerms();
    const levels = Array.from(section.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => Number(h.tagName[1]));

    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });
});

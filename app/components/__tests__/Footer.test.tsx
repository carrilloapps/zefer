/** @vitest-environment jsdom */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import Footer from "../Footer";

function renderFooter() {
  return render(<LanguageProvider><Footer /></LanguageProvider>).container;
}

/** Every link, as `href → accessible name`, so both columns can be checked. */
function linkHrefs(): string[] {
  return screen.getAllByRole("link").map((a) => a.getAttribute("href") ?? "");
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Footer", () => {
  it("links every product, security and legal destination", () => {
    renderFooter();
    const hrefs = linkHrefs();

    for (const href of ["/generator", "/analyzer", "/mcp", "/library", "/device", "/how", "/conduct"]) {
      expect(hrefs).toContain(href);
    }
    // /privacy, /terms and /security each appear in both the desktop grid and
    // the compact mobile row.
    expect(hrefs.filter((h) => h === "/privacy")).toHaveLength(3);
    expect(hrefs.filter((h) => h === "/terms")).toHaveLength(3);
    expect(hrefs.filter((h) => h === "/security")).toHaveLength(2);
  });

  it("renders the translated column labels as paragraphs, not headings", () => {
    const container = renderFooter();

    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByText("Product").tagName).toBe("P");
    // The page's heading hierarchy must not be broken by the footer.
    expect(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).toHaveLength(0);
  });

  it("credits the author with an external profile link, no email", () => {
    const container = renderFooter();
    const authorLinks = screen.getAllByRole("link", { name: "José Carrillo" });

    expect(authorLinks).toHaveLength(2);
    for (const link of authorLinks) {
      expect(link).toHaveAttribute("href", "https://carrillo.app");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveAttribute("target", "_blank");
    }
    expect(container.innerHTML).not.toContain("mailto:");
  });

  it("shows the current year in both copyright lines", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2031-04-02T10:00:00Z"));
    const container = renderFooter();

    expect(container.textContent).toContain("© 2031 Zefer · MIT ·");
    expect(container.textContent).toContain("© 2031 Zefer. All rights reserved.");
  });

  it("points the brand lockup home", () => {
    renderFooter();
    const brand = screen.getByRole("link", { name: "Zefer" });

    expect(brand).toHaveAttribute("href", "/");
    expect(within(brand).getByText("Zefer")).toBeInTheDocument();
  });
});

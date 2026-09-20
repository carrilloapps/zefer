/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import NotFoundContent from "../NotFoundContent";

function renderNotFound() {
  const { container } = render(<LanguageProvider><NotFoundContent /></LanguageProvider>);
  const section = container.querySelector("main > section");
  if (!section) throw new Error("page section not found");
  return { container, section: section as HTMLElement, scope: within(section as HTMLElement) };
}

describe("NotFoundContent", () => {
  it("shows the 404 code as text, not as the page heading", () => {
    const { scope } = renderNotFound();
    const code = scope.getByText("404");

    expect(code.tagName).toBe("P");
    expect(scope.getByRole("heading", { level: 1 })).toHaveTextContent("Page not found");
  });

  it("explains what happened", () => {
    const { scope } = renderNotFound();
    expect(scope.getByText("The page you're looking for doesn't exist or has been moved.")).toBeInTheDocument();
  });

  it("offers a single way back home from the error body", () => {
    const { scope } = renderNotFound();
    const back = scope.getByRole("link", { name: /Back to home/ });

    expect(back).toHaveAttribute("href", "/");
    expect(back).toHaveClass("btn-primary");
    expect(scope.getAllByRole("link")).toHaveLength(1);
  });

  it("keeps the app chrome so the visitor can navigate on", () => {
    const { container } = renderNotFound();

    expect(container.querySelector("nav")).toBeInTheDocument();
    expect(container.querySelector("footer")).toBeInTheDocument();
    // Footer links are present, so the 404 is not a dead end.
    expect(screen.getAllByRole("link", { name: "Privacy Policy" }).length).toBeGreaterThan(0);
  });

  it("uses exactly one h1 across the whole page", () => {
    const { container } = renderNotFound();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
  });
});

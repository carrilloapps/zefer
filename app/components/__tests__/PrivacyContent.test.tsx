/** @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import PrivacyContent from "../PrivacyContent";

function renderPrivacy() {
  const { container } = render(<LanguageProvider><PrivacyContent /></LanguageProvider>);
  const section = container.querySelector("main > section");
  if (!section) throw new Error("page section not found");
  return { container, scope: within(section as HTMLElement), section: section as HTMLElement };
}

describe("PrivacyContent", () => {
  it("renders the policy heading, badge and intro", () => {
    const { scope } = renderPrivacy();

    expect(scope.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeInTheDocument();
    expect(scope.getByText("PRIVACY POLICY")).toBeInTheDocument();
    expect(scope.getByText(/your information is yours alone/)).toBeInTheDocument();
  });

  it("renders all ten policy sections, each with a title and a description", () => {
    const { scope } = renderPrivacy();

    const titles = scope.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(titles).toContain("AES-256-GCM Encryption");
    expect(titles).toContain("The official CLI (zefer-cli)");
    // 10 SectionCards + the "what we store" card.
    expect(titles).toHaveLength(12);
    expect(scope.getByRole("heading", { level: 2, name: "What we store vs. what we DON'T store" })).toBeInTheDocument();
  });

  it("splits the never-stored list on the pipe separator into one item per entry", () => {
    const { scope } = renderPrivacy();

    const neverHeading = scope.getByRole("heading", { level: 3, name: "We NEVER store" });
    const items = Array.from(neverHeading.parentElement?.querySelectorAll("li") ?? []).map((li) => li.textContent);

    expect(items).toEqual([
      "Plaintext content",
      "Passphrase / password",
      "IP address",
      "User agent / browser",
      "Cookies or trackers",
      "Usage analytics",
    ]);
    expect(items.some((i) => i?.includes("|"))).toBe(false);
  });

  it("states that nothing at all is stored on the 'we store' side", () => {
    const { scope } = renderPrivacy();

    const storeHeading = scope.getByRole("heading", { level: 3, name: "We store" });
    expect(storeHeading.parentElement?.textContent).toContain("Nothing. Absolutely nothing.");
  });

  it("links to the terms page and back home", () => {
    const { scope } = renderPrivacy();

    expect(scope.getByRole("link", { name: /View terms and conditions/ })).toHaveAttribute("href", "/terms");
    expect(scope.getByRole("link", { name: /Back to home/ })).toHaveAttribute("href", "/");
  });

  it("keeps a strict descending heading order and exposes no email", () => {
    const { container, section } = renderPrivacy();
    const levels = Array.from(section.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => Number(h.tagName[1]));

    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
    expect(container.innerHTML).not.toContain("mailto:");
  });

  it("renders in the stored locale", async () => {
    localStorage.setItem("zefer-lang", "es");
    // The locale store caches its snapshot at module scope, so a fresh module
    // instance is the only way to boot on another language.
    vi.resetModules();
    const { LanguageProvider: FreshProvider } = await import("../LanguageProvider");
    const FreshPrivacy = (await import("../PrivacyContent")).default;

    render(<FreshProvider><FreshPrivacy /></FreshProvider>);

    expect(screen.getByRole("heading", { level: 1, name: "Política de privacidad" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Cifrado AES-256-GCM" })).toBeInTheDocument();
    localStorage.clear();
  });
});

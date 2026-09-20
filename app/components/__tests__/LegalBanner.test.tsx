/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { t } from "@/app/lib/i18n";

const STORAGE_KEY = "zefer-legal-accepted";

/** Fresh modules per test: the accepted flag lives at module scope. */
async function load() {
  vi.resetModules();
  const { LanguageProvider } = await import("../LanguageProvider");
  const { default: LegalBanner } = await import("../LegalBanner");
  return { LanguageProvider, LegalBanner };
}

async function renderBanner() {
  const { LanguageProvider, LegalBanner } = await load();
  return render(
    <LanguageProvider>
      <LegalBanner />
    </LanguageProvider>
  );
}

describe("LegalBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, "language", { configurable: true, value: "en-US" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a complementary notice with both legal links when nothing was accepted", async () => {
    await renderBanner();

    const banner = screen.getByRole("complementary", { name: t("banner.title", "en") });
    expect(banner).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText(t("banner.desc", "en"), { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: t("footer.privacy", "en") })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: t("footer.terms", "en") })).toHaveAttribute("href", "/terms");
  });

  it("stays hidden once the notice was accepted in a previous visit", async () => {
    localStorage.setItem(STORAGE_KEY, "1");
    const { container } = await renderBanner();

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("dismisses and persists when the accept button is pressed", async () => {
    const { container } = await renderBanner();

    await act(async () => { screen.getByRole("button", { name: t("banner.accept", "en") }).click(); });

    expect(localStorage.getItem(STORAGE_KEY)).toBe("1");
    expect(container).toBeEmptyDOMElement();
  });

  it("dismisses from the close icon, which carries its own label", async () => {
    const { container } = await renderBanner();

    const close = screen.getByRole("button", { name: t("aria.close", "en") });
    expect(close).toHaveClass("w-9", "h-9");

    await act(async () => { close.click(); });
    expect(container).toBeEmptyDOMElement();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("1");
  });

  it("stays out of the way when storage cannot be read", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    const { container } = await renderBanner();
    expect(container).toBeEmptyDOMElement();
  });

  it("still dismisses for the session when storage cannot be written", async () => {
    const { container } = await renderBanner();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    await act(async () => { screen.getByRole("button", { name: t("banner.accept", "en") }).click(); });

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing on the server so hydration matches", async () => {
    const { LanguageProvider, LegalBanner } = await load();

    expect(renderToString(<LanguageProvider><LegalBanner /></LanguageProvider>)).toBe("");
  });
});

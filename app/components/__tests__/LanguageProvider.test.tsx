/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { t as translate, type Locale } from "@/app/lib/i18n";

type Mod = typeof import("../LanguageProvider");

/** Fresh module instance per test: the locale snapshot lives at module scope. */
async function load(): Promise<Mod> {
  vi.resetModules();
  return import("../LanguageProvider");
}

function setBrowserLanguage(value: string) {
  Object.defineProperty(navigator, "language", { configurable: true, value });
}

/** Consumer that renders the resolved locale, readiness and one translation. */
function makeProbe(useLanguage: Mod["useLanguage"]) {
  return function Probe() {
    const { locale, ready, t, setLocale } = useLanguage();
    return (
      <button type="button" onClick={() => setLocale("pt")} data-ready={ready} lang={locale}>
        {t("nav.home")}
      </button>
    );
  };
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    setBrowserLanguage("en-US");
    document.documentElement.removeAttribute("lang");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the stored locale and syncs <html lang> with it", async () => {
    localStorage.setItem("zefer-lang", "pt");
    const { LanguageProvider, useLanguage } = await load();
    const Probe = makeProbe(useLanguage);

    render(<LanguageProvider><Probe /></LanguageProvider>);

    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("lang", "pt");
    expect(btn).toHaveTextContent(translate("nav.home", "pt"));
    expect(btn).toHaveAttribute("data-ready", "true");
    expect(document.documentElement.lang).toBe("pt");
  });

  it("ignores a stored value that is not a supported locale", async () => {
    localStorage.setItem("zefer-lang", "kl");
    setBrowserLanguage("es-AR");
    const { LanguageProvider, useLanguage } = await load();
    const Probe = makeProbe(useLanguage);

    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByRole("button")).toHaveAttribute("lang", "es");
  });

  it.each([
    ["es-ES", "es"],
    ["pt-BR", "pt"],
    ["fr-FR", "en"],
  ])("detects %s as %s from navigator.language", async (browserLang, expected) => {
    setBrowserLanguage(browserLang);
    const { LanguageProvider, useLanguage } = await load();
    const Probe = makeProbe(useLanguage);

    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByRole("button")).toHaveAttribute("lang", expected);
    expect(screen.getByRole("button")).toHaveTextContent(translate("nav.home", expected as Locale));
  });

  it("falls back to navigator detection when storage is blocked (private mode)", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    setBrowserLanguage("pt-PT");
    const { LanguageProvider, useLanguage } = await load();
    const Probe = makeProbe(useLanguage);

    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByRole("button")).toHaveAttribute("lang", "pt");
  });

  it("renders the document default on the server snapshot, never localStorage", async () => {
    localStorage.setItem("zefer-lang", "es");
    const { LanguageProvider, useLanguage } = await load();
    const Probe = makeProbe(useLanguage);

    const html = renderToString(<LanguageProvider><Probe /></LanguageProvider>);
    expect(html).toContain('lang="en"');
    expect(html).toContain('data-ready="false"');
    expect(html).toContain(translate("nav.home", "en"));
  });

  it("persists a new locale and notifies every subscriber", async () => {
    const { LanguageProvider, useLanguage } = await load();
    const Probe = makeProbe(useLanguage);

    render(
      <LanguageProvider>
        <Probe />
        <LanguageProvider><Probe /></LanguageProvider>
      </LanguageProvider>
    );
    const [first, second] = screen.getAllByRole("button");
    expect(first).toHaveAttribute("lang", "en");

    await act(async () => { first.click(); });

    expect(first).toHaveAttribute("lang", "pt");
    expect(second).toHaveAttribute("lang", "pt");
    expect(second).toHaveTextContent(translate("nav.home", "pt"));
    expect(localStorage.getItem("zefer-lang")).toBe("pt");
    expect(document.documentElement.lang).toBe("pt");
  });

  it("still applies the locale when storage rejects the write", async () => {
    const { LanguageProvider, useLanguage } = await load();
    const Probe = makeProbe(useLanguage);
    render(<LanguageProvider><Probe /></LanguageProvider>);

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    await act(async () => { screen.getByRole("button").click(); });

    expect(screen.getByRole("button")).toHaveAttribute("lang", "pt");
    expect(localStorage.getItem("zefer-lang")).toBeNull();
  });

  it("gives an inert default context outside a provider", async () => {
    const { useLanguage } = await load();
    const Probe = makeProbe(useLanguage);

    render(<Probe />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("lang", "en");
    expect(btn).toHaveAttribute("data-ready", "false");
    // The fallback `t` echoes the key back instead of translating.
    expect(btn).toHaveTextContent("nav.home");

    // The fallback `setLocale` is a no-op: nothing is stored, nothing changes.
    await act(async () => { btn.click(); });
    expect(btn).toHaveAttribute("lang", "en");
    expect(localStorage.getItem("zefer-lang")).toBeNull();
  });
});

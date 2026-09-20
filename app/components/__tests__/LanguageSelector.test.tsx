/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LOCALES, t } from "@/app/lib/i18n";

/** Fresh modules per test: the locale snapshot lives at module scope. */
async function renderSelector() {
  vi.resetModules();
  const { LanguageProvider } = await import("../LanguageProvider");
  const { default: LanguageSelector } = await import("../LanguageSelector");
  return render(
    <LanguageProvider>
      <LanguageSelector />
    </LanguageProvider>
  );
}

/** Opens the menu from the keyboard. jsdom + Radix only honour the very first
 *  synthetic pointer-down per file, so keyboard activation — which the Radix
 *  migration exists to support — is what the suite drives. */
async function openMenu(user: ReturnType<typeof userEvent.setup>, locale: "es" | "en" | "pt" = "en") {
  const trigger = screen.getByRole("button", { name: t("aria.language", locale) });
  trigger.focus();
  await user.keyboard("{Enter}");
  return trigger;
}

describe("LanguageSelector", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, "language", { configurable: true, value: "en-US" });
  });

  it("labels the trigger for assistive tech and shows the active flag", async () => {
    await renderSelector();

    const trigger = screen.getByRole("button", { name: t("aria.language", "en") });
    expect(trigger).toHaveClass("w-9", "h-9");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryAllByRole("menuitemradio")).toHaveLength(0);
  });

  it("announces every locale as a radio item with the active one checked", async () => {
    const user = userEvent.setup();
    await renderSelector();

    await openMenu(user);

    const items = await screen.findAllByRole("menuitemradio");
    expect(items.map((i) => i.textContent)).toEqual(LOCALES.map((l) => l.label));
    expect(screen.getByRole("menuitemradio", { name: "English" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "Español" })).toHaveAttribute("aria-checked", "false");
  });

  it("switches the app locale when another language is picked", async () => {
    const user = userEvent.setup();
    await renderSelector();

    await openMenu(user);
    await screen.findByRole("menuitemradio", { name: "Português" });
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(localStorage.getItem("zefer-lang")).toBe("pt");
    expect(document.documentElement.lang).toBe("pt");
    const trigger = await screen.findByRole("button", { name: t("aria.language", "pt") });
    expect(trigger).toHaveFocus();
  });

  it("closes the menu with Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    await renderSelector();

    const trigger = await openMenu(user);
    expect(await screen.findAllByRole("menuitemradio")).toHaveLength(3);

    await user.keyboard("{Escape}");
    expect(screen.queryAllByRole("menuitemradio")).toHaveLength(0);
    expect(trigger).toHaveFocus();
    expect(localStorage.getItem("zefer-lang")).toBeNull();
  });
});

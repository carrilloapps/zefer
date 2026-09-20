/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";

import { t } from "@/app/lib/i18n";

type StartViewTransition = Document["startViewTransition"];
type ViewTransitionDoc = Omit<Document, "startViewTransition"> & {
  startViewTransition?: StartViewTransition;
};

/** Minimal stand-in for a ViewTransition: the component only awaits `finished`. */
function fakeTransition(finished: Promise<void>) {
  return vi.fn((cb: () => void) => {
    cb();
    return { finished } as unknown as ViewTransition;
  }) as unknown as StartViewTransition & { mock: { calls: unknown[] } };
}

/** Fresh modules per test: the theme snapshot lives at module scope. */
async function renderToggle() {
  vi.resetModules();
  // Every module has to come from the same fresh graph, or the toggle would
  // read a different LanguageContext than the provider renders.
  const { LanguageProvider } = await import("../LanguageProvider");
  const { ThemeProvider } = await import("../ThemeProvider");
  const { default: ThemeToggle } = await import("../ThemeToggle");
  const view = render(
    <LanguageProvider>
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    </LanguageProvider>
  );
  return view;
}

function click(button: HTMLElement, at = { clientX: 120, clientY: 40 }) {
  return act(async () => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true, ...at }));
  });
}

function reducedMotion(reduce: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (q: string) =>
      ({ matches: reduce && q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList
  );
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("style");
    Reflect.deleteProperty(document, "startViewTransition");
    reducedMotion(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("labels the button with the theme it switches to", async () => {
    await renderToggle();

    const button = screen.getByRole("button", { name: t("aria.theme.light", "en") });
    expect(button).toHaveClass("w-9", "h-9");
    expect(button).toBeEnabled();
  });

  it("toggles the theme directly when the View Transitions API is missing", async () => {
    await renderToggle();

    await click(screen.getByRole("button"));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("zefer-theme")).toBe("light");
    expect(screen.getByRole("button", { name: t("aria.theme.dark", "en") })).toBeEnabled();
  });

  it("skips the view transition when the user asked for reduced motion", async () => {
    const startViewTransition = vi.fn() as unknown as StartViewTransition;
    (document as ViewTransitionDoc).startViewTransition = startViewTransition;
    reducedMotion(true);
    await renderToggle();

    await click(screen.getByRole("button"));

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("runs the toggle inside a view transition and records the click origin", async () => {
    let finish!: () => void;
    const finished = new Promise<void>((resolve) => { finish = resolve; });
    const startViewTransition = fakeTransition(finished);
    (document as ViewTransitionDoc).startViewTransition = startViewTransition;
    await renderToggle();

    await click(screen.getByRole("button"), { clientX: 200, clientY: 64 });

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(document.documentElement.style.getPropertyValue("--toggle-x")).toBe("200px");
    expect(document.documentElement.style.getPropertyValue("--toggle-y")).toBe("64px");
    expect(document.documentElement.dataset.theme).toBe("light");

    // Blocked until the transition settles, then operable again.
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("pointer-events-none");

    await act(async () => { finish(); await finished; });
    await waitFor(() => expect(screen.getByRole("button")).toBeEnabled());
    expect(screen.getByRole("button")).not.toHaveClass("pointer-events-none");
  });

  it("unblocks the button even if the transition is aborted", async () => {
    const finished = Promise.reject(new Error("skipped transition"));
    (document as ViewTransitionDoc).startViewTransition = fakeTransition(finished);
    await renderToggle();

    await click(screen.getByRole("button"));

    await waitFor(() => expect(screen.getByRole("button")).toBeEnabled());
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});

/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import DonateFab from "../DonateFab";
import { t } from "@/app/lib/i18n";

const BMC_URL = "https://www.buymeacoffee.com/carrilloapps";
const DISMISS_KEY = "zefer-fab-bubble-dismissed";
const FIRST_DELAY = 25_000;
const REPEAT_EVERY = 180_000;
const VISIBLE_FOR = 9_000;

function renderFab() {
  return render(
    <LanguageProvider>
      <DonateFab />
    </LanguageProvider>
  );
}

function advance(ms: number) {
  return act(async () => { vi.advanceTimersByTime(ms); });
}

function clickOn(el: HTMLElement) {
  return act(async () => { el.click(); });
}

const bubble = () => screen.queryByRole("status");

describe("DonateFab", () => {
  beforeEach(() => {
    sessionStorage.clear();
    Object.defineProperty(navigator, "language", { configurable: true, value: "en-US" });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing until the language store is ready", () => {
    const { container } = render(<DonateFab />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a labelled donation link and no bubble at first", () => {
    renderFab();

    const fab = screen.getByRole("link", { name: t("nav.donate", "en") });
    expect(fab).toHaveAttribute("href", BMC_URL);
    expect(fab).toHaveAttribute("rel", "noopener noreferrer");
    expect(bubble()).not.toBeInTheDocument();
  });

  it("invites once after the first delay and hides itself again", async () => {
    renderFab();

    await advance(FIRST_DELAY);
    expect(bubble()).toBeInTheDocument();
    expect(screen.getByText(t("fab.bubble.title", "en"))).toBeInTheDocument();

    await advance(VISIBLE_FOR);
    expect(bubble()).not.toBeInTheDocument();

    // ...and comes back on the repeating schedule (first tick at REPEAT_EVERY).
    await advance(REPEAT_EVERY - FIRST_DELAY - VISIBLE_FOR);
    expect(bubble()).toBeInTheDocument();
  });

  it("closes the bubble when its call to action is followed", async () => {
    renderFab();
    await advance(FIRST_DELAY);

    const cta = screen.getByRole("link", { name: t("fab.bubble.cta", "en") });
    expect(cta).toHaveAttribute("href", BMC_URL);
    await clickOn(cta);

    expect(bubble()).not.toBeInTheDocument();
    expect(sessionStorage.getItem(DISMISS_KEY)).toBeNull();
  });

  it("silences the bubble for the session when it is dismissed", async () => {
    renderFab();
    await advance(FIRST_DELAY);

    await clickOn(screen.getByRole("button", { name: t("aria.close", "en") }));

    expect(bubble()).not.toBeInTheDocument();
    expect(sessionStorage.getItem(DISMISS_KEY)).toBe("1");

    await advance(REPEAT_EVERY);
    expect(bubble()).not.toBeInTheDocument();
  });

  it("never schedules a bubble when the session was already silenced", async () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    renderFab();

    await advance(FIRST_DELAY + REPEAT_EVERY);
    expect(bubble()).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: t("nav.donate", "en") })).toBeInTheDocument();
  });

  it("clears its pending timers on unmount", async () => {
    const clear = vi.spyOn(globalThis, "clearTimeout");
    const { unmount } = renderFab();
    await advance(FIRST_DELAY);
    expect(bubble()).toBeInTheDocument();

    unmount();
    // The first-run timer plus the still-pending auto-hide timer.
    expect(clear.mock.calls.length).toBeGreaterThanOrEqual(2);

    await advance(VISIBLE_FOR + REPEAT_EVERY);
    expect(bubble()).not.toBeInTheDocument();
    clear.mockRestore();
  });
});

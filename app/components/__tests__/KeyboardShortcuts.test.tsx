/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import { ThemeProvider } from "../ThemeProvider";
import KeyboardShortcuts from "../KeyboardShortcuts";
import { t } from "@/app/lib/i18n";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

function renderShortcuts() {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        <KeyboardShortcuts />
        <input aria-label="field" />
        <textarea aria-label="area" />
        <select aria-label="picker">
          <option>a</option>
        </select>
        <div aria-label="editor" contentEditable tabIndex={0} suppressContentEditableWarning />
      </ThemeProvider>
    </LanguageProvider>
  );
}

function press(key: string, init: KeyboardEventInit = {}) {
  fireEvent.keyDown(document.body, { key, ...init });
}

const dialog = () => screen.queryByRole("dialog");

describe("KeyboardShortcuts", () => {
  beforeEach(() => {
    push.mockClear();
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    Object.defineProperty(navigator, "language", { configurable: true, value: "en-US" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stays closed until a shortcut asks for it", () => {
    renderShortcuts();
    expect(dialog()).not.toBeInTheDocument();
  });

  it("opens the help overlay with ? and lists every shortcut", async () => {
    renderShortcuts();

    await press("?");

    const panel = await screen.findByRole("dialog");
    expect(panel).toHaveAccessibleName(t("shortcuts.title", "en"));
    expect(panel).toHaveAccessibleDescription(t("shortcuts.subtitle", "en"));
    expect(screen.getAllByRole("listitem")).toHaveLength(8);
    expect(screen.getByText(t("shortcuts.encrypt", "en"))).toBeInTheDocument();
    expect(screen.getByText(t("shortcuts.note", "en"))).toBeInTheDocument();

    // "?" toggles it back off.
    await press("?");
    await waitFor(() => expect(dialog()).not.toBeInTheDocument());
  });

  it("accepts Shift+/ as the same help shortcut", async () => {
    renderShortcuts();

    await press("/", { shiftKey: true });
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("closes the overlay from its close button", async () => {
    renderShortcuts();
    await press("?");
    await screen.findByRole("dialog");

    await act(async () => { screen.getByRole("button", { name: t("aria.close", "en") }).click(); });

    await waitFor(() => expect(dialog()).not.toBeInTheDocument());
  });

  it("can be toggled by the navbar through a custom event", async () => {
    renderShortcuts();

    await act(async () => { window.dispatchEvent(new CustomEvent("zefer:toggle-shortcuts")); });
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await act(async () => { window.dispatchEvent(new CustomEvent("zefer:toggle-shortcuts")); });
    await waitFor(() => expect(dialog()).not.toBeInTheDocument());
  });

  it.each([
    ["e", "/?t=encrypt", "encrypt"],
    ["E", "/?t=encrypt", "encrypt"],
    ["d", "/?t=decrypt", "decrypt"],
    ["D", "/?t=decrypt", "decrypt"],
  ])("routes %s to %s and asks the home page for the tab", async (key, path, tab) => {
    renderShortcuts();
    const seen: unknown[] = [];
    const listener = (e: Event) => seen.push((e as CustomEvent).detail);
    window.addEventListener("zefer:set-tab", listener);

    await press(key);

    expect(push).toHaveBeenCalledWith(path);
    expect(seen).toEqual([tab]);
    window.removeEventListener("zefer:set-tab", listener);
  });

  it.each([
    ["g", "/generator"],
    ["G", "/generator"],
    ["z", "/analyzer"],
    ["Z", "/analyzer"],
    ["h", "/"],
    ["H", "/"],
  ])("routes %s to %s", async (key, path) => {
    renderShortcuts();

    await press(key);

    expect(push).toHaveBeenCalledWith(path);
  });

  it.each(["t", "T"])("toggles the theme with %s and closes the overlay", async (key) => {
    renderShortcuts();
    await press("?");
    await screen.findByRole("dialog");
    const before = document.documentElement.dataset.theme;

    await press(key);

    expect(document.documentElement.dataset.theme).not.toBe(before);
    expect(document.documentElement.dataset.theme).toMatch(/^(dark|light)$/);
    expect(push).not.toHaveBeenCalled();
    await waitFor(() => expect(dialog()).not.toBeInTheDocument());
  });

  it("ignores keys with no action of their own", async () => {
    renderShortcuts();

    await press("x");

    expect(push).not.toHaveBeenCalled();
    expect(dialog()).not.toBeInTheDocument();
  });

  it.each([
    ["ctrlKey", { ctrlKey: true }],
    ["metaKey", { metaKey: true }],
    ["altKey", { altKey: true }],
  ])("never hijacks browser combos (%s)", async (_name, init) => {
    renderShortcuts();

    await press("e", init);
    await press("?", init);

    expect(push).not.toHaveBeenCalled();
    expect(dialog()).not.toBeInTheDocument();
  });

  it("leaves Escape to the dialog itself", async () => {
    renderShortcuts();
    await press("?");
    await screen.findByRole("dialog");

    await press("Escape");
    // The overlay owns Escape: our handler bailed out instead of toggling it
    // back open, and Radix closed the dialog.
    await waitFor(() => expect(dialog()).not.toBeInTheDocument());
  });

  it.each(["field", "area", "picker", "editor"])("stays silent while typing in %s", async (label) => {
    renderShortcuts();
    const el = screen.getByLabelText(label) as HTMLElement;
    // jsdom never computes `isContentEditable` from the attribute.
    if (label === "editor") Object.defineProperty(el, "isContentEditable", { value: true });
    act(() => { el.focus(); });

    await press("g");
    await press("?");

    expect(push).not.toHaveBeenCalled();
    expect(dialog()).not.toBeInTheDocument();
  });

  it("still fires when nothing at all holds focus", async () => {
    renderShortcuts();
    Object.defineProperty(document, "activeElement", { configurable: true, get: () => null });

    await press("g");

    expect(push).toHaveBeenCalledWith("/generator");
    Reflect.deleteProperty(document, "activeElement");
  });

  it("stops listening once unmounted", async () => {
    const { unmount } = renderShortcuts();
    unmount();

    await press("g");

    expect(push).not.toHaveBeenCalled();
  });
});

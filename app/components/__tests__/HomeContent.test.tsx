/** @vitest-environment jsdom */
import { useEffect } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { LanguageProvider } from "../LanguageProvider";
import HomeContent from "../HomeContent";
import { usePreferences } from "@/app/lib/preferences";
import { t } from "@/app/lib/i18n";

const T = (key: Parameters<typeof t>[0]) => t(key, "en");

const PHRASES = [
  T("hero.rotate.1"),
  T("hero.rotate.2"),
  T("hero.rotate.3"),
  T("hero.rotate.4"),
  T("hero.rotate.5"),
];

// ─── Preferences reset ───
//
// The preference store is module-level, so every test starts by driving it back
// to a known state through the public hook.
const probe: { api: ReturnType<typeof usePreferences> | null } = { api: null };

/** Publishes the preference API to the test. The store is module-level, so the
 *  only supported way to put it back to a known state is through its setters. */
function PrefsProbe() {
  const api = usePreferences();
  useEffect(() => {
    probe.api = api;
  });
  return null;
}

function resetPreferences() {
  const view = render(<PrefsProbe />);
  act(() => {
    probe.api!.setTab("encrypt");
    probe.api!.setTtl(30);
    probe.api!.setIterations(1);
    probe.api!.setCompression("none");
    probe.api!.setInputMode("text");
  });
  view.unmount();
}

/** Replace matchMedia so the reduced-motion store reports a known preference. */
function mockMotion(reduce: boolean) {
  const listeners = new Set<() => void>();
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: reduce,
        media: query,
        addEventListener: (_: string, fn: () => void) => listeners.add(fn),
        removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
      }) as unknown as MediaQueryList
  );
  return listeners;
}

function renderHome() {
  return render(
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}

/** The rotating slot of the hero headline. */
function typed(): string {
  return document.querySelector(".theme-gradient-text")!.textContent ?? "";
}

describe("HomeContent", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    localStorage.clear();
    resetPreferences();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders the hero, both tabs and the encrypt panel by default", () => {
    mockMotion(true);
    renderHome();

    expect(
      screen.getByRole("heading", { level: 1, name: new RegExp(T("hero.title")) })
    ).toBeInTheDocument();
    const tablist = screen.getByRole("tablist");
    expect(within(tablist).getByRole("tab", { name: T("tab.encrypt") })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("heading", { level: 2, name: T("encrypt.title") })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: T("decrypt.title") })).toBeNull();
  });

  it("links the resource shortcuts to their routes", () => {
    mockMotion(true);
    renderHome();
    const resources = screen
      .getByRole("heading", { level: 2, name: T("home.resources") })
      .closest("section")!;
    expect(within(resources).getByRole("link", { name: T("nav.analyzer") })).toHaveAttribute(
      "href",
      "/analyzer"
    );
    expect(within(resources).getByRole("link", { name: T("nav.library") })).toHaveAttribute(
      "href",
      "/library"
    );
    expect(within(resources).getByRole("link", { name: "llms.txt" })).toHaveAttribute(
      "href",
      "/llms.txt"
    );
  });

  it("switches to the decrypt panel when the tab is activated", async () => {
    mockMotion(true);
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole("tab", { name: T("tab.decrypt") }));

    expect(screen.getByRole("heading", { level: 2, name: T("decrypt.title") })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: T("encrypt.title") })).toBeNull();
    // The switch is persisted, not just local UI state.
    expect(JSON.parse(localStorage.getItem("zefer-prefs")!).tab).toBe("decrypt");
  });

  it("opens on the decrypt tab for ?tab=decrypt", () => {
    window.history.replaceState({}, "", "/?tab=decrypt");
    mockMotion(true);
    renderHome();
    expect(screen.getByRole("heading", { level: 2, name: T("decrypt.title") })).toBeInTheDocument();
  });

  it("opens on the encrypt tab for the ?t= alias even when decrypt was stored", () => {
    act(() => {
      const view = render(<PrefsProbe />);
      act(() => probe.api!.setTab("decrypt"));
      view.unmount();
    });
    window.history.replaceState({}, "", "/?t=encrypt");
    mockMotion(true);
    renderHome();
    expect(screen.getByRole("heading", { level: 2, name: T("encrypt.title") })).toBeInTheDocument();
  });

  it("ignores an unknown tab param and keeps the stored tab", () => {
    const view = render(<PrefsProbe />);
    act(() => probe.api!.setTab("decrypt"));
    view.unmount();
    window.history.replaceState({}, "", "/?tab=sideways");
    mockMotion(true);
    renderHome();
    expect(screen.getByRole("heading", { level: 2, name: T("decrypt.title") })).toBeInTheDocument();
  });

  it("switches tabs on the zefer:set-tab event and ignores unknown details", () => {
    mockMotion(true);
    const { unmount } = renderHome();

    act(() => {
      window.dispatchEvent(new CustomEvent("zefer:set-tab", { detail: "decrypt" }));
    });
    expect(screen.getByRole("heading", { level: 2, name: T("decrypt.title") })).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new CustomEvent("zefer:set-tab", { detail: "sideways" }));
    });
    expect(screen.getByRole("heading", { level: 2, name: T("decrypt.title") })).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new CustomEvent("zefer:set-tab", { detail: "encrypt" }));
    });
    expect(screen.getByRole("heading", { level: 2, name: T("encrypt.title") })).toBeInTheDocument();

    // Once unmounted the listener is gone: the event must no longer be handled.
    unmount();
    act(() => {
      window.dispatchEvent(new CustomEvent("zefer:set-tab", { detail: "decrypt" }));
    });
    expect(JSON.parse(localStorage.getItem("zefer-prefs")!).tab).toBe("encrypt");
  });

  it("renders on the server with reduced motion and no URL params", () => {
    const html = renderToString(
      <LanguageProvider>
        <HomeContent />
      </LanguageProvider>
    );
    // Server snapshot: first phrase already in the markup (no animation frame
    // needed), cursor in its initial visible state, encrypt tab selected.
    expect(html).toContain(PHRASES[0]);
    expect(html).toContain("opacity-100");
    expect(html).toContain(T("encrypt.title"));
    expect(html).not.toContain(T("decrypt.title"));
  });

  describe("typewriter", () => {
    it("shows the first phrase without a cursor when motion is reduced", () => {
      mockMotion(true);
      renderHome();
      expect(typed()).toBe(PHRASES[0]);
      expect(document.querySelector(".theme-gradient-text")!.nextElementSibling).toHaveClass(
        "opacity-0"
      );
    });

    it("unsubscribes from the motion query on unmount", () => {
      const listeners = mockMotion(true);
      const { unmount } = renderHome();
      expect(listeners.size).toBe(1);
      unmount();
      expect(listeners.size).toBe(0);
    });

    it("deletes the first phrase and types the next one", async () => {
      mockMotion(false);
      vi.useFakeTimers();
      renderHome();

      expect(typed()).toBe(PHRASES[0]);

      // Initial 3s hold, then the delete loop starts eating characters.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000 + 200);
      });
      const partial = typed();
      expect(partial.length).toBeLessThan(PHRASES[0].length);
      expect(PHRASES[0].startsWith(partial)).toBe(true);

      // Walk the rest of the cycle and record every frame.
      const seen = new Set<string>([partial]);
      for (let i = 0; i < 120; i++) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(100);
        });
        seen.add(typed());
      }
      expect(seen.has("")).toBe(true);
      expect(seen.has(PHRASES[1])).toBe(true);
    });

    it("blinks the cursor while typing", async () => {
      mockMotion(false);
      vi.useFakeTimers();
      renderHome();
      const cursor = () => document.querySelector(".theme-gradient-text")!.nextElementSibling!;

      expect(cursor()).toHaveClass("opacity-100");
      await act(async () => {
        await vi.advanceTimersByTimeAsync(530);
      });
      expect(cursor()).toHaveClass("opacity-0");
      await act(async () => {
        await vi.advanceTimersByTimeAsync(530);
      });
      expect(cursor()).toHaveClass("opacity-100");
    });

    it("stops mid-delete when the page unmounts", async () => {
      mockMotion(false);
      vi.useFakeTimers();
      const { unmount } = renderHome();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000 + 200);
      });
      expect(typed().length).toBeLessThan(PHRASES[0].length);

      // Fire the pending wait WITHOUT flushing its continuation, then unmount:
      // the loop resumes already cancelled and bails out.
      vi.advanceTimersByTime(100);
      unmount();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });
      expect(vi.getTimerCount()).toBe(0);
    });

    it("stops mid-type when the page unmounts", async () => {
      mockMotion(false);
      vi.useFakeTimers();
      const { unmount } = renderHome();

      // Run until the first phrase is gone and the next one is being typed.
      let typing = false;
      for (let i = 0; i < 200 && !typing; i++) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(50);
        });
        const now = typed();
        typing = now.length > 0 && now.length < PHRASES[1].length && PHRASES[1].startsWith(now);
      }
      expect(typing).toBe(true);

      vi.advanceTimersByTime(100);
      unmount();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});

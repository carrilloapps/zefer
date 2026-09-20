/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderToString } from "react-dom/server";

type Mod = typeof import("../ThemeProvider");

/** Fresh module instance per test: the store snapshot lives at module scope. */
async function load(): Promise<Mod> {
  vi.resetModules();
  return import("../ThemeProvider");
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("uses the stored theme when one is pinned", async () => {
    localStorage.setItem("zefer-theme", "light");
    const { ThemeProvider, useTheme } = await load();
    function Show() {
      return <span>{useTheme().theme}</span>;
    }
    render(<ThemeProvider><Show /></ThemeProvider>);
    expect(screen.getByText("light")).toBeInTheDocument();
  });

  it("falls back to the OS preference when nothing is stored", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (q: string) => ({ matches: q.includes("light"), media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList
    );
    const { ThemeProvider, useTheme } = await load();
    function Show() {
      return <span>{useTheme().theme}</span>;
    }
    render(<ThemeProvider><Show /></ThemeProvider>);
    expect(screen.getByText("light")).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it("renders the document default on the server snapshot", async () => {
    localStorage.setItem("zefer-theme", "light");
    const { ThemeProvider, useTheme } = await load();
    function Show() {
      return <span>{useTheme().theme}</span>;
    }
    const html = renderToString(<ThemeProvider><Show /></ThemeProvider>);
    expect(html).toContain("dark");
  });

  it("toggles, persists and paints the theme", async () => {
    const { ThemeProvider, useTheme } = await load();
    function Show() {
      const { theme, toggleTheme } = useTheme();
      return <button onClick={toggleTheme}>{theme}</button>;
    }
    render(<ThemeProvider><Show /></ThemeProvider>);
    expect(screen.getByRole("button")).toHaveTextContent("dark");
    act(() => screen.getByRole("button").click());
    expect(screen.getByRole("button")).toHaveTextContent("light");
    expect(localStorage.getItem("zefer-theme")).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("defaults the context outside a provider", async () => {
    const { useTheme } = await load();
    function Show() {
      const { theme, toggleTheme } = useTheme();
      toggleTheme();
      return <span>{theme}</span>;
    }
    render(<Show />);
    expect(screen.getByText("dark")).toBeInTheDocument();
  });
});

describe("ThemeProvider resilience", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("falls back to the OS preference when localStorage throws on read", async () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(window, "matchMedia").mockImplementation(
      (q: string) => ({ matches: q.includes("light"), media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList
    );
    const { ThemeProvider, useTheme } = await load();
    function Show() {
      return <span>{useTheme().theme}</span>;
    }
    render(<ThemeProvider><Show /></ThemeProvider>);
    expect(screen.getByText("light")).toBeInTheDocument();
    expect(getItem).toHaveBeenCalledWith("zefer-theme");
    vi.restoreAllMocks();
  });

  it("still applies the theme when localStorage throws on write", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { ThemeProvider, useTheme } = await load();
    function Show() {
      const { theme, toggleTheme } = useTheme();
      return <button onClick={toggleTheme}>{theme}</button>;
    }
    render(<ThemeProvider><Show /></ThemeProvider>);
    act(() => screen.getByRole("button").click());
    expect(screen.getByRole("button")).toHaveTextContent("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    vi.restoreAllMocks();
  });
});

describe("ThemeProvider following the OS preference", () => {
  /** Captures the `change` listener the provider registers on the media query. */
  function stubMatchMedia() {
    let handler: ((e: MediaQueryListEvent) => void) | null = null;
    vi.spyOn(window, "matchMedia").mockImplementation(
      (q: string) =>
        ({
          matches: false,
          media: q,
          addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => {
            handler = fn;
          },
          removeEventListener: () => {
            handler = null;
          },
        }) as unknown as MediaQueryList
    );
    return {
      emit: (matches: boolean) => handler?.({ matches } as MediaQueryListEvent),
      isBound: () => handler !== null,
    };
  }

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("repaints when the OS switches and no theme is pinned", async () => {
    const mq = stubMatchMedia();
    const { ThemeProvider, useTheme } = await load();
    function Show() {
      return <span>{useTheme().theme}</span>;
    }
    const { unmount } = render(<ThemeProvider><Show /></ThemeProvider>);
    expect(screen.getByText("dark")).toBeInTheDocument();

    act(() => mq.emit(false));
    expect(screen.getByText("light")).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe("light");

    act(() => mq.emit(true));
    expect(screen.getByText("dark")).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe("dark");

    unmount();
    expect(mq.isBound()).toBe(false);
    vi.restoreAllMocks();
  });

  it("ignores the OS switch once the user has pinned a theme", async () => {
    const mq = stubMatchMedia();
    localStorage.setItem("zefer-theme", "light");
    const { ThemeProvider, useTheme } = await load();
    function Show() {
      return <span>{useTheme().theme}</span>;
    }
    render(<ThemeProvider><Show /></ThemeProvider>);
    act(() => mq.emit(true));
    expect(screen.getByText("light")).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBeUndefined();
    vi.restoreAllMocks();
  });
});

describe("ThemeProvider toggling back", () => {
  it("toggles from light back to dark", async () => {
    localStorage.clear();
    localStorage.setItem("zefer-theme", "light");
    const { ThemeProvider, useTheme } = await load();
    function Show() {
      const { theme, toggleTheme } = useTheme();
      return <button onClick={toggleTheme}>{theme}</button>;
    }
    render(<ThemeProvider><Show /></ThemeProvider>);
    expect(screen.getByRole("button")).toHaveTextContent("light");
    act(() => screen.getByRole("button").click());
    expect(screen.getByRole("button")).toHaveTextContent("dark");
    expect(localStorage.getItem("zefer-theme")).toBe("dark");
  });
});

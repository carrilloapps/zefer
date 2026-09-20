/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const STORAGE_KEY = "zefer-prefs";

const DEFAULTS = {
  ttl: 30,
  iterations: 600_000,
  compression: "none",
  inputMode: "text",
  tab: "encrypt",
  keygenMode: "secure",
  keygenLength: 64,
  keygenCount: 1,
  keygenAdvanced: {
    excludeAmbiguous: false,
    excludeChars: "",
    requireAllClasses: false,
    noRepeats: false,
    groupSize: 0,
  },
};

/**
 * The store caches its snapshot at module scope, so every test needs a cold
 * module graph. React and RTL are re-imported alongside it, otherwise the fresh
 * `preferences` module would bind to a second React copy and blow up the
 * hook dispatcher.
 */
async function freshModules() {
  vi.resetModules();
  const [preferences, react, rtl, server] = await Promise.all([
    import("../preferences"),
    import("react"),
    import("@testing-library/react"),
    import("react-dom/server"),
  ]);
  return { ...preferences, ...rtl, createElement: react.createElement, ...server };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("usePreferences — loading", () => {
  it("starts from the defaults when nothing is stored", async () => {
    const { usePreferences, renderHook } = await freshModules();
    const { result, unmount } = renderHook(() => usePreferences());

    expect(result.current).toMatchObject(DEFAULTS);
    unmount();
  });

  it("merges stored values over the defaults", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ttl: 1440, compression: "gzip", keygenCount: 5 }),
    );
    const { usePreferences, renderHook } = await freshModules();
    const { result, unmount } = renderHook(() => usePreferences());

    expect(result.current.ttl).toBe(1440);
    expect(result.current.compression).toBe("gzip");
    expect(result.current.keygenCount).toBe(5);
    // Untouched keys still come from the defaults.
    expect(result.current.iterations).toBe(600_000);
    expect(result.current.keygenAdvanced).toEqual(DEFAULTS.keygenAdvanced);
    unmount();
  });

  it("falls back to the defaults when the stored JSON is corrupt", async () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    const { usePreferences, renderHook } = await freshModules();
    const { result, unmount } = renderHook(() => usePreferences());

    expect(result.current).toMatchObject(DEFAULTS);
    unmount();
  });

  it("falls back to the defaults when localStorage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("SecurityError");
    });
    const { usePreferences, renderHook } = await freshModules();
    const { result, unmount } = renderHook(() => usePreferences());

    expect(result.current).toMatchObject(DEFAULTS);
    unmount();
  });

  it("reads localStorage once and shares the snapshot across consumers", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ttl: 60 }));
    const getItem = vi.spyOn(Storage.prototype, "getItem");

    const { usePreferences, renderHook } = await freshModules();
    const a = renderHook(() => usePreferences());
    const b = renderHook(() => usePreferences());

    expect(a.result.current.ttl).toBe(60);
    expect(b.result.current.ttl).toBe(60);
    expect(getItem.mock.calls.filter((c) => c[0] === STORAGE_KEY)).toHaveLength(1);
    a.unmount();
    b.unmount();
  });
});

describe("usePreferences — writing", () => {
  it("persists every setter and notifies all subscribers", async () => {
    const { usePreferences, renderHook, act } = await freshModules();
    const a = renderHook(() => usePreferences());
    const b = renderHook(() => usePreferences());

    act(() => {
      a.result.current.setTtl(10080);
      a.result.current.setIterations(1_000_000);
      a.result.current.setCompression("deflate");
      a.result.current.setInputMode("file");
      a.result.current.setTab("decrypt");
      a.result.current.setKeygenMode("base58");
      a.result.current.setKeygenLength(128);
      a.result.current.setKeygenCount(12);
    });

    const expected = {
      ttl: 10080,
      iterations: 1_000_000,
      compression: "deflate",
      inputMode: "file",
      tab: "decrypt",
      keygenMode: "base58",
      keygenLength: 128,
      keygenCount: 12,
    };

    expect(a.result.current).toMatchObject(expected);
    // The second consumer sees the same values without re-reading storage.
    expect(b.result.current).toMatchObject(expected);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toMatchObject(expected);

    a.unmount();
    b.unmount();
  });

  it("merges partial advanced keygen options instead of replacing them", async () => {
    const { usePreferences, renderHook, act } = await freshModules();
    const { result, unmount } = renderHook(() => usePreferences());

    act(() => { result.current.setKeygenAdvanced({ excludeAmbiguous: true }); });
    act(() => { result.current.setKeygenAdvanced({ groupSize: 4 }); });

    expect(result.current.keygenAdvanced).toEqual({
      ...DEFAULTS.keygenAdvanced,
      excludeAmbiguous: true,
      groupSize: 4,
    });
    unmount();
  });

  it("stops notifying a consumer once it unmounts", async () => {
    const { usePreferences, renderHook, act } = await freshModules();
    const a = renderHook(() => usePreferences());
    const b = renderHook(() => usePreferences());

    b.unmount();
    act(() => { a.result.current.setTtl(20160); });

    expect(a.result.current.ttl).toBe(20160);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).ttl).toBe(20160);
    a.unmount();
  });
});

describe("usePreferences — hydration safety", () => {
  it("renders the defaults on the server even when localStorage holds other values", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ttl: 1440, tab: "decrypt" }));
    const { usePreferences, createElement, renderToString } = await freshModules();

    function Probe() {
      const { ttl, tab } = usePreferences();
      return createElement("span", null, `${ttl}/${tab}`);
    }

    expect(renderToString(createElement(Probe))).toBe("<span>30/encrypt</span>");
  });
});

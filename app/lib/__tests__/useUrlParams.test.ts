/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { createElement } from "react";
import { renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { useUrlParams } from "../useUrlParams";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("useUrlParams", () => {
  it("exposes the current query string after mount", () => {
    window.history.replaceState(null, "", "/?t=decrypt&p=myKey123");
    const { result } = renderHook(() => useUrlParams());

    expect(result.current).toBeInstanceOf(URLSearchParams);
    expect(result.current?.get("t")).toBe("decrypt");
    expect(result.current?.get("p")).toBe("myKey123");
  });

  it("returns an empty params object when there is no query string", () => {
    const { result } = renderHook(() => useUrlParams());
    expect([...(result.current ?? [])]).toEqual([]);
  });

  it("reuses the same instance while the search string is unchanged", () => {
    window.history.replaceState(null, "", "/?t=encrypt");
    const first = renderHook(() => useUrlParams());
    const cached = first.result.current;
    first.rerender();
    expect(first.result.current).toBe(cached);

    const second = renderHook(() => useUrlParams());
    expect(second.result.current).toBe(cached);
  });

  it("rebuilds the params once the search string changes", () => {
    window.history.replaceState(null, "", "/?t=encrypt");
    const before = renderHook(() => useUrlParams()).result.current;

    window.history.replaceState(null, "", "/?t=decrypt");
    const after = renderHook(() => useUrlParams()).result.current;

    expect(after).not.toBe(before);
    expect(after?.get("t")).toBe("decrypt");
  });

  it("unsubscribes cleanly on unmount", () => {
    const { unmount } = renderHook(() => useUrlParams());
    expect(() => unmount()).not.toThrow();
  });

  it("returns null on the server, so the page never bails out of SSR", () => {
    function Probe() {
      return createElement("span", null, String(useUrlParams()));
    }
    // A query string is present, yet the server render must still see null.
    window.history.replaceState(null, "", "/?t=decrypt");

    expect(renderToString(createElement(Probe))).toBe("<span>null</span>");
  });
});

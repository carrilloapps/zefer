/**
 * Shared Vitest setup. Runs for every test file, in both the default Node
 * environment (app/lib suites) and the jsdom environment (component suites),
 * so every browser-only shim is guarded behind a `window` check.
 */
// Registers the jest-dom matchers on Vitest's `expect` and declares them to
// TypeScript in one import, so `toBeInTheDocument()` & co. typecheck everywhere.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { webcrypto } from "node:crypto";

if (typeof window !== "undefined") {
  // jsdom ships no SubtleCrypto; the app's whole crypto layer needs a real one.
  if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: webcrypto,
    });
  }

  // Radix primitives measure and observe their triggers/content.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  globalThis.IntersectionObserver ??= class {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: readonly number[] = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;

  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;

  // Pointer capture + scrollIntoView are used by Radix Select/Popover and are
  // not implemented by jsdom.
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};

  window.scrollTo ??= () => {};
  URL.createObjectURL ??= () => "blob:zefer-test";
  URL.revokeObjectURL ??= () => {};
}

afterEach(() => {
  if (typeof window !== "undefined") cleanup();
});

/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { analyzeDevice, formatBytes } from "../device";

const GB = 1024 * 1024 * 1024;
const MB = 1024 * 1024;

const DESKTOP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";

interface NavStub {
  userAgent?: string;
  platform?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  userAgentData?: unknown;
}

function stubNavigator(nav: NavStub | undefined) {
  vi.stubGlobal("navigator", nav);
}

/** Replaces canvas.getContext so WebGL detection is deterministic under jsdom. */
function stubCanvas(impl: (type: string) => unknown) {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    impl as unknown as typeof HTMLCanvasElement.prototype.getContext,
  );
}

/** A minimal WebGL context double. */
function fakeGl(opts: {
  ext?: boolean;
  renderer?: unknown;
  vendor?: unknown;
}) {
  const EXT_RENDERER = 0x9246;
  const EXT_VENDOR = 0x9245;
  return {
    RENDERER: 0x1f01,
    VENDOR: 0x1f00,
    getExtension: (name: string) =>
      opts.ext && name === "WEBGL_debug_renderer_info"
        ? { UNMASKED_RENDERER_WEBGL: EXT_RENDERER, UNMASKED_VENDOR_WEBGL: EXT_VENDOR }
        : null,
    getParameter: (p: number) =>
      p === EXT_RENDERER || p === 0x1f01 ? opts.renderer : opts.vendor,
  };
}

beforeEach(() => {
  // Default: no WebGL at all, so tests that do not care get { null, null }.
  stubCanvas(() => null);
  stubNavigator({ userAgent: DESKTOP_UA, platform: "Win32", hardwareConcurrency: 4 });
  vi.stubGlobal("performance", undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("formatBytes", () => {
  it("picks the right unit for every magnitude", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1023)).toBe("1023 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
    expect(formatBytes(512 * MB)).toBe("512 MB");
    expect(formatBytes(GB)).toBe("1.0 GB");
    expect(formatBytes(10 * GB)).toBe("10.0 GB");
  });
});

describe("analyzeDevice — GPU detection", () => {
  it("reads the unmasked strings when WEBGL_debug_renderer_info is available", () => {
    stubCanvas((type) =>
      type === "webgl2" ? fakeGl({ ext: true, renderer: "Apple M3 Pro", vendor: "Apple" }) : null,
    );
    const { profile } = analyzeDevice();
    expect(profile.gpu).toBe("Apple M3 Pro");
    expect(profile.gpuVendor).toBe("Apple");
  });

  it("falls back to webgl1 and the masked parameters without the extension", () => {
    stubCanvas((type) =>
      type === "webgl2" ? null : fakeGl({ ext: false, renderer: "ANGLE", vendor: "Google Inc." }),
    );
    const { profile } = analyzeDevice();
    expect(profile.gpu).toBe("ANGLE");
    expect(profile.gpuVendor).toBe("Google Inc.");
  });

  it("returns nulls when the parameters are not strings", () => {
    stubCanvas(() => fakeGl({ ext: true, renderer: 1234, vendor: null }));
    const { profile } = analyzeDevice();
    expect(profile.gpu).toBeNull();
    expect(profile.gpuVendor).toBeNull();
  });

  it("returns nulls when no WebGL context can be created", () => {
    stubCanvas(() => null);
    const { profile } = analyzeDevice();
    expect(profile.gpu).toBeNull();
    expect(profile.gpuVendor).toBeNull();
  });

  it("swallows a throwing canvas implementation", () => {
    stubCanvas(() => {
      throw new Error("context lost");
    });
    const { profile } = analyzeDevice();
    expect(profile.gpu).toBeNull();
    expect(profile.gpuVendor).toBeNull();
  });
});

describe("analyzeDevice — CPU architecture", () => {
  const flush = () => new Promise((r) => setTimeout(r, 0));

  it("stays null when userAgentData is unavailable", async () => {
    const { profile } = analyzeDevice();
    await flush();
    expect(profile.cpuArch).toBeNull();
  });

  it("fills in the architecture reported by userAgentData", async () => {
    stubNavigator({
      userAgent: DESKTOP_UA,
      platform: "Win32",
      hardwareConcurrency: 8,
      userAgentData: {
        getHighEntropyValues: async () => ({ architecture: "arm", platform: "macOS" }),
      },
    });
    const { profile } = analyzeDevice();
    await flush();
    expect(profile.cpuArch).toBe("arm");
  });

  it("stays null when the hint set omits the architecture", async () => {
    stubNavigator({
      userAgent: DESKTOP_UA,
      platform: "Win32",
      hardwareConcurrency: 8,
      userAgentData: { getHighEntropyValues: async () => ({}) },
    });
    const { profile } = analyzeDevice();
    await flush();
    expect(profile.cpuArch).toBeNull();
  });

  it("stays null when the high-entropy request is rejected", async () => {
    stubNavigator({
      userAgent: DESKTOP_UA,
      platform: "Win32",
      hardwareConcurrency: 8,
      userAgentData: {
        getHighEntropyValues: async () => {
          throw new Error("NotAllowedError");
        },
      },
    });
    const { profile } = analyzeDevice();
    await flush();
    expect(profile.cpuArch).toBeNull();
  });
});

describe("analyzeDevice — profile fields", () => {
  it("reads heap figures from performance.memory", () => {
    vi.stubGlobal("performance", {
      memory: { jsHeapSizeLimit: 4 * GB, usedJSHeapSize: 12 * MB, totalJSHeapSize: 64 * MB },
    });
    const { profile } = analyzeDevice();
    expect(profile.heapLimit).toBe(4 * GB);
    expect(profile.heapUsed).toBe(12 * MB);
    expect(profile.heapTotal).toBe(64 * MB);
  });

  it("normalizes zeroed heap figures to null", () => {
    vi.stubGlobal("performance", {
      memory: { jsHeapSizeLimit: 0, usedJSHeapSize: 0, totalJSHeapSize: 0 },
    });
    const { profile } = analyzeDevice();
    expect(profile.heapLimit).toBeNull();
    expect(profile.heapUsed).toBeNull();
    expect(profile.heapTotal).toBeNull();
  });

  it("leaves heap figures null when performance exposes no memory object", () => {
    vi.stubGlobal("performance", {});
    const { profile } = analyzeDevice();
    expect(profile.heapLimit).toBeNull();
  });

  it("falls back to safe defaults with no navigator and no performance at all", () => {
    stubNavigator(undefined);
    vi.stubGlobal("performance", undefined);
    const { profile, maxFileSize } = analyzeDevice();

    expect(profile.cores).toBe(2);
    expect(profile.ram).toBe(0);
    expect(profile.platform).toBe("unknown");
    expect(profile.userAgent).toBe("");
    expect(profile.mobile).toBe(false);
    expect(profile.heapLimit).toBeNull();
    // ram 0 + 2 cores -> core-only tier
    expect(maxFileSize).toBe(1 * GB);
  });

  it("defaults a zero core count to 2", () => {
    stubNavigator({ userAgent: DESKTOP_UA, platform: "Linux", hardwareConcurrency: 0 });
    expect(analyzeDevice().profile.cores).toBe(2);
  });

  it("labels the limit with formatBytes", () => {
    stubNavigator({
      userAgent: DESKTOP_UA,
      platform: "Win32",
      hardwareConcurrency: 4,
      deviceMemory: 64,
    });
    const { maxFileSize, maxFileSizeLabel } = analyzeDevice();
    expect(maxFileSize).toBe(10 * GB);
    expect(maxFileSizeLabel).toBe("10.0 GB");
  });
});

function limitFor(userAgent: string, deviceMemory: number, hardwareConcurrency: number) {
  stubNavigator({ userAgent, platform: "Win32", hardwareConcurrency, deviceMemory });
  return analyzeDevice().maxFileSize;
}

describe("analyzeDevice — mobile tiers", () => {
  it.each([
    [8, 1.5 * GB],
    [6, 1.5 * GB],
    [4, 1 * GB],
    [2, 512 * MB],
    [1, 256 * MB],
    [0, 256 * MB],
  ])("reports %i GB of RAM as a %i byte limit", (ram, expected) => {
    expect(limitFor(MOBILE_UA, ram, 6)).toBe(expected);
  });

  it("detects mobile from the user agent", () => {
    stubNavigator({ userAgent: MOBILE_UA, platform: "iPhone", hardwareConcurrency: 6 });
    expect(analyzeDevice().profile.mobile).toBe(true);
  });
});

describe("analyzeDevice — desktop tiers", () => {
  it.each([
    // [deviceMemory, cores, expected]
    [64, 4, 10 * GB],   // verified high-memory workstation
    [32, 20, 10 * GB],
    [32, 8, 8 * GB],
    [16, 16, 8 * GB],
    [16, 4, 6 * GB],
    [8, 24, 10 * GB],   // clamped-8 workstation
    [8, 16, 6 * GB],
    [8, 12, 4 * GB],
    [8, 8, 3 * GB],
    [8, 4, 2 * GB],
    [4, 8, 2 * GB],
    [4, 2, 1 * GB],
    [2, 8, 512 * MB],
    [0, 16, 4 * GB],    // no deviceMemory API -> core-only tiers
    [0, 8, 2 * GB],
    [0, 4, 1 * GB],
  ])("maps %i GB / %i cores to the expected limit", (ram, cores, expected) => {
    expect(limitFor(DESKTOP_UA, ram, cores)).toBe(expected);
  });
});

/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { t } from "@/app/lib/i18n";

// The PBKDF2 benchmark is the one thing on this page that is neither
// `navigator` nor markup, so it is the one thing stubbed.
const benchmark = vi.hoisted(() => ({ run: vi.fn<() => Promise<number>>() }));
vi.mock("@/app/lib/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/app/lib/crypto")>()),
  benchmarkDevice: () => benchmark.run(),
}));

type Hardware = {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  userAgent: string;
  platform: string;
  memory?: { jsHeapSizeLimit: number; usedJSHeapSize: number; totalJSHeapSize: number };
  gpu?: { renderer: string; vendor: string };
};

const originalGetContext = HTMLCanvasElement.prototype.getContext;

/** Pins every hardware signal `analyzeDevice()` reads. */
function stubHardware({ deviceMemory, hardwareConcurrency, userAgent, platform, memory, gpu }: Hardware) {
  const define = (key: string, value: unknown) =>
    Object.defineProperty(navigator, key, { configurable: true, value });
  define("deviceMemory", deviceMemory);
  define("hardwareConcurrency", hardwareConcurrency);
  define("userAgent", userAgent);
  define("platform", platform);
  Object.defineProperty(performance, "memory", { configurable: true, value: memory });

  HTMLCanvasElement.prototype.getContext = ((kind: string) =>
    kind === "webgl2" && gpu
      ? {
          RENDERER: 0x1f01,
          VENDOR: 0x1f00,
          getExtension: () => null,
          getParameter: (p: number) => (p === 0x1f01 ? gpu.renderer : gpu.vendor),
        }
      : null) as unknown as typeof originalGetContext;
}

/** Fresh modules per test: the hardware profile is memoised at module scope. */
async function loadPage() {
  vi.resetModules();
  const { LanguageProvider } = await import("../LanguageProvider");
  const { default: DeviceContent } = await import("../DeviceContent");
  return (
    <LanguageProvider>
      <DeviceContent />
    </LanguageProvider>
  );
}

/** Reads the live-detection table as label -> value pairs. */
function readReadings() {
  return Object.fromEntries(
    within(screen.getAllByRole("table")[0])
      .getAllByRole("row")
      .map((row) => {
        const cells = within(row).getAllByRole("cell");
        return [cells[0].textContent, cells[1].textContent];
      })
  );
}

describe("DeviceContent", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, "language", { configurable: true, value: "en-US" });
    benchmark.run.mockReset();
    benchmark.run.mockResolvedValue(0);
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    Reflect.deleteProperty(performance, "memory");
    vi.restoreAllMocks();
  });

  it("reports every reading a fully instrumented mobile device exposes", async () => {
    stubHardware({
      deviceMemory: 8,
      hardwareConcurrency: 10,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      platform: "iPhone",
      memory: { jsHeapSizeLimit: 4 * 1024 * 1024 * 1024, usedJSHeapSize: 5 * 1024 * 1024, totalJSHeapSize: 9 * 1024 * 1024 },
      gpu: { renderer: "Apple A17 GPU", vendor: "Apple Inc." },
    });
    benchmark.run.mockResolvedValue(42.7);
    render(await loadPage());

    await waitFor(() => expect(readReadings()["PBKDF2 (100k iter.)"]).toBe("43 ms"));
    expect(readReadings()).toMatchObject({
      "CPU Cores": "10",
      "GPU Renderer": "Apple A17 GPU",
      "GPU Vendor": "Apple Inc.",
      [t("device.type", "en")]: "Mobile",
      [t("devicepage.platform", "en")]: "iPhone",
      "JS Heap Limit": "4.0 GB",
      "JS Heap Total": "9 MB",
    });
    expect(readReadings()[`RAM (${t("devicepage.reported", "en")})`]).toBe("8 GB");
    expect(readReadings()[`JS Heap (${t("devicepage.used", "en")})`]).toBe("5 MB");
    expect(screen.getByText(t("devicepage.maxfile", "en"))).toBeInTheDocument();
    expect(screen.queryByText(t("devicepage.detecting", "en"))).not.toBeInTheDocument();
  });

  it("marks every unavailable reading as N/A on a bare browser", async () => {
    stubHardware({ userAgent: "", platform: "" });
    benchmark.run.mockRejectedValue(new Error("no subtle crypto"));
    render(await loadPage());

    const rows = readReadings();
    expect(rows).toMatchObject({
      "CPU Cores": "2",
      "CPU Architecture": "N/A",
      "GPU Renderer": "N/A",
      "GPU Vendor": "N/A",
      "User Agent": "N/A",
      "JS Heap Limit": "N/A",
      "JS Heap Total": "N/A",
      [t("device.type", "en")]: "Desktop",
      [t("devicepage.platform", "en")]: "unknown",
      "PBKDF2 (100k iter.)": "N/A",
    });
    expect(rows[`RAM (${t("devicepage.reported", "en")})`]).toBe("N/A");
    // The rejected benchmark is swallowed: the row simply stays N/A.
    await waitFor(() => expect(benchmark.run).toHaveBeenCalledTimes(1));
    expect(readReadings()["PBKDF2 (100k iter.)"]).toBe("N/A");
  });

  it("explains the formula, the data sources and the optimization tips", async () => {
    stubHardware({ deviceMemory: 16, hardwareConcurrency: 8, userAgent: "Chrome", platform: "Win32" });
    render(await loadPage());

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(t("devicepage.title", "en"));
    expect(screen.getByText(t("devicepage.formula.desc", "en"))).toBeInTheDocument();
    expect(screen.getByText("navigator.deviceMemory")).toBeInTheDocument();
    expect(screen.getByText("WEBGL_debug_renderer_info")).toBeInTheDocument();

    // One tips card per browser, one bullet per "|" separated tip.
    expect(screen.getByRole("heading", { level: 3, name: "Chrome / Edge" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: t("devicepage.optimize.general.title", "en") })).toBeInTheDocument();
    const firstTip = t("devicepage.optimize.chrome", "en").split("|")[0];
    expect(screen.getByText(firstTip)).toBeInTheDocument();

    expect(screen.getByText(t("devicepage.na.desc", "en"))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(t("how.cta", "en"), "i") })).toHaveAttribute("href", "/");
  });

  it("renders a detecting placeholder on the server, where no hardware is readable", async () => {
    stubHardware({ deviceMemory: 4, hardwareConcurrency: 4, userAgent: "Chrome", platform: "Win32" });

    const html = renderToString(await loadPage());

    expect(html).toContain(t("devicepage.detecting", "en"));
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain("GPU Renderer");
  });
});

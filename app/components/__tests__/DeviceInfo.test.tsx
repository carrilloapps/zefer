/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "../LanguageProvider";
import DeviceInfo from "../DeviceInfo";
import type { DeviceLimits, DeviceProfile } from "@/app/lib/device";
import { t } from "@/app/lib/i18n";

const FULL: DeviceProfile = {
  ram: 16,
  cores: 12,
  gpu: "Apple M3 Pro",
  gpuVendor: "Apple",
  cpuArch: "arm",
  platform: "MacIntel",
  platformVersion: "14.0",
  userAgent: "test-agent",
  mobile: true,
  heapLimit: 4 * 1024 * 1024 * 1024,
  heapUsed: 2 * 1024 * 1024,
  heapTotal: 8 * 1024 * 1024,
};

const EMPTY: DeviceProfile = {
  ...FULL,
  ram: 0,
  cores: 2,
  gpu: null,
  gpuVendor: null,
  cpuArch: null,
  platform: "",
  mobile: false,
  heapLimit: null,
  heapUsed: null,
  heapTotal: null,
};

function limitsOf(profile: DeviceProfile): DeviceLimits {
  return { maxFileSize: 2048, maxFileSizeLabel: "2.0 GB", profile };
}

function renderInfo(profile: DeviceProfile) {
  return render(
    <LanguageProvider>
      <DeviceInfo limits={limitsOf(profile)} />
    </LanguageProvider>
  );
}

/** Reads the details table as label -> value pairs. */
function readRows() {
  return Object.fromEntries(
    within(screen.getByRole("table"))
      .getAllByRole("row")
      .map((row) => {
        const cells = within(row).getAllByRole("cell");
        return [cells[0].textContent, cells[1].textContent];
      })
  );
}

describe("DeviceInfo", () => {
  it("starts collapsed, showing only the file-size limit", () => {
    renderInfo(FULL);

    const toggle = screen.getByRole("button", { name: t("aria.showdetails", "en") });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(t("device.limit", "en"))).toBeInTheDocument();
    expect(screen.getByText("2.0 GB")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("expands into the full hardware table and collapses again", async () => {
    const user = userEvent.setup();
    renderInfo(FULL);

    await user.click(screen.getByRole("button", { name: t("aria.showdetails", "en") }));

    const collapse = screen.getByRole("button", { name: t("aria.hidedetails", "en") });
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    expect(readRows()).toMatchObject({
      CPU: "12 cores (arm)",
      RAM: "16 GB",
      GPU: "Apple M3 Pro",
      "GPU Vendor": "Apple",
      "JS Heap Limit": "4.0 GB",
      "JS Heap (used)": "2 MB",
      [t("device.type", "en")]: "Mobile",
      Platform: "MacIntel",
    });
    expect(screen.getByRole("link", { name: /learn|más|mais|conoce/i })).toHaveAttribute("href", "/device");
    expect(screen.getByText(t("device.disclaimer", "en"))).toBeInTheDocument();

    await user.click(collapse);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("marks every unavailable reading as N/A", async () => {
    const user = userEvent.setup();
    renderInfo(EMPTY);

    await user.click(screen.getByRole("button", { name: t("aria.showdetails", "en") }));

    expect(readRows()).toMatchObject({
      CPU: "2 cores",
      RAM: "N/A",
      GPU: "N/A",
      "GPU Vendor": "N/A",
      "JS Heap Limit": "N/A",
      "JS Heap (used)": "N/A",
      [t("device.type", "en")]: "Desktop",
      Platform: "N/A",
    });
    expect(screen.getAllByText("N/A")).toHaveLength(6);
  });
});

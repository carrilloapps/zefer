/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import CryptoProgress from "../CryptoProgress";
import type { ProgressState } from "@/app/lib/progress";
import { t } from "@/app/lib/i18n";

function renderProgress(state: ProgressState, mode: "encrypt" | "decrypt") {
  return render(
    <LanguageProvider>
      <CryptoProgress state={state} mode={mode} />
    </LanguageProvider>
  );
}

describe("CryptoProgress", () => {
  it("renders a native progress element with the rounded value and its label", () => {
    renderProgress({ stage: "encrypting", percent: 42.6, label: "progress.encrypting" }, "encrypt");

    const bar = screen.getByRole("progressbar", { name: t("progress.encrypting", "en") });
    expect(bar.tagName).toBe("PROGRESS");
    expect(bar).toHaveClass("crypto-progress");
    expect(bar).not.toHaveClass("crypto-progress-done");
    expect(bar).toHaveValue(43);
    expect(bar).toHaveAttribute("max", "100");
    expect(bar).toHaveTextContent("43%");
  });

  it("announces stage and percentage on a polite status region", () => {
    renderProgress({ stage: "deriving", percent: 10, label: "progress.deriving" }, "encrypt");

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-label", `${t("progress.deriving", "en")} 10%`);
    expect(status).toHaveClass("glow-pulse");
    expect(status).not.toHaveClass("glow-green");
  });

  it("switches to the done styling once the stage is done", () => {
    renderProgress({ stage: "done", percent: 100, label: "progress.done" }, "decrypt");

    expect(screen.getByRole("progressbar")).toHaveClass("crypto-progress-done");
    expect(screen.getByRole("status")).toHaveClass("glow-green");
    expect(screen.getAllByText("100%").length).toBeGreaterThan(0);
  });

  it("renders a different stage icon per mode", () => {
    const state: ProgressState = { stage: "decrypting", percent: 5, label: "progress.decrypting" };
    const { container, rerender } = renderProgress(state, "decrypt");
    const unlockIcon = container.querySelector("svg.lucide")?.getAttribute("class");

    rerender(
      <LanguageProvider>
        <CryptoProgress state={{ ...state, stage: "encrypting", label: "progress.encrypting" }} mode="encrypt" />
      </LanguageProvider>
    );
    expect(container.querySelector("svg.lucide")?.getAttribute("class")).not.toBe(unlockIcon);
  });

  it("passes a raw, non-translatable label straight through", () => {
    renderProgress({ stage: "packaging", percent: 0, label: "chunk 3/9" }, "encrypt");

    expect(screen.getByRole("progressbar", { name: "chunk 3/9" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "chunk 3/9 0%");
  });
});

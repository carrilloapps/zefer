/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { render, act, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { ThemeProvider, useTheme } from "../ThemeProvider";
import ToastProvider from "../ToastProvider";

function ThemeSwitch() {
  const { toggleTheme } = useTheme();
  return <button type="button" onClick={toggleTheme}>switch theme</button>;
}

/** sonner only mounts its list once a toast is queued. */
async function mountWithToast(message: string) {
  render(
    <ThemeProvider>
      <ToastProvider />
      <ThemeSwitch />
    </ThemeProvider>
  );
  toast(message);
  return waitFor(() => {
    const list = document.querySelector<HTMLElement>("[data-sonner-toaster]");
    if (!list) throw new Error("sonner never mounted its toast list");
    return list;
  });
}

describe("ToastProvider", () => {
  it("anchors toasts bottom-right and paints them from theme variables", async () => {
    const list = await mountWithToast("File encrypted");

    expect(list).toHaveAttribute("data-sonner-theme", "dark");
    expect(list).toHaveAttribute("data-y-position", "bottom");
    expect(list).toHaveAttribute("data-x-position", "right");
    expect(screen.getByText("File encrypted")).toBeInTheDocument();

    const item = list.querySelector<HTMLElement>("[data-sonner-toast]");
    expect(item).toHaveClass("glass-nav", "!rounded-xl", "!text-xs", "!theme-text");
    const style = item?.getAttribute("style") ?? "";
    expect(style).toContain("var(--nav-bg)");
    expect(style).toContain("var(--glass-border)");
    expect(style).toContain("var(--text)");

    expect(item).toHaveAttribute("data-rich-colors", "true");
    expect(list.querySelector("[data-close-button]")).toBeInTheDocument();
  });

  it("re-themes live when the app theme changes", async () => {
    const list = await mountWithToast("Key copied");
    expect(list).toHaveAttribute("data-sonner-theme", "dark");

    await act(async () => {
      screen.getAllByRole("button", { name: "switch theme" })[0].click();
      await Promise.resolve();
    });

    expect(document.querySelector("[data-sonner-toaster]")).toHaveAttribute("data-sonner-theme", "light");
  });
});

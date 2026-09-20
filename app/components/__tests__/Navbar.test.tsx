/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "../LanguageProvider";
import { ThemeProvider } from "../ThemeProvider";
import Navbar from "../Navbar";
import { t } from "@/app/lib/i18n";

function renderNavbar() {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    </LanguageProvider>
  );
}

const mobileHeader = () => document.querySelector(".nav-mobile-header") as HTMLElement;

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
  fireEvent.scroll(window);
}

/** Opens the drawer from the burger. */
async function openDrawer() {
  await act(async () => { screen.getByRole("button", { name: t("nav.menu", "en") }).click(); });
  return screen.findByRole("dialog");
}

describe("Navbar", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    Object.defineProperty(navigator, "language", { configurable: true, value: "en-US" });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the desktop navigation with every top-level destination", () => {
    renderNavbar();

    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(expect.arrayContaining(["/", "/how", "/generator", "/analyzer", "/mcp", "/install"]));
    expect(screen.getByRole("link", { name: /how|cómo|como|funciona|steps|works/i })).toHaveAttribute("href", "/how");
    expect(screen.getByText(t("nav.encrypted", "en"))).toBeInTheDocument();
  });

  it("elevates the mobile header only once the page is scrolled", async () => {
    renderNavbar();
    expect(mobileHeader()).not.toHaveClass("nav-elevated");

    await scrollTo(24);
    expect(mobileHeader()).toHaveClass("nav-elevated");

    await scrollTo(4);
    expect(mobileHeader()).not.toHaveClass("nav-elevated");
  });

  it("stops listening for scroll after unmount", async () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderNavbar();
    unmount();

    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
  });

  it("opens the drawer from the burger and elevates the header while open", async () => {
    renderNavbar();

    const drawer = await openDrawer();
    expect(drawer).toHaveAccessibleName(t("nav.menu", "en"));
    expect(drawer).toHaveAccessibleDescription(t("nav.tools", "en"));
    expect(mobileHeader()).toHaveClass("nav-elevated");

    // The drawer carries its own brand row and its own close control.
    expect(within(drawer).getByRole("button", { name: t("nav.close", "en") })).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: t("encrypt.title", "en") })).toHaveAttribute("href", "/?t=encrypt");
    expect(within(drawer).getByText(t("install.coming", "en"))).toBeInTheDocument();
    expect(within(drawer).getByText(`© ${new Date().getFullYear()} José Carrillo`)).toBeInTheDocument();
  });

  it("closes the drawer from its close button", async () => {
    renderNavbar();
    const drawer = await openDrawer();

    await act(async () => { within(drawer).getByRole("button", { name: t("nav.close", "en") }).click(); });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(mobileHeader()).not.toHaveClass("nav-elevated");
  });

  it("closes the drawer when a destination is followed", async () => {
    renderNavbar();
    const drawer = await openDrawer();

    await act(async () => { within(drawer).getByRole("link", { name: t("nav.device", "en") }).click(); });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("expands the project accordion inside the drawer and resets it on close", async () => {
    renderNavbar();
    const drawer = await openDrawer();

    const accordion = within(drawer).getByRole("button", { name: t("nav.dev", "en") });
    expect(accordion).toHaveAttribute("aria-expanded", "false");
    expect(accordion).toHaveAttribute("aria-controls", "drawer-project-group");
    expect(within(drawer).queryByRole("link", { name: t("nav.projectinfo", "en") })).not.toBeInTheDocument();

    await act(async () => { accordion.click(); });
    expect(accordion).toHaveAttribute("aria-expanded", "true");
    expect(within(drawer).getByRole("link", { name: t("nav.projectinfo", "en") })).toHaveAttribute("href", "/project");
    const author = within(drawer).getByRole("link", { name: t("nav.author", "en") });
    expect(author).toHaveAttribute("href", "https://github.com/carrilloapps");
    expect(author).toHaveAttribute("rel", "noopener noreferrer");

    // Following the author link closes the drawer...
    await act(async () => { author.click(); });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    // ...and the accordion starts collapsed again next time.
    const reopened = await openDrawer();
    expect(within(reopened).getByRole("button", { name: t("nav.dev", "en") })).toHaveAttribute("aria-expanded", "false");
  });

  it("collapses the project accordion again on a second press", async () => {
    renderNavbar();
    const drawer = await openDrawer();
    const accordion = within(drawer).getByRole("button", { name: t("nav.dev", "en") });

    await act(async () => { accordion.click(); });
    await act(async () => { accordion.click(); });

    expect(accordion).toHaveAttribute("aria-expanded", "false");
    expect(within(drawer).queryByRole("link", { name: t("nav.projectinfo", "en") })).not.toBeInTheDocument();
  });

  it("asks the shortcuts overlay to open from the desktop keyboard button", async () => {
    renderNavbar();
    const seen = vi.fn();
    window.addEventListener("zefer:toggle-shortcuts", seen);

    await act(async () => { screen.getByRole("button", { name: t("aria.shortcuts", "en") }).click(); });

    expect(seen).toHaveBeenCalledTimes(1);
    window.removeEventListener("zefer:toggle-shortcuts", seen);
  });

  it("opens the desktop project menu with the keyboard", async () => {
    const user = userEvent.setup();
    renderNavbar();

    const trigger = screen.getByRole("button", { name: t("nav.dev", "en") });
    trigger.focus();
    await user.keyboard("{Enter}");

    const items = await screen.findAllByRole("menuitem");
    expect(items.map((i) => i.getAttribute("href"))).toEqual(["/project", "https://github.com/carrilloapps"]);

    await user.keyboard("{Escape}");
    expect(screen.queryAllByRole("menuitem")).toHaveLength(0);
    expect(trigger).toHaveFocus();
  });
});

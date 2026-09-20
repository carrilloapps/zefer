/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "../LanguageProvider";
import InstallContent from "../InstallContent";
import { t } from "@/app/lib/i18n";

/** jsdom ships no Clipboard API, and user-event installs its own stub on
 *  setup() — so the spy is (re)installed after the session is created. */
const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
function stubClipboard() {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
}
stubClipboard();

const API_AUTHOR = {
  name: "José Carrillo",
  avatar: "https://avatars.githubusercontent.com/u/1?v=4",
  bio: "Senior Fullstack Developer",
};

const fetchMock = vi.fn();

function renderPage() {
  return render(
    <LanguageProvider>
      <InstallContent />
    </LanguageProvider>
  );
}

const BINARY_BASE = "https://github.com/carrilloapps/zefer-cli/releases/latest/download";

describe("InstallContent", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    writeText.mockClear();
    fetchMock.mockResolvedValue({ json: () => Promise.resolve(API_AUTHOR) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the hero, the web CTA and the feature strip", async () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(t("install.title", "en"));
    expect(screen.getByText(t("install.desc", "en"))).toBeInTheDocument();
    expect(screen.getByText(t("install.web.desc", "en"))).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: new RegExp(t("install.web.cta", "en")) })
    ).toHaveAttribute("href", "/");
    for (const k of [
      "install.feat.encryption",
      "install.feat.zeroknowledge",
      "install.feat.dualkey",
      "install.feat.expiration",
      "install.feat.browser",
      "install.feat.free",
    ] as const) {
      expect(screen.getByText(t(k, "en"))).toBeInTheDocument();
    }
    await screen.findByRole("img", { name: "José Carrillo" });
  });

  it("keeps a single h1 and no heading deeper than h2", async () => {
    renderPage();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2s).toContain(t("install.usage.pwa.title", "en"));
    expect(h2s).toContain(t("install.cli.title", "en"));
    expect(h2s).toContain(t("install.native.title", "en"));
    expect(h2s).toContain(t("install.guides.title", "en"));
    expect(h2s).toContain(t("install.compare.title", "en"));
    await screen.findByRole("img", { name: "José Carrillo" });
  });

  it("marks every native app as coming soon", async () => {
    renderPage();
    for (const name of ["Windows", "macOS", "Linux", "iOS", "Android"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getAllByText(t("install.coming", "en"))).toHaveLength(5);
    await screen.findByRole("img", { name: "José Carrillo" });
  });

  it("renders icon-led doc links and badge-led comparison links", async () => {
    renderPage();
    const guide = screen.getByRole("link", { name: new RegExp(t("install.guides.usage", "en")) });
    expect(guide).toHaveAttribute("href", "/install/guide");
    expect(guide.querySelector("svg")).not.toBeNull();
    expect(
      screen.getByRole("link", { name: new RegExp(t("install.usage.selfhost.title", "en")) })
    ).toHaveAttribute("href", "/install/guide#selfhost");
    expect(
      screen.getByRole("link", { name: new RegExp(t("install.usage.url.title", "en")) })
    ).toHaveAttribute("href", "/install/guide#url");

    const vs: [string, string, string][] = [
      ["Hat.sh", "/vs/hat-sh", "H"],
      ["Picocrypt", "/vs/picocrypt", "P"],
      ["Bitwarden Send", "/vs/bitwarden-send", "B"],
      ["Cryptomator", "/vs/cryptomator", "C"],
      ["VeraCrypt", "/vs/veracrypt", "V"],
    ];
    for (const [name, href, initial] of vs) {
      const link = screen.getByRole("link", { name: new RegExp(`Zefer vs ${name.replace(".", "\\.")}`) });
      expect(link).toHaveAttribute("href", href);
      // Badge links render an initial instead of an icon.
      expect(within(link).getByText(initial)).toBeInTheDocument();
    }
    await screen.findByRole("img", { name: "José Carrillo" });
  });

  it("renders the author card from /api/author, with the social row", async () => {
    renderPage();
    expect(fetchMock).toHaveBeenCalledWith("/api/author");
    const avatar = await screen.findByRole("img", { name: "José Carrillo" });
    expect(avatar.getAttribute("src")).toContain(encodeURIComponent(API_AUTHOR.avatar));
    expect(screen.getByText("Senior Fullstack Developer")).toBeInTheDocument();
    // Scope to the author card — the CLI section links to GitHub too.
    const card = avatar.closest("div.glass") as HTMLElement;
    for (const [label, href] of [
      ["GitHub", "https://github.com/carrilloapps"],
      ["Blog", "https://carrillo.app"],
      ["LinkedIn", "https://linkedin.com/in/carrilloapps"],
      ["X", "https://x.com/carrilloapps"],
      ["Telegram", "https://t.me/carrilloapps"],
    ] as const) {
      const link = within(card).getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("shows a shimmer placeholder until the profile resolves", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.queryByRole("img")).toBeNull();
    expect(document.querySelector(".skeleton-shimmer")).not.toBeNull();
    expect(screen.getAllByText("...")).toHaveLength(2);
  });

  it("falls back to the bundled author when /api/author fails", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    renderPage();
    const avatar = await screen.findByRole("img", { name: "Jose Carrillo" });
    expect(avatar.getAttribute("src")).toContain(
      encodeURIComponent("https://github.com/carrilloapps.png")
    );
    expect(screen.getByText("Senior Fullstack Developer & Tech Lead")).toBeInTheDocument();
  });
});

describe("InstallContent — PWA accordion", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ json: () => Promise.resolve(API_AUTHOR) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it("starts fully collapsed and exposes one control per browser", async () => {
    renderPage();
    for (const name of ["Chrome / Edge", "Safari (iOS / macOS)", "Firefox (Android)"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute("aria-expanded", "false");
    }
    await screen.findByRole("img", { name: "José Carrillo" });
  });

  it("opens one browser at a time and closes it on a second press", async () => {
    const user = userEvent.setup();
    renderPage();
    const chrome = screen.getByRole("button", { name: "Chrome / Edge" });
    const safari = screen.getByRole("button", { name: "Safari (iOS / macOS)" });

    await user.click(chrome);
    expect(chrome).toHaveAttribute("aria-expanded", "true");
    expect(chrome.nextElementSibling?.className).toContain("advanced-open");

    // Switching browsers moves the open panel.
    await user.click(safari);
    expect(chrome).toHaveAttribute("aria-expanded", "false");
    expect(safari).toHaveAttribute("aria-expanded", "true");

    // Pressing the open one again collapses everything.
    await user.click(safari);
    expect(safari).toHaveAttribute("aria-expanded", "false");
    expect(safari.nextElementSibling?.className).not.toContain("advanced-open");
  });

  it("renders each browser's numbered steps and menu path", async () => {
    renderPage();
    for (const k of [
      "install.pwa.chrome.1",
      "install.pwa.chrome.2",
      "install.pwa.chrome.3",
      "install.pwa.safari.1",
      "install.pwa.safari.2",
      "install.pwa.safari.3",
      "install.pwa.firefox.1",
      "install.pwa.firefox.2",
    ] as const) {
      expect(screen.getByText(t(k, "en"))).toBeInTheDocument();
    }
    expect(
      screen.getByText(`zefer.carrillo.app → ↑ Share → ${t("install.pwa.safari.menu", "en")}`)
    ).toBeInTheDocument();
    await screen.findByRole("img", { name: "José Carrillo" });
  });
});

describe("InstallContent — CLI section", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    writeText.mockClear();
    fetchMock.mockResolvedValue({ json: () => Promise.resolve(API_AUTHOR) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it("offers a download and an expandable recipe per platform", async () => {
    const user = userEvent.setup();
    renderPage();
    const platforms: [string, string][] = [
      ["Linux — x64", "zefer-linux-x64"],
      ["Linux — ARM64", "zefer-linux-arm64"],
      ["macOS — Intel", "zefer-macos-x64"],
      ["macOS — Apple Silicon", "zefer-macos-arm64"],
      ["Windows — x64", "zefer-win-x64.exe"],
    ];
    for (const [label, file] of platforms) {
      const trigger = screen.getByRole("button", { name: new RegExp(label) });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(within(trigger).getByRole("link")).toHaveAttribute("href", `${BINARY_BASE}/${file}`);
    }

    const linux = screen.getByRole("button", { name: /Linux — x64/ });
    await user.click(linux);
    expect(linux).toHaveAttribute("aria-expanded", "true");
    await user.click(linux);
    expect(linux).toHaveAttribute("aria-expanded", "false");
  });

  it("does not toggle the panel when the nested download link is used", async () => {
    // jsdom cannot navigate; swallow the default in the capture phase (the
    // handler under test stops propagation, so a bubble listener never runs).
    const swallow = (e: Event) => e.preventDefault();
    document.addEventListener("click", swallow, true);
    try {
      const user = userEvent.setup();
      renderPage();
      const trigger = screen.getByRole("button", { name: /macOS — Apple Silicon/ });
      const download = within(trigger).getByRole("link");
      await user.click(download);
      // The link stops the click from reaching the accordion's own handler.
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      // ...while the trigger itself still toggles.
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    } finally {
      document.removeEventListener("click", swallow, true);
    }
  });

  it("gives unix platforms a curl recipe and Windows a PowerShell one", async () => {
    renderPage();
    const code = Array.from(document.querySelectorAll("pre code"), (c) => c.textContent);
    const joined = code.join("\n");
    expect(joined).toContain(`curl -L ${BINARY_BASE}/zefer-linux-x64 -o zefer`);
    expect(joined).toContain("sudo mv zefer /usr/local/bin/zefer");
    expect(joined).toContain(`Invoke-WebRequest -Uri "${BINARY_BASE}/zefer-win-x64.exe" -OutFile zefer.exe`);
    // Only the Windows panel carries the PowerShell label and its caveat.
    expect(screen.getByText("PowerShell:")).toBeInTheDocument();
    expect(screen.getByText(t("install.cli.binary.win.desc", "en"))).toBeInTheDocument();
    // Unix install copy appears for the four non-Windows platforms.
    expect(screen.getAllByText(t("install.cli.binary.install", "en"))).toHaveLength(4);
    // Every platform gets a checksum command.
    expect(screen.getAllByText(t("install.cli.binary.checksum", "en"))).toHaveLength(5);
    expect(joined).toContain(`curl -L ${BINARY_BASE}/checksums.txt | grep zefer-win-x64.exe | sha256sum -c`);
    await screen.findByRole("img", { name: "José Carrillo" });
  });

  it("opens the npm option by default and collapses it on demand", async () => {
    const user = userEvent.setup();
    renderPage();
    const npm = screen.getByRole("button", { name: new RegExp(t("install.cli.npm.title", "en")) });
    expect(npm).toHaveAttribute("aria-expanded", "true");
    expect(npm.nextElementSibling?.className).toContain("advanced-open");
    await user.click(npm);
    expect(npm).toHaveAttribute("aria-expanded", "false");
    expect(npm.nextElementSibling?.className).not.toContain("advanced-open");
  });

  it("keeps the library option closed until it is opened", async () => {
    const user = userEvent.setup();
    renderPage();
    const lib = screen.getByRole("button", { name: new RegExp(t("install.cli.lib.title", "en")) });
    expect(lib).toHaveAttribute("aria-expanded", "false");
    await user.click(lib);
    expect(lib).toHaveAttribute("aria-expanded", "true");
    expect(lib.nextElementSibling?.className).toContain("advanced-open");
    expect(screen.getByText(t("install.cli.lib.desc", "en"))).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: new RegExp(t("install.cli.lib.more", "en")) })
    ).toHaveAttribute("href", "/library");
  });

  it("renders the npm steps, the npx shortcut and both import styles", async () => {
    renderPage();
    for (const k of [
      "install.cli.step1.title",
      "install.cli.step1.desc",
      "install.cli.step2.title",
      "install.cli.step3.title",
    ] as const) {
      expect(screen.getAllByText(t(k, "en")).length).toBeGreaterThan(0);
    }
    const joined = Array.from(document.querySelectorAll("pre code"), (c) => c.textContent).join("\n");
    expect(joined).toContain("npm install -g zefer-cli");
    expect(joined).toContain("zefer keygen --mode secure --length 64");
    expect(joined).toContain("npx zefer-cli encrypt report.pdf -p mypassword");
    expect(joined).toContain('import { encodeZefer, decodeZefer, generateWithOptions, analyzePassword } from "zefer-cli";');
    expect(joined).toContain('const { encodeZefer, analyzePassword } = require("zefer-cli");');
    await screen.findByRole("img", { name: "José Carrillo" });
  });

  it("copies a snippet and reverts the button after the confirmation window", async () => {
    const user = userEvent.setup();
    stubClipboard();
    renderPage();

    const [firstCopy] = screen.getAllByRole("button", { name: t("aria.copy", "en") });
    expect(firstCopy.querySelector("svg")?.getAttribute("class")).toContain("lucide-copy");

    await user.click(firstCopy);
    expect(writeText).toHaveBeenCalledWith(
      `curl -L ${BINARY_BASE}/zefer-linux-x64 -o zefer\nchmod +x zefer\nsudo mv zefer /usr/local/bin/zefer`
    );
    expect(firstCopy.querySelector("svg")?.getAttribute("class")).toContain("lucide-check");

    // The confirmation reverts on its own 1.8s later.
    await waitFor(
      () => expect(firstCopy.querySelector("svg")?.getAttribute("class")).toContain("lucide-copy"),
      { timeout: 4000 }
    );
  });

  it("links to the CLI repo and its npm package from the section header", async () => {
    renderPage();
    const header = screen
      .getByRole("heading", { level: 2, name: t("install.cli.title", "en") })
      .closest("div")?.parentElement as HTMLElement;
    expect(within(header).getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/carrilloapps/zefer-cli"
    );
    expect(within(header).getByRole("link", { name: "npm" })).toHaveAttribute(
      "href",
      "https://www.npmjs.com/package/zefer-cli"
    );
    expect(
      screen.getByRole("link", { name: t("install.cli.binary.releases", "en") })
    ).toHaveAttribute("href", "https://github.com/carrilloapps/zefer-cli/releases");
    await screen.findByRole("img", { name: "José Carrillo" });
  });
});

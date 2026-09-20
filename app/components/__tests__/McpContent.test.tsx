/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "../LanguageProvider";
import McpContent from "../McpContent";
import { t } from "@/app/lib/i18n";

/** jsdom ships no Clipboard API, and user-event installs its own stub on
 *  setup() — so the spy is (re)installed after the session is created. */
const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
function stubClipboard() {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}
stubClipboard();

function renderPage() {
  return render(
    <LanguageProvider>
      <McpContent />
    </LanguageProvider>
  );
}

/** The accordion trigger for one MCP client, by its visible name. */
function clientTrigger(name: string) {
  // A substring matcher function, not a built regex: client names carry `()`
  // and `/`, which would have to be escaped to be matched literally.
  return screen.getByRole("button", { name: (accessibleName) => accessibleName.includes(name) });
}

const CLIENT_NAMES = [
  "Claude Code",
  "Claude Desktop",
  "Cursor",
  "Windsurf",
  "VS Code (Copilot)",
  "Zed",
  "Otra herramienta / Other",
];

describe("McpContent", () => {
  beforeEach(() => {
    writeText.mockClear();
  });

  it("renders the hero, the explanation and the setup steps", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(t("mcp.title", "en"));
    expect(screen.getByText(t("mcp.subtitle", "en"))).toBeInTheDocument();
    expect(screen.getByText(t("mcp.what.desc", "en"))).toBeInTheDocument();
    expect(screen.getByText(t("mcp.setup.step1", "en"))).toBeInTheDocument();
    expect(screen.getByText(t("mcp.setup.step2", "en"))).toBeInTheDocument();
    const code = Array.from(document.querySelectorAll(".code-block code"), (c) => c.textContent).join("\n");
    expect(code).toContain("npm install -g zefer-cli");
    expect(code).toContain('"command": "zefer", "args": ["mcp"]');
    expect(code).toContain('"command": "npx", "args": ["-y", "zefer-cli", "mcp"]');
  });

  it("keeps a single h1 and no heading deeper than h2", () => {
    renderPage();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2s).toContain(t("mcp.clients.title", "en"));
    expect(h2s).toContain(t("mcp.tools.title", "en"));
    expect(h2s).toContain(t("mcp.detect.title", "en"));
  });

  it("exposes one expandable panel per client, with the first one open", () => {
    renderPage();
    for (const name of CLIENT_NAMES) expect(clientTrigger(name)).toBeInTheDocument();
    expect(clientTrigger("Claude Code")).toHaveAttribute("aria-expanded", "true");
    expect(clientTrigger("Claude Code")).toHaveAttribute("aria-controls", "mcp-client-0");
    expect(document.getElementById("mcp-client-0")).toBeInTheDocument();
    for (const name of CLIENT_NAMES.slice(1)) {
      expect(clientTrigger(name)).toHaveAttribute("aria-expanded", "false");
    }
    expect(document.getElementById("mcp-client-1")).toBeNull();
  });

  it("collapses the open panel when its own trigger is pressed again", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(clientTrigger("Claude Code"));
    expect(clientTrigger("Claude Code")).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("mcp-client-0")).toBeNull();
  });

  it("shows the global, npx and terminal variants for Claude Code", () => {
    renderPage();
    const panel = document.getElementById("mcp-client-0") as HTMLElement;
    expect(within(panel).getByText(t("mcp.client.claudecode", "en"))).toBeInTheDocument();
    expect(within(panel).getByText(t("mcp.setup.optionA", "en"))).toBeInTheDocument();
    expect(within(panel).getByText(t("mcp.setup.optionB", "en"))).toBeInTheDocument();
    expect(within(panel).getByText(t("mcp.client.orcli", "en"))).toBeInTheDocument();
    // No one-click deep link for this client.
    expect(within(panel).queryByText(t("mcp.client.oneclick", "en"))).toBeNull();
    const code = Array.from(panel.querySelectorAll(".code-block code"), (c) => c.textContent).join("\n");
    expect(code).toContain("claude mcp add zefer -- zefer mcp");
    expect(code).toContain("claude mcp add zefer -- npx -y zefer-cli mcp");
  });

  it("offers a Cursor deep link carrying the base64 npx server config", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(clientTrigger("Cursor"));
    expect(clientTrigger("Cursor")).toHaveAttribute("aria-expanded", "true");
    // Opening another panel closes the default one.
    expect(clientTrigger("Claude Code")).toHaveAttribute("aria-expanded", "false");

    const panel = document.getElementById("mcp-client-2") as HTMLElement;
    expect(within(panel).getByText(t("mcp.client.oneclick", "en"))).toBeInTheDocument();
    const deeplink = within(panel).getByRole("link", { name: "Cursor" });
    const href = deeplink.getAttribute("href") ?? "";
    expect(href).toContain("cursor://anysphere.cursor-deeplink/mcp/install?name=zefer&config=");
    const config = JSON.parse(atob(href.split("config=")[1]));
    expect(config).toEqual({ command: "npx", args: ["-y", "zefer-cli", "mcp"] });
    // Cursor has no extra terminal alternative.
    expect(within(panel).queryByText(t("mcp.client.orcli", "en"))).toBeNull();
  });

  it("offers a VS Code deep link with url-encoded config and the servers schema", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(clientTrigger("VS Code (Copilot)"));
    const panel = document.getElementById("mcp-client-4") as HTMLElement;
    const href = within(panel).getByRole("link", { name: "VS Code" }).getAttribute("href") ?? "";
    expect(JSON.parse(decodeURIComponent(href.replace("vscode:mcp/install?", "")))).toEqual({
      name: "zefer",
      command: "npx",
      args: ["-y", "zefer-cli", "mcp"],
    });
    const code = Array.from(panel.querySelectorAll(".code-block code"), (c) => c.textContent).join("\n");
    expect(code).toContain('"type": "stdio"');
  });

  it("falls back to a terminal-only panel for unknown clients", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(clientTrigger("Otra herramienta / Other"));
    const panel = document.getElementById("mcp-client-6") as HTMLElement;
    expect(within(panel).queryByText(t("mcp.setup.optionA", "en"))).toBeNull();
    expect(within(panel).queryByText(t("mcp.setup.optionB", "en"))).toBeNull();
    expect(within(panel).queryByText(t("mcp.client.oneclick", "en"))).toBeNull();
    expect(within(panel).getByText(t("mcp.client.orcli", "en"))).toBeInTheDocument();
    const code = panel.querySelector(".code-block code")?.textContent ?? "";
    expect(code).toContain("./zefer-linux-x64 mcp");
  });

  it("documents the five tools, marking required parameters", () => {
    renderPage();
    for (const name of [
      "zefer_encrypt",
      "zefer_decrypt",
      "zefer_keygen",
      "zefer_analyze_password",
      "zefer_inspect",
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    // Required params lose the "*" marker and gain the primary treatment.
    const required = screen.getAllByText("password", { selector: "span" })[0];
    expect(required.className).toContain("text-primary");
    expect(required.textContent).toBe("password •");
    // Optional params stay neutral and carry no bullet.
    const optional = screen.getAllByText("overwrite", { selector: "span" })[0];
    expect(optional.className).not.toContain("text-primary");
    expect(optional.textContent).toBe("overwrite");
  });

  it("renders the multi-star parameter label without leaking a stray asterisk", () => {
    renderPage();
    // "text | inputPath*" — only the trailing marker is stripped.
    const chip = screen.getByText(/text \| inputPath/, { selector: "span" });
    expect(chip.textContent).toBe("text | inputPath •");
    expect(screen.queryByText(/\*/)).toBeNull();
  });

  it("copies a code sample to the clipboard", async () => {
    const user = userEvent.setup();
    stubClipboard();
    renderPage();
    const [firstCopy] = screen.getAllByRole("button", { name: t("aria.copy", "en") });
    await user.click(firstCopy);
    expect(writeText).toHaveBeenCalledWith("npm install -g zefer-cli");
  });

  it("links to the CLI repo and the protocol spec, opened safely", () => {
    renderPage();
    const cli = screen.getByRole("link", { name: new RegExp(t("mcp.cta.cli", "en")) });
    expect(cli).toHaveAttribute("href", "https://github.com/carrilloapps/zefer-cli");
    expect(cli).toHaveAttribute("rel", "noopener noreferrer");
    const spec = screen.getByRole("link", { name: new RegExp(t("mcp.cta.spec", "en")) });
    expect(spec).toHaveAttribute("href", "https://modelcontextprotocol.io");
    expect(spec).toHaveAttribute("target", "_blank");
  });
});

/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { render, within } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import GuideContent from "../GuideContent";

function renderGuide() {
  const { container } = render(<LanguageProvider><GuideContent /></LanguageProvider>);
  const section = container.querySelector("main > section");
  if (!section) throw new Error("page section not found");
  return { container, section: section as HTMLElement, scope: within(section as HTMLElement) };
}

/** The block a section heading belongs to (heading → wrapper `div`). */
function blockOf(heading: HTMLElement): HTMLElement {
  const block = heading.closest("div.mb-10");
  if (!block) throw new Error(`no block around "${heading.textContent}"`);
  return block as HTMLElement;
}

describe("GuideContent", () => {
  it("renders the guide header and quick-start call to action", () => {
    const { scope } = renderGuide();

    expect(scope.getByRole("heading", { level: 1, name: "How to Use Zefer" })).toBeInTheDocument();
    expect(scope.getByText("COMPLETE GUIDE")).toBeInTheDocument();
    expect(scope.getByRole("heading", { level: 2, name: "Get started now" })).toBeInTheDocument();
    expect(scope.getByText("No installation needed. Zefer works directly in your browser.")).toBeInTheDocument();
    expect(scope.getByRole("link", { name: /Open Zefer Web/ })).toHaveAttribute("href", "/");
  });

  it("numbers the encrypt steps 01..05 and the decrypt steps 01..04", () => {
    const { scope } = renderGuide();

    const encrypt = blockOf(scope.getByRole("heading", { level: 2, name: "Encrypt" }));
    const decrypt = blockOf(scope.getByRole("heading", { level: 2, name: "Decrypt" }));

    const numbers = (block: HTMLElement) =>
      Array.from(block.querySelectorAll("span.font-mono")).map((s) => s.textContent);

    expect(numbers(encrypt)).toEqual(["01", "02", "03", "04", "05"]);
    expect(numbers(decrypt)).toEqual(["01", "02", "03", "04"]);
    expect(within(encrypt).getByText("Select text mode or file mode")).toBeInTheDocument();
  });

  it("lists the six advanced features", () => {
    const { scope } = renderGuide();
    const block = blockOf(scope.getByRole("heading", { level: 2, name: "Advanced Features" }));

    expect(block.querySelectorAll(".glass-hover")).toHaveLength(6);
  });

  it("documents all fourteen URL parameters with their short aliases", () => {
    const { scope } = renderGuide();
    const block = document.getElementById("url");
    if (!block) throw new Error("URL parameters block missing");

    const params = Array.from(block.querySelectorAll("code")).map((c) => c.textContent);
    expect(params).toHaveLength(14);
    expect(params).toContain("passphrase / p");
    expect(params).toContain("attempts / att");
    expect(params).toContain("ips");
    expect(within(block).getByText("Main passphrase (minimum 6 characters)")).toBeInTheDocument();
    expect(scope.getByText(/Sensitive parameters/)).toBeInTheDocument();
  });

  it("shows runnable URL examples for each tab", () => {
    renderGuide();
    const block = document.getElementById("url");

    expect(block?.textContent).toContain("/?t=decrypt&p=myKey123");
    expect(block?.textContent).toContain("/?t=encrypt&m=file&ttl=30&c=gzip&s=high");
    expect(block?.textContent).toContain("/?t=encrypt&p=key1&p2=key2&q=Color%3F&a=blue&ips=10.0.0.1,192.168.1.5");
  });

  it("gives the four self-hosting commands in order plus the HTTPS caveat", () => {
    const { scope } = renderGuide();
    const block = document.getElementById("selfhost");
    if (!block) throw new Error("self-host block missing");

    expect(Array.from(block.querySelectorAll("code")).map((c) => c.textContent)).toEqual([
      "git clone https://github.com/carrilloapps/zefer.git && cd zefer",
      "npm install",
      "npm run build",
      "npm start",
    ]);
    expect(scope.getByText("HTTPS is required for the Web Crypto API to work.")).toBeInTheDocument();
  });

  it("gives the five CLI commands and links on to the MCP page", () => {
    renderGuide();
    const block = document.getElementById("cli");
    if (!block) throw new Error("CLI block missing");

    const commands = Array.from(block.querySelectorAll("code")).map((c) => c.textContent);
    expect(commands[0]).toBe("npm install -g zefer-cli");
    expect(commands).toHaveLength(5);
    expect(commands).toContain("zefer mcp");
    expect(within(block).getByRole("link", { name: "MCP" })).toHaveAttribute("href", "/mcp");
  });

  it("documents the AI assistant integrations and the llms.txt context URL", () => {
    renderGuide();
    const block = document.getElementById("ai");
    if (!block) throw new Error("AI block missing");

    const snippets = Array.from(block.querySelectorAll("code")).map((c) => c.textContent);
    expect(snippets).toContain("@workspace /explain #file:llms.txt");
    expect(snippets).toContain("https://zefer.carrillo.app/llms.txt");
    expect(block.textContent).toContain("Cursor / Windsurf / Augment");
  });

  it("links back to the install page", () => {
    const { scope } = renderGuide();
    expect(scope.getByRole("link", { name: /Install Zefer/ })).toHaveAttribute("href", "/install");
  });

  it("keeps deep-link anchors scroll-offset and the heading order strict", () => {
    const { section } = renderGuide();

    for (const id of ["url", "selfhost", "cli", "ai"]) {
      expect(document.getElementById(id)).toHaveClass("scroll-mt-24");
    }

    const levels = Array.from(section.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });
});

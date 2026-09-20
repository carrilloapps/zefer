/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Shield, Lock, KeyRound } from "lucide-react";
import { LanguageProvider } from "../LanguageProvider";
import { ThemeProvider } from "../ThemeProvider";
import {
  CodeBlock,
  GlassCard,
  GlassSelect,
  IconBox,
  InfoTip,
  PageHeader,
  PageLayout,
  SectionCard,
  Toggle,
  highlightCode,
} from "../ui";
import { t } from "@/app/lib/i18n";

function wrap(ui: React.ReactNode) {
  return render(
    <LanguageProvider>
      <ThemeProvider>{ui}</ThemeProvider>
    </LanguageProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(navigator, "language", { configurable: true, value: "en-US" });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("InfoTip", () => {
  it("exposes a labelled trigger and reveals the explanation on tap", async () => {
    wrap(<InfoTip tipKey="tip.entropy" />);

    const trigger = screen.getByRole("button", { name: t("tip.aria", "en") });
    expect(screen.queryByText(t("tip.entropy", "en"))).not.toBeInTheDocument();

    fireEvent.pointerDown(trigger);

    const bubble = await screen.findByText(t("tip.entropy", "en"));
    expect(bubble).toHaveClass("info-tip-bubble");
    expect(bubble).toHaveAttribute("data-align", "center");

    // Tapping again dismisses it.
    fireEvent.pointerDown(trigger);
    await waitFor(() => expect(screen.queryByText(t("tip.entropy", "en"))).not.toBeInTheDocument());
  });

  it.each([
    ["left", "start"],
    ["right", "end"],
  ] as const)("aligns a %s tip to the %s of its anchor", async (align, radixAlign) => {
    wrap(<InfoTip tipKey="tip.pool" align={align} />);

    fireEvent.pointerDown(screen.getByRole("button"));

    expect(await screen.findByText(t("tip.pool", "en"))).toHaveAttribute("data-align", radixAlign);
  });
});

describe("Toggle", () => {
  it("announces as a switch and reports its state", async () => {
    const onCheckedChange = vi.fn();
    wrap(<Toggle checked={false} onCheckedChange={onCheckedChange} label="Dual key" icon={Lock} />);

    const toggle = screen.getByRole("switch", { name: "Dual key" });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    await act(async () => { toggle.click(); });
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("reflects the checked state and toggles back off", async () => {
    const onCheckedChange = vi.fn();
    wrap(<Toggle checked onCheckedChange={onCheckedChange} label="Dual key" icon={Lock} />);

    const toggle = screen.getByRole("switch", { name: "Dual key" });
    expect(toggle).toHaveAttribute("aria-checked", "true");

    await act(async () => { toggle.click(); });
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });
});

describe("highlightCode", () => {
  /** Renders the tokens and returns [text, class] pairs. */
  function tokens(code: string, lang: "json" | "bash") {
    const { container } = render(<pre>{highlightCode(code, lang)}</pre>);
    return [...container.querySelectorAll("span")].map((s) => [s.textContent, s.getAttribute("class")]);
  }

  it("paints JSON keys, strings, numbers, booleans and comments", () => {
    const painted = tokens(
      '{\n  // zefer\n  "name": "cli",\n  "iterations": 600000,\n  "ratio": -1.5,\n  "ok": true,\n  "hint": null\n}',
      "json"
    );

    expect(painted).toContainEqual(["// zefer", "tok-cmt"]);
    expect(painted).toContainEqual(['"name"', "tok-key"]);
    expect(painted).toContainEqual(['"cli"', "tok-str"]);
    expect(painted).toContainEqual(["600000", "tok-num"]);
    expect(painted).toContainEqual(["-1.5", "tok-num"]);
    expect(painted).toContainEqual(["true", "tok-bool"]);
    expect(painted).toContainEqual(["null", "tok-bool"]);
    // Punctuation and whitespace stay unstyled but are never dropped.
    expect(painted.filter(([, cls]) => cls === null).length).toBeGreaterThan(0);
    expect(painted.map(([text]) => text).join("")).toContain("{");
  });

  it("paints bash commands, flags, variables, strings and comments", () => {
    const painted = tokens('# install\nzefer encrypt file.txt -p "$ZEFER_PASS" --ttl 30', "bash");

    expect(painted).toContainEqual(["# install", "tok-cmt"]);
    expect(painted).toContainEqual(["\n", null]);
    expect(painted).toContainEqual(["zefer", "tok-cmd"]);
    expect(painted).toContainEqual(["encrypt", null]);
    expect(painted).toContainEqual(["-p", "tok-flag"]);
    expect(painted).toContainEqual(["--ttl", "tok-flag"]);
    expect(painted).toContainEqual(['"$ZEFER_PASS"', "tok-str"]);
  });

  it("keeps a lone dollar variable outside quotes as its own token", () => {
    expect(tokens("echo $HOME", "bash")).toContainEqual(["$HOME", "tok-num"]);
  });
});

describe("CodeBlock", () => {
  it("copies the snippet and confirms it, then goes back to the copy icon", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

    wrap(<CodeBlock code={'{ "a": 1 }'} />);
    const button = screen.getByRole("button", { name: t("aria.copy", "en") });
    expect(button).toHaveClass("w-9", "h-9");

    await act(async () => { button.click(); });
    expect(writeText).toHaveBeenCalledWith('{ "a": 1 }');
    expect(button.querySelector("svg")).toHaveClass("text-primary");

    await act(async () => { vi.advanceTimersByTime(1500); });
    expect(button.querySelector("svg")).not.toHaveClass("text-primary");
    vi.useRealTimers();
  });

  it("highlights bash when asked to", () => {
    const { container } = wrap(<CodeBlock code="zefer keygen --count 5" lang="bash" />);

    expect(container.querySelector(".tok-cmd")).toHaveTextContent("zefer");
    expect(container.querySelector(".tok-flag")).toHaveTextContent("--count");
  });
});

describe("PageLayout / PageHeader", () => {
  it("wraps the page between the navbar and the footer", () => {
    wrap(
      <PageLayout>
        <p>page body</p>
      </PageLayout>
    );

    expect(screen.getByRole("main")).toContainElement(screen.getByText("page body"));
    expect(screen.getAllByRole("navigation").length).toBeGreaterThan(0);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders the header badge in caps with a single h1", () => {
    wrap(<PageHeader icon={Shield} badge="mcp server" title="Zefer MCP" subtitle="Run it as a server" />);

    expect(screen.getByText("MCP SERVER")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Zefer MCP");
    expect(screen.getByText("Run it as a server")).toBeInTheDocument();
  });
});

describe("IconBox / SectionCard / GlassCard", () => {
  it.each([
    [undefined, "w-9 h-9 rounded-xl", "w-4 h-4"],
    ["sm" as const, "w-8 h-8 rounded-lg", "w-3.5 h-3.5"],
    ["lg" as const, "w-12 h-12 rounded-2xl", "w-6 h-6"],
  ])("sizes the icon box for %s", (size, boxCls, iconCls) => {
    const { container } = render(<IconBox icon={Shield} size={size} />);

    const box = container.firstElementChild as HTMLElement;
    expect(box).toHaveClass(...boxCls.split(" "));
    expect(box.querySelector("svg")).toHaveClass(...iconCls.split(" "));
  });

  it("renders a section card as an h2 with its description", () => {
    render(<SectionCard icon={KeyRound} title="Key generator" description="Seven key types" />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Key generator");
    expect(screen.getByText("Seven key types")).toBeInTheDocument();
  });

  it("adds the glow and extra classes only when asked", () => {
    const { container, rerender } = render(<GlassCard>plain</GlassCard>);
    const card = () => container.firstElementChild as HTMLElement;
    expect(card()).toHaveClass("glass");
    expect(card()).not.toHaveClass("glow-green");

    rerender(<GlassCard glow className="mb-6">lit</GlassCard>);
    expect(card()).toHaveClass("glow-green", "mb-6");
  });
});

describe("GlassSelect", () => {
  const options = [
    { label: "None", value: "none" },
    { label: "Gzip", value: "gzip" },
    { label: "Deflate", value: "deflate" },
  ];

  it("labels the trigger and shows the current option", () => {
    wrap(<GlassSelect value="gzip" onChange={() => {}} options={options} label="Compression" icon={Lock} />);

    const trigger = screen.getByRole("combobox", { name: "Compression" });
    expect(trigger).toHaveTextContent("Gzip");
    expect(screen.getByText("Compression").querySelector("svg")).toBeInTheDocument();
  });

  it("renders without an icon when none is given", () => {
    wrap(<GlassSelect value="none" onChange={() => {}} options={options} label="Compression" />);

    expect(screen.getByText("Compression").querySelector("svg")).toBeNull();
    expect(screen.getByRole("combobox", { name: "Compression" })).toHaveTextContent("None");
  });

  it("hands the picked option's own value back to the caller", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    wrap(<GlassSelect value="none" onChange={onChange} options={options} label="Compression" />);

    const trigger = screen.getByRole("combobox", { name: "Compression" });
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(await screen.findAllByRole("option")).toHaveLength(3);
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledWith("deflate");
  });

  it("keeps numeric option values numeric", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const numeric = [
      { label: "300k", value: 300_000 },
      { label: "600k", value: 600_000 },
      { label: "1M", value: 1_000_000 },
    ];
    wrap(<GlassSelect value={300_000} onChange={onChange} options={numeric} label="Iterations" />);

    const trigger = screen.getByRole("combobox", { name: "Iterations" });
    trigger.focus();
    await user.keyboard("{Enter}");
    await screen.findAllByRole("option");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledWith(600_000);
  });
});

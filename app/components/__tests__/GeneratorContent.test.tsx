/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { renderToString } from "react-dom/server";

// The page chrome belongs to other suites; stubbing it keeps this one on the
// generator itself instead of Navbar's drawer and portal machinery.
vi.mock("@/app/components/Navbar", () => ({ default: () => null }));
vi.mock("@/app/components/Footer", () => ({ default: () => null }));

const PREFS_KEY = "zefer-prefs";

type Modules = {
  LanguageProvider: (typeof import("@/app/components/LanguageProvider"))["LanguageProvider"];
  GeneratorContent: (typeof import("@/app/components/GeneratorContent"))["default"];
};

/** Preferences and the locale both live in module-level stores, so every test
 *  gets a fresh module graph seeded from localStorage. */
async function load(prefs?: Record<string, unknown>): Promise<Modules> {
  localStorage.clear();
  if (prefs) localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  vi.resetModules();
  const [lang, gen] = await Promise.all([
    import("@/app/components/LanguageProvider"),
    import("@/app/components/GeneratorContent"),
  ]);
  return { LanguageProvider: lang.LanguageProvider, GeneratorContent: gen.default };
}

async function setup(opts: { prefs?: Record<string, unknown> } = {}): Promise<UserEvent> {
  const { LanguageProvider, GeneratorContent } = await load(opts.prefs);
  const user = userEvent.setup();
  render(
    <LanguageProvider>
      <GeneratorContent />
    </LanguageProvider>
  );
  return user;
}

function storedPrefs(): Record<string, unknown> {
  return JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}");
}

const generatedKeys = () =>
  Array.from(document.querySelectorAll("ul.stagger-children code"), (el) => el.textContent ?? "");

/** "~123 bits" badges next to each generated key, in render order. */
const shownBits = () =>
  Array.from(document.querySelectorAll("ul.stagger-children li"), (li) =>
    Number(/~(\d+) bits/.exec(li.textContent ?? "")?.[1])
  );

function metric(label: string): string {
  return screen.getByText(label).parentElement?.parentElement?.textContent ?? "";
}

async function openAdvanced(user: UserEvent) {
  const toggle = screen.getByRole("button", { name: "Advanced options" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  await user.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("GeneratorContent — tabs", () => {
  it("starts on the generator tab and switches to the analyzer and back", async () => {
    const user = await setup();

    expect(screen.getByRole("tab", { name: "Generator" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: "Generate keys" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Password to analyze")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Analyzer" }));
    expect(screen.getByRole("heading", { name: "Password analyzer" })).toBeInTheDocument();
    expect(screen.getByLabelText("Password to analyze")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Generate keys" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Generator" }));
    expect(screen.getByRole("button", { name: "Generate keys" })).toBeInTheDocument();
  });
});

describe("GeneratorContent — key modes", () => {
  const CASES: { name: string; pool: number; pattern: RegExp }[] = [
    { name: "Unicode", pool: 584, pattern: /^.{8}$/u },
    { name: "Secure", pool: 189, pattern: /^[\S]{8}$/u },
    { name: "Alphanum.", pool: 62, pattern: /^[A-Za-z0-9]{8}$/ },
    { name: "Hex", pool: 16, pattern: /^[0-9a-f]{8}$/ },
    { name: "Readable", pool: 58, pattern: /^[1-9A-HJ-NP-Za-km-z]{8}$/ },
    { name: "PIN", pool: 10, pattern: /^\d{8}$/ },
  ];

  it.each(CASES)("generates $name keys from its own alphabet", async ({ name, pool, pattern }) => {
    const user = await setup({ prefs: { keygenLength: 8 } });

    await user.click(screen.getByRole("button", { name }));
    expect(screen.getByRole("button", { name })).toHaveAttribute("aria-pressed", "true");
    expect(metric("Estimated alphabet")).toContain(pool.toLocaleString());

    await user.click(screen.getByRole("button", { name: "Generate keys" }));
    const [key] = generatedKeys();
    expect(key).toMatch(pattern);
    expect(storedPrefs().keygenMode).toBeTypeOf("string");
  });

  it("drops the length and character controls for UUID keys", async () => {
    const user = await setup();

    await user.click(screen.getByRole("button", { name: "UUID" }));
    expect(screen.queryByRole("slider", { name: "Length" })).not.toBeInTheDocument();
    expect(metric("Estimated alphabet")).toContain("16");
    expect(metric("Maximum entropy")).toContain("122");

    await openAdvanced(user);
    expect(screen.getByRole("slider", { name: "Quantity" })).toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: "Exclude ambiguous characters" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Exclude characters")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Generate keys" }));
    expect(generatedKeys()[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("offers the all-classes guarantee only for alphabets that have classes", async () => {
    const user = await setup();

    await openAdvanced(user);
    expect(screen.getByRole("switch", { name: "Guarantee all classes" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hex" }));
    expect(screen.queryByRole("switch", { name: "Guarantee all classes" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "PIN" }));
    expect(screen.queryByRole("switch", { name: "Guarantee all classes" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Readable" }));
    expect(screen.getByRole("switch", { name: "Guarantee all classes" })).toBeInTheDocument();
  });
});

describe("GeneratorContent — length and quantity controls", () => {
  it("moves the length through its preset stops", async () => {
    const user = await setup();
    const slider = screen.getByRole("slider", { name: "Length" });

    expect(slider).toHaveAttribute("aria-valuetext", "64");
    expect(screen.getByRole("button", { name: "Length: 64" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Length: 256" }));
    expect(slider).toHaveAttribute("aria-valuetext", "256");
    expect(screen.getByLabelText("Custom length (1–2048)")).toHaveValue(256);
    expect(storedPrefs().keygenLength).toBe(256);

    fireEvent.change(slider, { target: { value: "0" } });
    expect(slider).toHaveAttribute("aria-valuetext", "16");
    expect(screen.getByRole("button", { name: "Length: 1024" })).toHaveAttribute("aria-pressed", "false");
  });

  it("accepts a custom length, clamps it to 2048 and keeps the nearest stop marked", async () => {
    const user = await setup();
    const input = screen.getByLabelText("Custom length (1–2048)");

    await user.clear(input);
    await user.type(input, "100");
    expect(storedPrefs().keygenLength).toBe(100);
    expect(input.className).toContain("theme-primary-border");
    expect(screen.getByRole("slider", { name: "Length" })).toHaveAttribute("aria-valuetext", "128");

    await user.clear(input);
    await user.type(input, "9999");
    expect(storedPrefs().keygenLength).toBe(2048);

    // Blurring drops the free-typing buffer and shows the persisted value again
    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveValue(null);
    expect(storedPrefs().keygenLength).toBe(2048);
    fireEvent.blur(input);
    expect(input).toHaveValue(2048);
  });

  it("moves the quantity through its stops and clamps a custom value to 50", async () => {
    const user = await setup();
    await openAdvanced(user);

    const slider = screen.getByRole("slider", { name: "Quantity" });
    expect(slider).toHaveAttribute("aria-valuetext", "1");

    await user.click(screen.getByRole("button", { name: "Quantity: 10" }));
    expect(storedPrefs().keygenCount).toBe(10);

    fireEvent.change(slider, { target: { value: "4" } });
    expect(slider).toHaveAttribute("aria-valuetext", "50");

    const input = screen.getByLabelText("Custom quantity (1–50)");
    await user.clear(input);
    await user.type(input, "7");
    expect(storedPrefs().keygenCount).toBe(7);
    expect(input.className).toContain("theme-primary-border");

    await user.clear(input);
    await user.type(input, "80");
    expect(storedPrefs().keygenCount).toBe(50);

    fireEvent.change(input, { target: { value: "" } });
    expect(storedPrefs().keygenCount).toBe(50);
    fireEvent.blur(input);
    expect(input).toHaveValue(50);
  });

  it("migrates a persisted quantity above the new cap", async () => {
    await setup({ prefs: { keygenCount: 99 } });
    const user = userEvent.setup();
    await openAdvanced(user);
    await waitFor(() => expect(screen.getByLabelText("Custom quantity (1–50)")).toHaveValue(50));
    expect(storedPrefs().keygenCount).toBe(50);
  });
});

describe("GeneratorContent — advanced options", () => {
  it("persists every advanced option to zefer-prefs", async () => {
    const user = await setup({ prefs: { keygenLength: 12 } });
    await openAdvanced(user);

    await user.click(screen.getByRole("switch", { name: "Exclude ambiguous characters" }));
    await user.click(screen.getByRole("switch", { name: "No consecutive repeats" }));
    await user.click(screen.getByRole("switch", { name: "Guarantee all classes" }));
    // "-" is part of the secure alphabet; excluding it keeps the grouping dash
    // unambiguous in the assertions below.
    await user.type(screen.getByLabelText("Exclude characters"), "@#-");
    await user.click(screen.getByRole("button", { name: "6" }));

    expect(storedPrefs().keygenAdvanced).toEqual({
      excludeAmbiguous: true,
      excludeChars: "@#-",
      requireAllClasses: true,
      noRepeats: true,
      groupSize: 6,
    });
    expect(screen.getByRole("button", { name: "6" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Off" })).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: "Generate keys" }));
    const [key] = generatedKeys();
    expect(key).toMatch(/^[^-]{6}-[^-]{6}$/);
    expect(key).not.toMatch(/[0O1lI@#]/);
    expect(key.replaceAll("-", "")).not.toMatch(/(.)\1/u);
    expect(key).toMatch(/[a-z]/);
    expect(key).toMatch(/[A-Z]/);
    expect(key).toMatch(/\d/);
  });

  it("honours a stored advanced object that predates the newer fields", async () => {
    const user = await setup({ prefs: { keygenAdvanced: {} } });
    await openAdvanced(user);

    expect(screen.getByRole("switch", { name: "Exclude ambiguous characters" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByLabelText("Exclude characters")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Off" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "4" }));
    expect(storedPrefs().keygenAdvanced).toEqual({ groupSize: 4 });
  });

  it("groups keys every 8 characters and lets the grouping be turned back off", async () => {
    const user = await setup({ prefs: { keygenLength: 16, keygenMode: "hex" } });
    await openAdvanced(user);

    await user.click(screen.getByRole("button", { name: "8" }));
    await user.click(screen.getByRole("button", { name: "Generate keys" }));
    expect(generatedKeys()[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{8}$/);

    await user.click(screen.getByRole("button", { name: "Off" }));
    await user.click(screen.getByRole("button", { name: "Generate keys" }));
    expect(generatedKeys()[0]).toMatch(/^[0-9a-f]{16}$/);
  });

  it("falls back to the full alphabet when the exclusions would empty it", async () => {
    const user = await setup({ prefs: { keygenMode: "pin", keygenLength: 8 } });
    await openAdvanced(user);

    await user.type(screen.getByLabelText("Exclude characters"), "0123456789");
    // Pool collapses to the 2-symbol floor the entropy model uses
    expect(metric("Estimated alphabet")).toContain("2 ");
    expect(metric("Maximum entropy")).toContain("8 ");

    await user.click(screen.getByRole("button", { name: "Generate keys" }));
    expect(generatedKeys()[0]).toMatch(/^\d{8}$/);
  });
});

describe("GeneratorContent — results", () => {
  it("shows an empty state until keys are generated", async () => {
    const user = await setup({ prefs: { keygenLength: 8 } });
    expect(screen.getByText("Configure and press “Generate keys”")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copy all" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Generate keys" }));
    expect(screen.queryByText("Configure and press “Generate keys”")).not.toBeInTheDocument();
    expect(generatedKeys()).toHaveLength(1);
    expect(screen.queryByText("Sorted from highest to lowest score")).not.toBeInTheDocument();
  });

  it("sorts a batch from strongest to weakest", async () => {
    const user = await setup({ prefs: { keygenMode: "pin", keygenLength: 8, keygenCount: 10 } });
    await user.click(screen.getByRole("button", { name: "Generate keys" }));

    expect(generatedKeys()).toHaveLength(10);
    expect(screen.getByText("Sorted from highest to lowest score")).toBeInTheDocument();
    const bits = shownBits();
    expect(bits).toHaveLength(10);
    expect([...bits].sort((a, b) => b - a)).toEqual(bits);
  });

  it("copies one key, then another, and resets the copied marker on a timer", async () => {
    const user = await setup({ prefs: { keygenMode: "hex", keygenLength: 8, keygenCount: 5 } });
    await user.click(screen.getByRole("button", { name: "Generate keys" }));

    const keys = generatedKeys();
    const copyButtons = screen.getAllByRole("button", { name: "Copy" });
    expect(copyButtons).toHaveLength(5);
    const marked = (i: number) => copyButtons[i].querySelector(".text-primary") !== null;

    // user-event's clipboard stub leans on real timers; swap in a plain one so
    // the reset timer can be driven deterministically.
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    vi.useFakeTimers();
    fireEvent.click(copyButtons[0]);
    // The copied marker flips only once `clipboard.writeText` resolves,
    // so the pending microtasks have to be flushed before asserting.
    await act(async () => {});
    expect(writeText).toHaveBeenLastCalledWith(keys[0]);
    expect(marked(0)).toBe(true);

    // A second copy before the first reset timer fires: the stale timer must
    // leave the newer selection alone.
    act(() => { vi.advanceTimersByTime(500); });
    fireEvent.click(copyButtons[3]);
    // The copied marker flips only once `clipboard.writeText` resolves,
    // so the pending microtasks have to be flushed before asserting.
    await act(async () => {});
    expect(writeText).toHaveBeenLastCalledWith(keys[3]);
    expect(marked(0)).toBe(false);
    expect(marked(3)).toBe(true);

    act(() => { vi.advanceTimersByTime(1000); }); // first timer fires — no-op
    expect(marked(3)).toBe(true);

    act(() => { vi.advanceTimersByTime(600); }); // second timer clears the mark
    expect(marked(3)).toBe(false);
  });

  it("copies every key at once", async () => {
    const user = await setup({ prefs: { keygenMode: "hex", keygenLength: 8, keygenCount: 5 } });
    await user.click(screen.getByRole("button", { name: "Generate keys" }));
    await user.click(screen.getByRole("button", { name: "Copy all" }));
    expect(await navigator.clipboard.readText()).toBe(generatedKeys().join("\n"));
  });

  it("downloads the batch as a timestamped .txt", async () => {
    let blob: Blob | undefined;
    const downloads: { href: string; name: string }[] = [];
    const create = vi.spyOn(URL, "createObjectURL").mockImplementation((b) => {
      blob = b as Blob;
      return "blob:generated";
    });
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloads.push({ href: this.getAttribute("href") ?? "", name: this.download });
    });

    const user = await setup({ prefs: { keygenMode: "hex", keygenLength: 8, keygenCount: 5 } });
    await user.click(screen.getByRole("button", { name: "Generate keys" }));
    await user.click(screen.getByRole("button", { name: "Download .txt" }));

    expect(create).toHaveBeenCalledTimes(1);
    expect(revoke).toHaveBeenCalledWith("blob:generated");
    expect(downloads).toHaveLength(1);
    expect(downloads[0].name).toMatch(/^zefer-keys-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.txt$/);
    expect(downloads[0].href).toBe("blob:generated");
    expect(await blob!.text()).toBe(`${generatedKeys().join("\n")}\n`);
  });
});

describe("GeneratorContent — native sharing", () => {
  it("hides the share control when the browser cannot share", async () => {
    await setup({ prefs: { keygenLength: 8 } });
    await userEvent.setup().click(screen.getByRole("button", { name: "Generate keys" }));
    expect(screen.queryByRole("button", { name: "Share" })).not.toBeInTheDocument();
  });

  it("shares a single key and survives a dismissed share sheet", async () => {
    const share = vi
      .fn<(data: ShareData) => Promise<void>>()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("dismissed"));
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    try {
      const user = await setup({ prefs: { keygenLength: 8 } });
      await user.click(screen.getByRole("button", { name: "Generate keys" }));

      const shareButton = screen.getByRole("button", { name: "Share" });
      await user.click(shareButton);
      expect(share).toHaveBeenCalledWith({ text: generatedKeys()[0] });

      await user.click(shareButton);
      await waitFor(() => expect(share).toHaveBeenCalledTimes(2));
      expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
    } finally {
      Reflect.deleteProperty(navigator, "share");
    }
  });

  it("assumes no sharing on the server render", async () => {
    const { LanguageProvider, GeneratorContent } = await load();
    Object.defineProperty(navigator, "share", { value: () => Promise.resolve(), configurable: true });
    try {
      const html = renderToString(
        <LanguageProvider>
          <GeneratorContent />
        </LanguageProvider>
      );
      expect(html).toContain("Generate keys");
      expect(html).not.toContain('aria-label="Share"');
    } finally {
      Reflect.deleteProperty(navigator, "share");
    }
  });
});

describe("GeneratorContent — configuration report", () => {
  it("expands the full report and passes every framework check for a 64-char secure key", async () => {
    const user = await setup();
    const toggle = screen.getByRole("button", { name: "Show full analysis" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "config-insights");

    await user.click(toggle);
    const collapsed = screen.getByRole("button", { name: "Hide full analysis" });
    expect(collapsed).toHaveAttribute("aria-expanded", "true");

    const report = document.getElementById("config-insights") as HTMLElement;
    for (const frame of [
      "NIST SP 800-63B — minimum length (≥8)",
      "OWASP baseline (≥64 bits)",
      "Long-term protection (≥100 bits)",
      "AES-128 equivalent (≥128 bits)",
      "Post-quantum — Grover (≥128 bits after halving)",
    ]) {
      expect(within(report).getByText(frame).closest("li")).toHaveTextContent("Pass");
    }
    expect(within(report).getByText("Total combinations").parentElement?.parentElement)
      .toHaveTextContent("≈10");
    expect(within(report).getByText("This configuration")).toBeInTheDocument();
    expect(within(report).getByText(/times more combinations/)).toBeInTheDocument();

    await user.click(collapsed);
    expect(screen.getByRole("button", { name: "Show full analysis" })).toHaveAttribute("aria-expanded", "false");
  });

  it("fails the framework checks and reports a below-average key for a 1-digit PIN", async () => {
    const user = await setup({ prefs: { keygenMode: "pin", keygenLength: 1 } });
    await user.click(screen.getByRole("button", { name: "Show full analysis" }));
    const report = document.getElementById("config-insights") as HTMLElement;

    expect(within(report).getByText("NIST SP 800-63B — minimum length (≥8)").closest("li")).toHaveTextContent("Fail");
    expect(within(report).getByText("OWASP baseline (≥64 bits)").closest("li")).toHaveTextContent("Fail");
    expect(within(report).getByText("Below the human average")).toBeInTheDocument();
    expect(within(report).getByText("Post-quantum entropy").parentElement?.parentElement).toHaveTextContent("1 bits");

    // Every attack scenario cracks a 3-bit key immediately
    for (const scenario of ["Throttled login", "Cloud cluster", "GPU farm", "Nation-state"]) {
      expect(within(report).getByText(scenario).parentElement).toHaveTextContent("Instant");
    }
  });

  it("reports finite and exponential crack times side by side", async () => {
    const user = await setup({ prefs: { keygenMode: "hex", keygenLength: 16 } });
    await user.click(screen.getByRole("button", { name: "Show full analysis" }));
    const report = document.getElementById("config-insights") as HTMLElement;

    const cell = (name: string) => within(report).getByText(name).parentElement?.textContent ?? "";
    expect(cell("Throttled login")).toContain("≈10");
    expect(cell("Cloud cluster")).toMatch(/\d\s?years/);
    expect(cell("Cloud cluster")).not.toContain("≈10");
    expect(cell("GPU farm")).toMatch(/months|days/);
    expect(cell("Nation-state")).toMatch(/hours|minutes|seconds/);
  });
});

describe("GeneratorContent — password analyzer", () => {
  async function openAnalyzer(prefs?: Record<string, unknown>) {
    const user = await setup({ prefs });
    await user.click(screen.getByRole("tab", { name: "Analyzer" }));
    return user;
  }

  it("shows nothing until a password is typed", async () => {
    await openAnalyzer();
    expect(screen.queryByText("Character variety")).not.toBeInTheDocument();
  });

  it("scores a weak password and lists its weaknesses", async () => {
    const user = await openAnalyzer();
    await user.type(screen.getByLabelText("Password to analyze"), "qwerty123");

    expect(screen.getByText("Very weak")).toBeInTheDocument();
    expect(metric("Length")).toContain("9");
    expect(metric("Estimated alphabet")).toContain("36");
    expect(screen.getByText("Detected weaknesses")).toBeInTheDocument();
    expect(screen.getByText("Appears in leaked password lists — cracked instantly")).toBeInTheDocument();
    expect(screen.getByText("Contains keyboard patterns (qwerty…)")).toBeInTheDocument();

    const variety = screen.getByText("Character variety").parentElement as HTMLElement;
    expect(within(variety).getByText("lowercase").className).toContain("text-primary");
    expect(within(variety).getByText("uppercase").className).toContain("line-through");
    expect(within(variety).getByText("unicode").className).toContain("line-through");
  });

  it("scores a strong password with no weaknesses and full compliance", async () => {
    await openAnalyzer();
    const strong = "Xq7#mZ%2vLp9!Rt4&Wb6@Ks1Nd8^Hj5*Gy0(Fe3)Cu2-Bi6_Ao9+Zw4=Vr7~Tm1";
    // Pasted in one go: 63 keystrokes would re-render the whole report each time
    fireEvent.change(screen.getByLabelText("Password to analyze"), { target: { value: strong } });

    expect(screen.getByText("Strong")).toBeInTheDocument();
    expect(screen.queryByText("Detected weaknesses")).not.toBeInTheDocument();
    expect(screen.getByText("This key")).toBeInTheDocument();
    expect(screen.getByText("Post-quantum — Grover (≥128 bits after halving)").closest("li"))
      .toHaveTextContent("Pass");
    expect(screen.getByText("Throttled login").parentElement).toHaveTextContent("≈10");
    expect(metric("Effective entropy")).toMatch(/\d+ bits/);
  });

  it("toggles password visibility", async () => {
    const user = await openAnalyzer();
    const input = screen.getByLabelText("Password to analyze");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show passphrase" }));
    expect(input).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide passphrase" }));
    expect(input).toHaveAttribute("type", "password");
  });
});

describe("GeneratorContent — explanatory tooltips", () => {
  it("opens on hover, on keyboard focus and on tap", async () => {
    const user = await setup();
    const tips = screen.getAllByRole("button", { name: "More information" });
    expect(tips.length).toBeGreaterThan(1);

    await user.hover(tips[0]);
    const bubble = await screen.findByText(/How many distinct symbols/);
    expect(bubble).toHaveClass("info-tip-bubble");
    await user.unhover(tips[0]);

    fireEvent.focus(tips[1]);
    expect(await screen.findByText(/Measures how unpredictable the key is/)).toBeInTheDocument();
    fireEvent.blur(tips[1]);

    // Touch: Radix closes on pointerdown, so the component toggles explicitly
    fireEvent.pointerDown(tips[0]);
    await waitFor(() => expect(document.querySelector(".info-tip-bubble")).not.toBeNull());
    expect(tips[0]).toHaveAttribute("aria-describedby");
    fireEvent.pointerDown(tips[0]);
    await waitFor(() => expect(document.querySelector(".info-tip-bubble")).toBeNull());
  });
});

describe("GeneratorContent — grouping semantics", () => {
  it("labels the mode and grouping fieldsets for assistive tech", async () => {
    const user = await setup();
    const legends = Array.from(document.querySelectorAll("legend"), (l) => l.textContent);
    expect(legends).toContain("Key type");

    await openAdvanced(user);
    expect(Array.from(document.querySelectorAll("legend"), (l) => l.textContent))
      .toContain("Group with dashes");
  });
});

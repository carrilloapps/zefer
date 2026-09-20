/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { LanguageProvider } from "../LanguageProvider";
import KeyGenerator from "../KeyGenerator";
import { CHARSETS, type KeygenMode } from "@/app/lib/passwords";

type CharMode = Exclude<KeygenMode, "uuid">;
import { t, type TranslationKey } from "@/app/lib/i18n";

const en = (key: TranslationKey) => t(key, "en");

type Props = React.ComponentProps<typeof KeyGenerator>;

function setup(props: Partial<Props> = {}) {
  const user = userEvent.setup();
  const onSelect = props.onSelect ?? vi.fn();
  render(
    <LanguageProvider>
      <KeyGenerator {...props} onSelect={onSelect} />
    </LanguageProvider>
  );
  return { user, onSelect };
}

/** The popover trigger — the only thing rendered while the panel is closed. */
const trigger = () => screen.getByRole("button", { name: en("keygen.title") });

/** Radix renders the panel in a portal, so query the whole document. */
const panel = () => screen.getByRole("dialog", { name: en("keygen.title") });

/** The generated key as it is shown to the user. */
function generatedValue(): string {
  return panel().querySelector("p.select-all")!.textContent ?? "";
}

function modeButton(mode: KeygenMode) {
  return screen.getByRole("button", { name: en(`keygen.${mode}` as TranslationKey) });
}

afterEach(() => {
  Reflect.deleteProperty(navigator, "share");
});

describe("KeyGenerator", () => {
  it("rolls a 64-character secure key when the popover opens", async () => {
    const { user } = setup();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(trigger());

    const value = generatedValue();
    expect(value).toHaveLength(64);
    expect([...value].every((ch) => CHARSETS.secure.includes(ch))).toBe(true);
    expect(panel()).toHaveTextContent(`64 ${en("keygen.chars")}`);
    const bits = Math.floor(Math.log2([...CHARSETS.secure].length) * 64);
    expect(panel()).toHaveTextContent(`~${bits} bits`);
  });

  it("generates from the right alphabet in every character mode", async () => {
    const onModeChange = vi.fn();
    const { user } = setup({ onModeChange });
    await user.click(trigger());

    const charModes: CharMode[] = ["unicode", "secure", "alpha", "hex", "base58", "pin"];
    for (const mode of charModes) {
      await user.click(modeButton(mode));
      const value = generatedValue();
      const pool = new Set([...CHARSETS[mode]]);
      expect([...value].every((ch) => pool.has(ch))).toBe(true);
      expect(onModeChange).toHaveBeenCalledWith(mode);
    }
    expect(generatedValue()).toMatch(/^\d{64}$/); // pin, the last mode picked
  });

  it("switches to UUID v7: no length picker, fixed 122 bits", async () => {
    const { user } = setup();
    await user.click(trigger());
    expect(screen.getByRole("button", { name: "128" })).toBeInTheDocument();

    await user.click(modeButton("uuid"));

    expect(screen.queryByRole("button", { name: "128" })).not.toBeInTheDocument();
    expect(generatedValue()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(panel()).toHaveTextContent("UUID v7 (RFC 9562)");
    expect(panel()).toHaveTextContent("~122 bits");
  });

  it("explains the pool in unicode mode only", async () => {
    const { user } = setup();
    await user.click(trigger());
    expect(screen.queryByText(en("keygen.unicode.desc"))).not.toBeInTheDocument();

    await user.click(modeButton("unicode"));

    expect(screen.getByText(en("keygen.unicode.desc"))).toBeInTheDocument();
  });

  it("regenerates a different key on demand", async () => {
    const { user } = setup();
    await user.click(trigger());
    const first = generatedValue();

    await user.click(screen.getByRole("button", { name: en("keygen.regenerate") }));

    expect(generatedValue()).not.toBe(first);
    expect(generatedValue()).toHaveLength(64);
  });

  it("changes the length and scrolls long keys", async () => {
    const onLengthChange = vi.fn();
    const { user } = setup({ onLengthChange });
    await user.click(trigger());
    await user.click(modeButton("hex"));
    expect(panel().querySelector("p.select-all")).not.toHaveClass("max-h-28");

    await user.click(screen.getByRole("button", { name: "128" }));

    expect(onLengthChange).toHaveBeenCalledWith(128);
    expect(generatedValue()).toMatch(/^[0-9a-f]{128}$/);
    expect(panel()).toHaveTextContent(`128 ${en("keygen.chars")}`);
    expect(panel().querySelector("p.select-all")).toHaveClass("max-h-28");
  });

  it("starts from the saved preferences and works without change callbacks", async () => {
    const { user } = setup({ savedMode: "hex", savedLength: 256 });
    await user.click(trigger());
    expect(generatedValue()).toMatch(/^[0-9a-f]{256}$/);

    await user.click(modeButton("alpha"));
    expect(generatedValue()).toMatch(new RegExp(`^[${CHARSETS.alpha}]{256}$`));

    await user.click(screen.getByRole("button", { name: "512" }));
    expect(generatedValue()).toHaveLength(512);
  });

  it("applies the key and closes the popover", async () => {
    const { user, onSelect } = setup();
    await user.click(trigger());
    const value = generatedValue();

    await user.click(screen.getByRole("button", { name: en("keygen.use") }));

    expect(onSelect).toHaveBeenCalledWith(value);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape without rolling a new key", async () => {
    const { user, onSelect } = setup();
    await user.click(trigger());
    const value = generatedValue();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(trigger());
    expect(generatedValue()).not.toBe(value); // reopening always rolls a fresh key
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("copies the key to the clipboard", async () => {
    const { user } = setup();
    await user.click(trigger());
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    const value = generatedValue();

    await user.click(screen.getByRole("button", { name: en("aria.copy") }));

    expect(writeText).toHaveBeenCalledWith(value);
    expect(panel().querySelector("svg.lucide-check")).toBeInTheDocument();

    // The confirmation reverts to the copy icon on its own.
    await waitFor(() => expect(panel().querySelector("svg.lucide-check")).toBeNull(), { timeout: 3000 });
  });

  it("shares the key through the native sheet when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    const { user } = setup();
    await user.click(trigger());
    const value = generatedValue();

    await user.click(screen.getByRole("button", { name: en("aria.share") }));

    expect(share).toHaveBeenCalledWith({ text: value });
  });

  it("keeps the key visible when the share sheet is dismissed", async () => {
    const share = vi.fn().mockRejectedValue(new Error("dismissed"));
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    const { user } = setup();
    await user.click(trigger());
    const value = generatedValue();

    await user.click(screen.getByRole("button", { name: en("aria.share") }));

    expect(share).toHaveBeenCalledOnce();
    expect(generatedValue()).toBe(value);
  });

  it("hides the share button when the browser cannot share", async () => {
    const { user } = setup();
    await user.click(trigger());

    expect(screen.queryByRole("button", { name: en("aria.share") })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: en("aria.copy") })).toBeInTheDocument();
  });

  it("server-renders the trigger without touching navigator", () => {
    const html = renderToString(
      <LanguageProvider>
        <KeyGenerator onSelect={() => {}} />
      </LanguageProvider>
    );
    expect(html).toContain(en("keygen.title"));
    expect(html).not.toContain(en("aria.share"));
  });
});

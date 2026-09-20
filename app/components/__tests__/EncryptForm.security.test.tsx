/** @vitest-environment jsdom */
import { useEffect } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "../LanguageProvider";
import EncryptForm from "../EncryptForm";
import { usePreferences } from "@/app/lib/preferences";
import { decodeZefer } from "@/app/lib/zefer";
import { t } from "@/app/lib/i18n";

const T = (key: Parameters<typeof t>[0]) => t(key, "en");

// ─── Preferences reset ───
const probe: { api: ReturnType<typeof usePreferences> | null } = { api: null };

/** Publishes the preference API to the test. The store is module-level, so the
 *  only supported way to put it back to a known state is through its setters. */
function PrefsProbe() {
  const api = usePreferences();
  useEffect(() => {
    probe.api = api;
  });
  return null;
}

function resetPreferences() {
  const view = render(<PrefsProbe />);
  act(() => {
    probe.api!.setTab("encrypt");
    probe.api!.setTtl(30);
    probe.api!.setIterations(1);
    probe.api!.setCompression("none");
    probe.api!.setInputMode("text");
    probe.api!.setKeygenMode("secure");
    probe.api!.setKeygenLength(64);
  });
  view.unmount();
}

function renderForm(query = "/") {
  window.history.replaceState({}, "", query);
  return render(
    <LanguageProvider>
      <EncryptForm />
    </LanguageProvider>
  );
}

// ─── Element helpers ───
const passInput = () => screen.getByLabelText(T("form.passphrase")) as HTMLInputElement;
const textArea = () => screen.getByLabelText(T("form.content.label")) as HTMLTextAreaElement;
const submit = () => screen.getByRole("button", { name: T("encrypt.submit") });
const advancedToggle = () => screen.getByRole("button", { name: T("advanced.title") });
const secondPass = () => document.getElementById("encrypt-pass2") as HTMLInputElement;
const revealInput = () => screen.getByLabelText(T("advanced.revealkey")) as HTMLInputElement;
const ipInput = () => screen.getByLabelText(T("advanced.ip")) as HTMLInputElement;
const errorText = () => screen.getByRole("alert").textContent;
const pressed = (name: string) =>
  screen.getByRole("button", { name }).getAttribute("aria-pressed");

function setText(value: string) {
  fireEvent.change(textArea(), { target: { value } });
}

function setField(el: HTMLElement, value: string) {
  fireEvent.change(el, { target: { value } });
}

/** Radix Select: userEvent's synthetic pointer stops opening the trigger after
 *  the first test in a file, so dispatch the two events it listens for. */
function chooseOption(triggerLabel: string, optionLabel: string) {
  fireEvent.pointerDown(screen.getByLabelText(triggerLabel), {
    button: 0,
    ctrlKey: false,
    pointerId: 1,
    pointerType: "mouse",
  });
  const option = screen.getAllByRole("option").find((o) => o.textContent === optionLabel);
  fireEvent.click(option!);
}

function captureDownloads() {
  const blobs: Blob[] = [];
  vi.spyOn(URL, "createObjectURL").mockImplementation((obj: Blob | MediaSource) => {
    blobs.push(obj as Blob);
    return "blob:captured";
  });
  return blobs;
}

/** Install (or remove) the Web Share entry points for one test. */
function stubShare(value: {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
}) {
  for (const key of ["share", "canShare"] as const) {
    if (value[key]) {
      Object.defineProperty(navigator, key, { configurable: true, value: value[key] });
    } else {
      Reflect.deleteProperty(navigator, key);
    }
  }
}

async function encryptAndWait(user: ReturnType<typeof userEvent.setup>) {
  await user.click(submit());
  await screen.findByRole("heading", { level: 2, name: T("encrypt.success.title") }, {
    timeout: 20_000,
  });
}

describe("EncryptForm — URL parameters", () => {
  beforeEach(() => {
    localStorage.clear();
    resetPreferences();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("applies every long-form parameter and scrubs the sensitive ones", async () => {
    renderForm(
      "/?passphrase=mainKey1&passphrase2=secondKey1&reveal=revealKey1&mode=file" +
        "&ttl=60&security=maximum&compression=gzip&hint=check+email&note=for+alice" +
        "&question=Colour&answer=blue&attempts=5&ips=10.0.0.1,192.168.1.5"
    );

    await waitFor(() => expect(passInput()).toHaveValue("mainKey1"));
    expect(advancedToggle()).toHaveAttribute("aria-expanded", "true");
    expect(secondPass()).toHaveValue("secondKey1");
    expect(screen.getByRole("switch", { name: T("advanced.dualkey") })).toBeChecked();
    expect(revealInput()).toHaveValue("revealKey1");
    expect(screen.getByRole("button", { name: T("mode.file") })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByLabelText(T("form.expires"))).toHaveTextContent(T("ttl.1hour"));
    expect(pressed(T("security.maximum"))).toBe("true");
    expect(pressed(T("compression.gzip"))).toBe("true");
    expect(screen.getByLabelText(T("advanced.hint"))).toHaveValue("check email");
    expect(screen.getByLabelText(T("advanced.note"))).toHaveValue("for alice");
    expect(screen.getByLabelText(T("advanced.question"))).toHaveValue("Colour");
    expect(screen.getByLabelText(T("advanced.question.answer"))).toHaveValue("blue");
    expect(screen.getByLabelText(T("advanced.attempts"))).toHaveTextContent("5");
    expect(ipInput()).toHaveValue("10.0.0.1,192.168.1.5");

    // Passphrase, second key, reveal key and answer must not stay in the URL.
    expect(window.location.search).toBe("");
  });

  it("applies every short-form alias, with security winning over raw iterations", async () => {
    renderForm(
      "/?p=mainKey1&p2=secondKey1&r=revealKey1&m=text&s=high&i=999&c=deflate" +
        "&h=hint+short&n=note+short&q=Pet&a=rex&att=3&d=true"
    );

    await waitFor(() => expect(passInput()).toHaveValue("mainKey1"));
    expect(secondPass()).toHaveValue("secondKey1");
    expect(revealInput()).toHaveValue("revealKey1");
    expect(screen.getByRole("button", { name: T("mode.text") })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(pressed(T("security.high"))).toBe("true");
    expect(pressed(T("compression.deflate"))).toBe("true");
    expect(screen.getByLabelText(T("advanced.hint"))).toHaveValue("hint short");
    expect(screen.getByLabelText(T("advanced.note"))).toHaveValue("note short");
    expect(screen.getByLabelText(T("advanced.question"))).toHaveValue("Pet");
    expect(screen.getByLabelText(T("advanced.question.answer"))).toHaveValue("rex");
    expect(screen.getByLabelText(T("advanced.attempts"))).toHaveTextContent("3");
  });

  it("takes a raw iteration count when no security level is named", async () => {
    renderForm("/?iterations=250000&compression=none");
    await waitFor(() => expect(pressed(T("compression.none"))).toBe("true"));
    expect(pressed(T("security.standard"))).toBe("false");
    expect(pressed(T("security.high"))).toBe("false");
    expect(pressed(T("security.maximum"))).toBe("false");
  });

  it("enables the dual key from the flag alone", async () => {
    renderForm("/?dual=1");
    await waitFor(() =>
      expect(screen.getByRole("switch", { name: T("advanced.dualkey") })).toBeChecked()
    );
    expect(secondPass()).toHaveValue("");
    expect(advancedToggle()).toHaveAttribute("aria-expanded", "true");
    // Nothing sensitive was supplied, so the URL is left alone.
    expect(window.location.search).toBe("?dual=1");
  });

  it("treats attempts=0 as an explicit unlimited choice", async () => {
    renderForm("/?attempts=0");
    await waitFor(() => expect(advancedToggle()).toHaveAttribute("aria-expanded", "true"));
    expect(screen.getByLabelText(T("advanced.attempts"))).toHaveTextContent(
      T("advanced.attempts.unlimited")
    );
  });

  it("ignores junk values and leaves the advanced panel closed", async () => {
    renderForm("/?mode=sideways&ttl=abc&compression=lzma&security=bogus&i=-3&att=-1&d=no&ips=");
    await waitFor(() => expect(screen.getByLabelText(T("form.expires"))).toBeInTheDocument());

    expect(screen.getByRole("button", { name: T("mode.text") })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByLabelText(T("form.expires"))).toHaveTextContent(T("ttl.30min"));
    expect(pressed(T("compression.none"))).toBe("true");
    expect(advancedToggle()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("switch", { name: T("advanced.dualkey") })).not.toBeChecked();
  });

  it("ignores encrypt parameters entirely when the URL targets the decrypt tab", async () => {
    renderForm("/?tab=decrypt&p=shouldNotLand&s=maximum");
    await waitFor(() => expect(screen.getByLabelText(T("form.expires"))).toBeInTheDocument());
    expect(passInput()).toHaveValue("");
    expect(pressed(T("security.maximum"))).toBe("false");
    expect(window.location.search).toBe("?tab=decrypt&p=shouldNotLand&s=maximum");
  });

  it("applies nothing when the URL carries no parameters", async () => {
    renderForm("/");
    await waitFor(() => expect(screen.getByLabelText(T("form.expires"))).toBeInTheDocument());
    expect(passInput()).toHaveValue("");
    expect(advancedToggle()).toHaveAttribute("aria-expanded", "false");
  });
});

describe("EncryptForm — advanced options", () => {
  beforeEach(() => {
    localStorage.clear();
    resetPreferences();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("switches between the three KDF presets", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("security.maximum") }));
    expect(pressed(T("security.maximum"))).toBe("true");
    await user.click(screen.getByRole("button", { name: T("security.standard") }));
    expect(pressed(T("security.standard"))).toBe("true");
    expect(pressed(T("security.maximum"))).toBe("false");
    await user.click(screen.getByRole("button", { name: T("security.high") }));
    expect(JSON.parse(localStorage.getItem("zefer-prefs")!).iterations).toBe(600_000);
  });

  it("switches between the three compression methods", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("compression.gzip") }));
    expect(pressed(T("compression.gzip"))).toBe("true");
    await user.click(screen.getByRole("button", { name: T("compression.deflate") }));
    expect(pressed(T("compression.deflate"))).toBe("true");
    expect(JSON.parse(localStorage.getItem("zefer-prefs")!).compression).toBe("deflate");
  });

  it("reveals the dual-key field only while the toggle is on", async () => {
    renderForm();
    const toggle = screen.getByRole("switch", { name: T("advanced.dualkey") });
    expect(secondPass()).toBeNull();

    fireEvent.click(toggle);
    expect(secondPass()).toBeInTheDocument();
    expect(secondPass()).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: T("aria.showsecond") }));
    expect(secondPass()).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: T("aria.hidesecond") }));
    expect(secondPass()).toHaveAttribute("type", "password");

    fireEvent.click(toggle);
    expect(secondPass()).toBeNull();
  });

  it("toggles the reveal key visibility", async () => {
    const user = userEvent.setup();
    renderForm();
    expect(revealInput()).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: T("aria.showreveal") }));
    expect(revealInput()).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: T("aria.hidereveal") }));
    expect(revealInput()).toHaveAttribute("type", "password");
  });

  it("fills the reveal key from the generator popover", async () => {
    renderForm();
    // Two generators are rendered: the passphrase one and the reveal one.
    const triggers = screen.getAllByRole("button", { name: T("keygen.title") });
    fireEvent.click(triggers[1]);
    fireEvent.click(await screen.findByRole("button", { name: T("keygen.use") }));
    expect(revealInput().value.length).toBeGreaterThan(0);
  });

  it("shows the answer field only once a question is typed", () => {
    renderForm();
    expect(screen.queryByLabelText(T("advanced.question.answer"))).toBeNull();
    setField(screen.getByLabelText(T("advanced.question")), "Pet name?");
    expect(screen.getByLabelText(T("advanced.question.answer"))).toBeInTheDocument();
  });

  it("picks a maximum attempt count", () => {
    renderForm();
    chooseOption(T("advanced.attempts"), "10");
    expect(screen.getByLabelText(T("advanced.attempts"))).toHaveTextContent("10");
  });

  it("records a hint and a public note", () => {
    renderForm();
    setField(screen.getByLabelText(T("advanced.hint")), "two parts");
    setField(screen.getByLabelText(T("advanced.note")), "for alice");
    expect(screen.getByLabelText(T("advanced.hint"))).toHaveValue("two parts");
    expect(screen.getByLabelText(T("advanced.note"))).toHaveValue("for alice");
  });

  // ─── IP allowlist ───

  it("shows the neutral disclaimer until an IP is detected", () => {
    renderForm();
    expect(screen.getByText(T("advanced.ip.disclaimer"))).toBeInTheDocument();
  });

  it("appends the detected IP and reports a clean result", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ ip: "8.8.8.8", origin: "8.8.8.8" }) }))
    );
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: T("advanced.ip.addmine") }));
    await waitFor(() => expect(ipInput()).toHaveValue("8.8.8.8"));
    expect(screen.getByText(T("advanced.ip.clean"))).toBeInTheDocument();

    // A second detection appends to what is already there.
    await user.click(screen.getByRole("button", { name: T("advanced.ip.addmine") }));
    await waitFor(() => expect(ipInput()).toHaveValue("8.8.8.8, 8.8.8.8"));
  });

  it("warns when the detected IP looks like a VPN exit node", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ ip: "104.28.1.1", origin: "104.28.1.1" }),
      }))
    );
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("advanced.ip.addmine") }));
    await waitFor(() => expect(screen.getByText(T("advanced.ip.vpn"))).toBeInTheDocument());
    expect(ipInput()).toHaveValue("104.28.1.1");
  });

  it("warns when the detection services disagree", async () => {
    let call = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        call += 1;
        const ip = call === 1 ? "9.9.9.9" : "1.2.3.4";
        return { ok: true, json: async () => ({ ip, origin: ip }) };
      })
    );
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("advanced.ip.addmine") }));
    await waitFor(() =>
      expect(screen.getByText(T("advanced.ip.inconsistent"), { exact: false })).toBeInTheDocument()
    );
    expect(ipInput()).toHaveValue("1.2.3.4");
  });

  it("leaves the field untouched when no service answers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, json: async () => ({}) }))
    );
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("advanced.ip.addmine") }));
    await waitFor(() => expect(screen.getByText(T("advanced.ip.clean"))).toBeInTheDocument());
    expect(ipInput()).toHaveValue("");
  });

  it("disables the detect button while the lookup runs", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        await gate;
        return { ok: true, json: async () => ({ ip: "8.8.8.8", origin: "8.8.8.8" }) };
      })
    );
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: T("advanced.ip.addmine") }));
    const busy = await screen.findByRole("button", { name: "..." });
    expect(busy).toBeDisabled();

    await act(async () => {
      release();
      await Promise.resolve();
    });
    await waitFor(() => expect(ipInput()).toHaveValue("8.8.8.8"));
  });
});

describe("EncryptForm — security validation", () => {
  beforeEach(() => {
    localStorage.clear();
    resetPreferences();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("refuses a second passphrase shorter than six characters", async () => {
    const user = userEvent.setup();
    renderForm();
    setText("secret");
    await user.type(passInput(), "longenough");
    fireEvent.click(screen.getByRole("switch", { name: T("advanced.dualkey") }));
    setField(secondPass(), "abc");
    await user.click(submit());
    expect(errorText()).toContain(T("form.error.passphrase2"));
  });

  it("refuses a reveal key shorter than six characters", async () => {
    const user = userEvent.setup();
    renderForm();
    setText("secret");
    await user.type(passInput(), "longenough");
    setField(revealInput(), "abc");
    await user.click(submit());
    expect(errorText()).toContain(T("form.error.revealkey"));
  });

  it("refuses a reveal key identical to the passphrase", async () => {
    const user = userEvent.setup();
    renderForm();
    setText("secret");
    await user.type(passInput(), "longenough");
    setField(revealInput(), "longenough");
    await user.click(submit());
    expect(errorText()).toContain(T("form.error.revealkey.same"));
  });

  it("refuses a secret question without an answer", async () => {
    const user = userEvent.setup();
    renderForm();
    setText("secret");
    await user.type(passInput(), "longenough");
    setField(screen.getByLabelText(T("advanced.question")), "Pet name?");
    await user.click(submit());
    expect(errorText()).toContain(T("form.error.noanswer"));
  });
});

describe("EncryptForm — encrypted security metadata", () => {
  beforeEach(() => {
    localStorage.clear();
    resetPreferences();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps expiry, question, attempts and IPs inside the ciphertext", async () => {
    const user = userEvent.setup();
    const blobs = captureDownloads();
    renderForm();

    setText("classified");
    await user.type(passInput(), "correct horse");
    setField(screen.getByLabelText(T("advanced.hint")), "two parts");
    setField(screen.getByLabelText(T("advanced.note")), "for alice");
    setField(screen.getByLabelText(T("advanced.question")), "Pet name?");
    setField(screen.getByLabelText(T("advanced.question.answer")), "rex");
    setField(ipInput(), "10.0.0.1, ::1");
    chooseOption(T("advanced.attempts"), "3");
    await encryptAndWait(user);

    const result = await decodeZefer("", "correct horse", {
      fileBlob: blobs[0],
      questionAnswer: "rex",
    });
    if (!result.ok) throw new Error("decode failed");
    expect(result.payload.meta.question).toBe("Pet name?");
    expect(result.payload.meta.maxAttempts).toBe(3);
    expect(result.payload.meta.allowedIps).toEqual(["10.0.0.1", "::1"]);
    expect(result.payload.meta.answerHash).not.toBeNull();
    // Only the hint and note are public.
    expect(result.header.hint).toBe("two parts");
    expect(result.header.note).toBe("for alice");
  });

  it("encrypts with a dual key that a single passphrase cannot open", async () => {
    const user = userEvent.setup();
    const blobs = captureDownloads();
    renderForm();

    setText("two-person rule");
    await user.type(passInput(), "firstKey1");
    fireEvent.click(screen.getByRole("switch", { name: T("advanced.dualkey") }));
    setField(secondPass(), "secondKey1");
    await encryptAndWait(user);

    const wrong = await decodeZefer("", "firstKey1", { fileBlob: blobs[0] });
    expect(wrong).toEqual({ ok: false, error: "wrong_passphrase" });
    const right = await decodeZefer("", "firstKey1", {
      fileBlob: blobs[0],
      secondPassphrase: "secondKey1",
    });
    if (!right.ok) throw new Error("decode failed");
    expect(right.payload.content).toBe("two-person rule");
  });

  it("adds a reveal block that opens the same payload", async () => {
    const user = userEvent.setup();
    const blobs = captureDownloads();
    renderForm();

    setText("shared secret");
    await user.type(passInput(), "mainKey123");
    setField(revealInput(), "revealKey123");
    await encryptAndWait(user);

    const viaReveal = await decodeZefer("", "revealKey123", { fileBlob: blobs[0] });
    if (!viaReveal.ok) throw new Error("decode failed");
    expect(viaReveal.payload.content).toBe("shared secret");

    // The share link carries the reveal key, never the main passphrase.
    const link = screen.getByText(/\?t=decrypt/).textContent!;
    expect(link).toContain("p=revealKey123");
    expect(link).not.toContain("mainKey123");
    expect(link).not.toContain("p2=");
  });

  it("puts both keys in the share link for a dual-key secret", async () => {
    const user = userEvent.setup();
    captureDownloads();
    renderForm();

    setText("two-person rule");
    await user.type(passInput(), "firstKey1");
    fireEvent.click(screen.getByRole("switch", { name: T("advanced.dualkey") }));
    setField(secondPass(), "secondKey1");
    await encryptAndWait(user);

    const link = screen.getByText(/\?t=decrypt/).textContent!;
    expect(link).toContain("p=firstKey1");
    expect(link).toContain("p2=secondKey1");
  });

});

describe("EncryptForm — success panel", () => {
  beforeEach(() => {
    localStorage.clear();
    resetPreferences();
    captureDownloads();
  });

  afterEach(() => {
    stubShare({});
    vi.restoreAllMocks();
  });

  async function encryptSomething() {
    const user = userEvent.setup();
    renderForm();
    setText("payload");
    await user.type(passInput(), "correct horse");
    await encryptAndWait(user);
    return user;
  }

  it("downloads the encrypted file again on demand", async () => {
    stubShare({});
    const clicks: string[] = [];
    const user = await encryptSomething();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      clicks.push(this.download);
    });

    await user.click(screen.getByRole("button", { name: T("aria.downloadfile") }));
    expect(clicks).toEqual(["secret.zefer"]);
  });

  it("shares the file with a title when the platform accepts the full payload", async () => {
    const shared: ShareData[] = [];
    stubShare({
      share: async (data) => {
        shared.push(data);
      },
      canShare: () => true,
    });
    const user = await encryptSomething();

    expect(screen.getByText(T("encrypt.success.separate"))).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: T("aria.sharefile") }));

    expect(shared).toHaveLength(1);
    expect(shared[0].files?.[0].name).toBe("secret.zefer");
    expect(shared[0].title).toBe(T("encrypt.success.file.share.title"));
    // The key never travels with the file.
    expect(JSON.stringify(shared[0])).not.toContain("correct horse");
  });

  it("falls back to a file-only share when text is not accepted", async () => {
    const shared: ShareData[] = [];
    stubShare({
      share: async (data) => {
        shared.push(data);
      },
      canShare: (data) => !data.title,
    });
    const user = await encryptSomething();

    await user.click(screen.getByRole("button", { name: T("aria.sharefile") }));
    expect(shared[0].title).toBeUndefined();
    expect(shared[0].files).toHaveLength(1);
  });

  it("stays usable when the native share sheet rejects", async () => {
    stubShare({
      share: async () => {
        throw new Error("dismissed");
      },
      canShare: () => true,
    });
    const user = await encryptSomething();

    await user.click(screen.getByRole("button", { name: T("aria.sharefile") }));
    expect(screen.getByRole("button", { name: T("aria.downloadfile") })).toBeInTheDocument();
  });

  it("explains why sending is unavailable when the platform refuses the file", async () => {
    stubShare({ share: async () => {}, canShare: () => false });
    await encryptSomething();

    const disabled = screen.getByRole("button", {
      name: T("encrypt.success.file.unsupported"),
    });
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    fireEvent.pointerDown(disabled);
    expect(await screen.findByText(T("encrypt.success.file.unsupported"))).toBeInTheDocument();
  });

  it("explains why sending is unavailable when the API is missing entirely", async () => {
    stubShare({});
    await encryptSomething();
    expect(
      screen.getByRole("button", { name: T("encrypt.success.file.unsupported") })
    ).toHaveAttribute("aria-disabled", "true");
    // No share API at all also means no link-share button.
    expect(screen.queryByRole("button", { name: T("aria.sharelink") })).toBeNull();
    expect(screen.getByText(T("encrypt.success.separate"))).toBeInTheDocument();
  });

  it("shares and copies the decrypt link", async () => {
    const shared: ShareData[] = [];
    stubShare({
      share: async (data) => {
        shared.push(data);
      },
      canShare: () => false,
    });
    const user = await encryptSomething();
    // userEvent.setup() installs its own clipboard stub, so spy on it afterwards.
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();

    await user.click(screen.getByRole("button", { name: T("aria.sharelink") }));
    expect(shared[0].url).toContain("?t=decrypt");
    expect(shared[0].url).toContain("p=correct+horse");

    await user.click(screen.getByRole("button", { name: T("aria.copylink") }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("?t=decrypt"));
    // The button confirms, then goes back to the copy icon.
    expect(screen.getByRole("button", { name: T("aria.copylink") }).querySelector("svg")).toHaveClass(
      "text-primary"
    );
    await waitFor(
      () =>
        expect(
          screen.getByRole("button", { name: T("aria.copylink") }).querySelector("svg")
        ).not.toHaveClass("text-primary"),
      { timeout: 4000 }
    );
  });

  it("survives a rejected link share", async () => {
    stubShare({
      share: async () => {
        throw new Error("dismissed");
      },
      canShare: () => false,
    });
    const user = await encryptSomething();
    await user.click(screen.getByRole("button", { name: T("aria.sharelink") }));
    expect(screen.getByRole("button", { name: T("aria.copylink") })).toBeInTheDocument();
  });

  it("shows no separate-channel warning when neither sharing nor a link exist", async () => {
    stubShare({});
    const user = userEvent.setup();
    renderForm();
    chooseOption(T("form.expires"), T("ttl.never"));
    setText("payload");
    await user.type(passInput(), "correct horse");
    await encryptAndWait(user);

    expect(screen.queryByText(T("encrypt.success.separate"))).toBeNull();
    expect(screen.queryByText(T("encrypt.success.link.title"))).toBeNull();
  });
});

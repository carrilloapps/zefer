/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { LanguageProvider, useLanguage } from "../LanguageProvider";
import DecryptForm from "../DecryptForm";
import { encodeZefer, type EncodeOptions, type ZeferMeta } from "@/app/lib/zefer";
import { encrypt, encryptBytesToBase64 } from "@/app/lib/crypto";
import { setPendingDecryptFile } from "@/app/lib/file-handoff";
import { t, type TranslationKey } from "@/app/lib/i18n";

const en = (key: TranslationKey) => t(key, "en");

const PASS = "correct-horse";
/** PBKDF2 is the slow part; the format does not care how many rounds it took. */
const ITERATIONS = 1000;
const FIND = { timeout: 8000 } as const;

// ─── Fixtures ───

async function zeferFile(opts: Partial<EncodeOptions> = {}, name = "secret.zefer"): Promise<File> {
  const blob = await encodeZefer({
    content: "top secret",
    passphrase: PASS,
    fileName: null,
    expiresAt: 0,
    iterations: ITERATIONS,
    ...opts,
  });
  return new File([await blob.arrayBuffer()], name, { type: "application/octet-stream" });
}

function textFile(contents: string, name = "legacy.zefer"): File {
  return new File([contents], name, { type: "text/plain" });
}

function legacyMeta(over: Partial<ZeferMeta> = {}): ZeferMeta {
  return {
    v: 3, fileName: null, fileType: null, fileSize: 0,
    expiresAt: 0, createdAt: 1000, answerHash: null,
    allowedIps: [], question: null, maxAttempts: 0,
    ...over,
  };
}

/** Legacy ZEFER3 container: magic line, header line, base64 payload lines. */
async function legacyZefer3File(content: string): Promise<File> {
  const metaBytes = new TextEncoder().encode(JSON.stringify(legacyMeta({ fileName: "old.txt" })));
  const contentBytes = new TextEncoder().encode(content);
  const packed = new Uint8Array(4 + metaBytes.length + contentBytes.length);
  new DataView(packed.buffer).setUint32(0, metaBytes.length, false);
  packed.set(metaBytes, 4);
  packed.set(contentBytes, 4 + metaBytes.length);

  const line = await encryptBytesToBase64(packed.buffer, PASS, ITERATIONS);
  const header = { iterations: ITERATIONS, compression: "none", hint: null, note: "from v3", mode: "text" };
  return textFile(`ZEFER3\n${JSON.stringify(header)}\n${line}`);
}

/** Legacy ZEFER2 container: the whole plaintext is one JSON document. */
async function legacyZefer2File(content: string): Promise<File> {
  const line = await encrypt(
    JSON.stringify({ content, fileName: "ancient.txt", expiresAt: 0, createdAt: 42, answerHash: null }),
    PASS,
    ITERATIONS
  );
  const header = { iterations: ITERATIONS, compression: "none", hint: "very old", note: null, mode: "text" };
  return textFile(`ZEFER2\n${JSON.stringify(header)}\n${line}`);
}

// ─── Harness ───

function Harness() {
  const { setLocale, locale } = useLanguage();
  return (
    <>
      <button type="button" onClick={() => setLocale(locale === "en" ? "es" : "en")}>switch-locale</button>
      <DecryptForm />
    </>
  );
}

function setup(withHarness = false) {
  const user = userEvent.setup();
  render(<LanguageProvider>{withHarness ? <Harness /> : <DecryptForm />}</LanguageProvider>);
  return { user };
}

const fileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;
const dropzone = () => screen.getByRole("button", { name: en("decrypt.file.placeholder") });
const submitButton = () => screen.getByRole("button", { name: en("decrypt.submit") });
const passInput = () => screen.getByLabelText(en("form.passphrase"));
const alert = () => screen.getByRole("alert");

/** Let the async public-header read settle before asserting. */
async function settle() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

async function loadFile(user: UserEvent, file: File) {
  await user.upload(fileInput(), file);
  await settle();
}

async function unlock(user: UserEvent, passphrase = PASS) {
  await user.clear(passInput());
  await user.type(passInput(), passphrase);
  await user.click(submitButton());
}

/** Answer every IP lookup with the same address (or fail them all). */
function stubIp(ip: string | null) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    if (ip === null) throw new Error("offline");
    return { ok: true, json: async () => ({ ip, origin: ip }) } as unknown as Response;
  });
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
  // jsdom's object URLs cannot handle a Blob built from another Blob.
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:zefer-test");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── File intake ───

describe("DecryptForm file intake", () => {
  it("refuses anything that is not a .zefer container", async () => {
    setup();
    fireEvent.change(fileInput(), { target: { files: [textFile("plain", "notes.txt")] } });

    expect(alert()).toHaveTextContent(en("decrypt.error.format"));
    expect(screen.getByRole("button", { name: en("decrypt.file.placeholder") })).toBeInTheDocument();
  });

  it("ignores a change event that carries no file", async () => {
    setup();
    fireEvent.change(fileInput(), { target: { files: [] } });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(dropzone()).toBeInTheDocument();
  });

  it("opens the file picker when the dropzone is activated", async () => {
    const { user } = setup();
    const click = vi.spyOn(fileInput(), "click").mockImplementation(() => {});

    await user.click(dropzone());

    expect(click).toHaveBeenCalledOnce();
  });

  it("accepts a file dropped on the dropzone and highlights while dragging", async () => {
    setup();
    const file = await zeferFile();

    fireEvent.dragEnter(dropzone());
    expect(dropzone().className).toContain("ring-2");
    fireEvent.dragLeave(dropzone());
    expect(dropzone().className).not.toContain("ring-2");
    fireEvent.dragOver(dropzone());
    expect(dropzone().className).toContain("ring-2");

    fireEvent.drop(dropzone(), { dataTransfer: { files: [file] } });
    await settle();

    expect(screen.getByText("secret.zefer")).toBeInTheDocument();
  });

  it("ignores a drop that carries no file", async () => {
    setup();
    fireEvent.drop(dropzone(), { dataTransfer: { files: [] } });
    await settle();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(dropzone().className).not.toContain("ring-2");
  });

  it("rejects a file larger than the device can handle", async () => {
    const { user } = setup();
    const file = await zeferFile();
    Object.defineProperty(file, "size", { value: Number.MAX_SAFE_INTEGER });

    await loadFile(user, file);

    expect(alert().textContent).toContain(en("decrypt.error.toolarge"));
    expect(fileInput().value).toBe("");
  });

  it("reports a file it cannot read", async () => {
    const { user } = setup();
    const file = await zeferFile();
    Object.defineProperty(file, "slice", {
      value: () => {
        throw new Error("unreadable");
      },
    });

    await loadFile(user, file);

    expect(alert()).toHaveTextContent(en("form.error.file.read"));
  });

  it("previews the public note and hint before any passphrase is typed", async () => {
    const { user } = setup();
    await loadFile(user, await zeferFile({ note: "For Alice", hint: "check email" }));

    expect(screen.getByText("For Alice")).toBeInTheDocument();
    expect(screen.getByText("check email")).toBeInTheDocument();
    expect(screen.getByText(en("decrypt.info.note"))).toBeInTheDocument();
    expect(screen.getByText(en("decrypt.info.hint"))).toBeInTheDocument();
  });

  it("shows no preview panel when the header carries neither note nor hint", async () => {
    const { user } = setup();
    await loadFile(user, await zeferFile());

    expect(screen.queryByText(en("decrypt.info.note"))).not.toBeInTheDocument();
    expect(screen.queryByText(en("decrypt.info.hint"))).not.toBeInTheDocument();
  });

  it("takes a file handed over from the analyzer, exactly once", async () => {
    const first = await zeferFile({}, "handed-over.zefer");
    setPendingDecryptFile(first);
    const { user } = setup(true);
    await settle();
    expect(screen.getByText("handed-over.zefer")).toBeInTheDocument();

    // A locale switch re-creates the file handler; the handoff must not re-run.
    setPendingDecryptFile(await zeferFile({}, "second.zefer"));
    await user.click(screen.getByRole("button", { name: "switch-locale" }));
    await settle();

    expect(screen.getByText("handed-over.zefer")).toBeInTheDocument();
    expect(screen.queryByText("second.zefer")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: t("decrypt.title", "es") })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "switch-locale" }));
  });
});

// ─── URL parameters ───

describe("DecryptForm URL parameters", () => {
  it("fills the passphrases from the long aliases and scrubs them off the URL", async () => {
    window.history.replaceState({}, "", "/?tab=decrypt&passphrase=from-url&passphrase2=second-url");
    setup();

    await waitFor(() => expect(passInput()).toHaveValue("from-url"));
    expect(screen.getByRole("switch", { name: en("decrypt.dualkey.toggle") })).toBeChecked();
    expect(screen.getByLabelText(en("advanced.dualkey"))).toHaveValue("second-url");
    expect(window.location.search).toBe("");
  });

  it("accepts the short aliases and the dual flag on its own", async () => {
    window.history.replaceState({}, "", "/?t=decrypt&p=short-url&d=1");
    setup();

    await waitFor(() => expect(passInput()).toHaveValue("short-url"));
    expect(screen.getByRole("switch", { name: en("decrypt.dualkey.toggle") })).toBeChecked();
    expect(screen.getByLabelText(en("advanced.dualkey"))).toHaveValue("");
  });

  it("leaves a non-sensitive URL untouched", async () => {
    window.history.replaceState({}, "", "/?tab=decrypt&dual=true");
    setup();

    await waitFor(() =>
      expect(screen.getByRole("switch", { name: en("decrypt.dualkey.toggle") })).toBeChecked()
    );
    expect(passInput()).toHaveValue("");
    expect(window.location.search).toBe("?tab=decrypt&dual=true");
  });

  it("answers the secret question straight from the URL", async () => {
    window.history.replaceState({}, "", "/?p=" + PASS + "&a=firulais");
    const { user } = setup();
    await waitFor(() => expect(passInput()).toHaveValue(PASS));

    await loadFile(user, await zeferFile({ content: "quiz passed", question: "Pet name?", questionAnswer: "firulais" }));
    await user.click(submitButton());

    expect(await screen.findByText("quiz passed", {}, FIND)).toBeInTheDocument();
    expect(window.location.search).toBe("");
  });

  it("ignores params addressed to the encrypt tab", async () => {
    window.history.replaceState({}, "", "/?t=encrypt&p=not-for-me");
    setup();
    await settle();

    expect(passInput()).toHaveValue("");
    expect(window.location.search).toBe("?t=encrypt&p=not-for-me");
  });

  it("hydrates a server-rendered form and only then applies the URL", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.innerHTML = renderToString(
      <LanguageProvider>
        <DecryptForm />
      </LanguageProvider>
    );
    window.history.replaceState({}, "", "/?p=hydrated-key");

    render(
      <LanguageProvider>
        <DecryptForm />
      </LanguageProvider>,
      { container, hydrate: true }
    );

    await waitFor(() => expect(passInput()).toHaveValue("hydrated-key"));
    expect(window.location.search).toBe("");
  });
});

// ─── Decryption ───

describe("DecryptForm decryption", () => {
  it("requires a file and a passphrase", async () => {
    const { user } = setup();

    await user.click(submitButton());
    expect(alert()).toHaveTextContent(en("decrypt.error.nofile"));

    await loadFile(user, await zeferFile());
    await user.click(submitButton());
    expect(alert()).toHaveTextContent(en("decrypt.error.nopass"));
  });

  it("reveals text, reports progress, copies, downloads and resets", async () => {
    const { user } = setup();
    await loadFile(user, await zeferFile({ content: "launch codes", expiresAt: Date.now() + 600_000 }));
    await user.type(passInput(), PASS);

    fireEvent.submit(submitButton());
    const progress = await screen.findByRole("status", {}, FIND);
    expect(progress.querySelector("progress.crypto-progress")).toBeInTheDocument();

    expect(await screen.findByText("launch codes", {}, FIND)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: en("decrypt.success.title") })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(en("decrypt.expires")))).toBeInTheDocument();

    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    await user.click(screen.getByRole("button", { name: en("decrypt.copy") }));
    expect(writeText).toHaveBeenCalledWith("launch codes");
    expect(await screen.findByText(en("success.copied"), {}, FIND)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(en("success.copied"))).toBeNull(), { timeout: 4000 });

    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("secret.txt");
    });
    await user.click(screen.getByRole("button", { name: en("decrypt.download") }));
    expect(click).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: en("decrypt.another") }));
    expect(dropzone()).toBeInTheDocument();
    expect(passInput()).toHaveValue("");
  });

  it("downloads a decrypted file under its original name and type", async () => {
    const { user } = setup();
    const payload = new TextEncoder().encode("PDF-BYTES");
    await loadFile(
      user,
      await zeferFile({ content: undefined, fileData: payload.buffer as ArrayBuffer, fileName: "report.pdf", fileType: "application/pdf" })
    );
    await unlock(user);

    expect(await screen.findByText(en("decrypt.success.title"), {}, FIND)).toBeInTheDocument();
    expect(screen.getAllByText("report.pdf").length).toBeGreaterThan(0);
    expect(screen.getByText(/application\/pdf/)).toBeInTheDocument();
    expect(screen.getByText(en("decrypt.never"))).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: en("decrypt.copy") })).not.toBeInTheDocument();

    let downloadName = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloadName = this.download;
    });
    await user.click(screen.getByRole("button", { name: en("decrypt.download") }));
    expect(downloadName).toBe("report.pdf");
  });

  it("falls back to a generic name for a nameless, typeless file payload", async () => {
    const { user } = setup();
    await loadFile(user, await zeferFile({ content: undefined, fileData: new Uint8Array([1, 2, 3]).buffer as ArrayBuffer }));
    await unlock(user);

    expect(await screen.findByText(en("decrypt.success.title"), {}, FIND)).toBeInTheDocument();
    let downloadName = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloadName = this.download;
    });
    await user.click(screen.getByRole("button", { name: en("decrypt.download") }));
    expect(downloadName).toBe("file");
  });

  it("has nothing to copy when the secret is empty", async () => {
    const { user } = setup();
    await loadFile(user, await zeferFile({ content: "" }));
    await unlock(user);

    expect(await screen.findByText(en("decrypt.success.title"), {}, FIND)).toBeInTheDocument();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    await user.click(screen.getByRole("button", { name: en("decrypt.copy") }));
    expect(writeText).not.toHaveBeenCalled();
    expect(screen.queryByText(en("success.copied"))).not.toBeInTheDocument();

    let downloadName = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloadName = this.download;
    });
    await user.click(screen.getByRole("button", { name: en("decrypt.download") }));
    expect(downloadName).toBe("secret.txt");
  });

  it("rejects a wrong passphrase and keeps the form open", async () => {
    const { user } = setup();
    await loadFile(user, await zeferFile());
    await unlock(user, "not-the-key");

    expect(await screen.findByRole("alert", {}, FIND)).toHaveTextContent(en("decrypt.error.wrong"));
    expect(submitButton()).toBeEnabled();
  });

  it("unlocks a dual-key file only with both passphrases", async () => {
    const { user } = setup();
    await loadFile(user, await zeferFile({ secondPassphrase: "second-key", dualKey: true }));

    await unlock(user);
    expect(await screen.findByRole("alert", {}, FIND)).toHaveTextContent(en("decrypt.error.wrong"));

    await user.click(screen.getByRole("switch", { name: en("decrypt.dualkey.toggle") }));
    await user.type(screen.getByLabelText(en("advanced.dualkey")), "second-key");
    await user.click(submitButton());

    expect(await screen.findByText("top secret", {}, FIND)).toBeInTheDocument();
  });

  it("asks the secret question, refuses a wrong answer and accepts the right one", async () => {
    const { user } = setup();
    await loadFile(user, await zeferFile({ question: "Pet name?", questionAnswer: "firulais" }));

    await unlock(user);
    expect(await screen.findByRole("alert", {}, FIND)).toHaveTextContent(en("decrypt.error.noanswer"));

    // The passphrase survives a failed attempt, so only the answer is needed.
    await user.type(screen.getByLabelText(en("decrypt.question.label")), "rex");
    await user.click(submitButton());
    expect(await screen.findByRole("alert", {}, FIND)).toHaveTextContent(en("decrypt.error.wronganswer"));

    await user.clear(screen.getByLabelText(en("decrypt.question.label")));
    await user.type(screen.getByLabelText(en("decrypt.question.label")), "firulais");
    await user.click(submitButton());

    expect(await screen.findByText("top secret", {}, FIND)).toBeInTheDocument();
  });

  it("reads a legacy ZEFER3 text container", async () => {
    const { user } = setup();
    await loadFile(user, await legacyZefer3File("legacy secret"));

    expect(screen.getByText("from v3")).toBeInTheDocument();
    await unlock(user);

    expect(await screen.findByText("legacy secret", {}, FIND)).toBeInTheDocument();
    expect(screen.getByText("old.txt")).toBeInTheDocument();
  });

  it("reads a legacy ZEFER2 text container", async () => {
    const { user } = setup();
    await loadFile(user, await legacyZefer2File("ancient secret"));

    expect(screen.getByText("very old")).toBeInTheDocument();
    await unlock(user);

    expect(await screen.findByText("ancient secret", {}, FIND)).toBeInTheDocument();
  });

  it("reports an unparseable container", async () => {
    const { user } = setup();
    await loadFile(user, textFile("not a zefer file at all", "broken.zefer"));
    await unlock(user);

    expect(await screen.findByRole("alert", {}, FIND)).toHaveTextContent(en("decrypt.error.format"));
  });

  it("surfaces an unexpected failure as a generic error", async () => {
    const { user } = setup();
    await loadFile(user, await zeferFile());
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => {
      throw new Error("boom");
    });
    await unlock(user);

    expect(await screen.findByRole("alert", {}, FIND)).toHaveTextContent(en("form.error.generic"));
  });

  it("toggles passphrase visibility on both fields", async () => {
    const { user } = setup();
    expect(passInput()).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: en("aria.showpass") }));
    expect(passInput()).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: en("aria.hidepass") }));
    expect(passInput()).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("switch", { name: en("decrypt.dualkey.toggle") }));
    const second = screen.getByLabelText(en("advanced.dualkey"));
    await user.click(screen.getByRole("button", { name: en("aria.showsecond") }));
    expect(second).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: en("aria.hidesecond") }));
    expect(second).toHaveAttribute("type", "password");
  });
});

// ─── Dead ends ───

describe("DecryptForm dead ends", () => {
  it("blocks an expired file and offers a fresh start", async () => {
    const { user } = setup();
    await loadFile(user, await zeferFile({ expiresAt: Date.now() - 1000 }));
    await unlock(user);

    expect(await screen.findByRole("heading", { name: en("decrypt.expired.title") }, FIND)).toBeInTheDocument();
    expect(screen.getByText(en("decrypt.expired.desc"))).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: en("decrypt.tryother") }));
    expect(dropzone()).toBeInTheDocument();
  });

  it("blocks a file whose attempts are exhausted", async () => {
    localStorage.setItem("zefer_attempts_bin", "3");
    const { user } = setup();
    await loadFile(user, await zeferFile({ maxAttempts: 3 }));
    await unlock(user);

    expect(await screen.findByRole("heading", { name: en("decrypt.blocked.title") }, FIND)).toBeInTheDocument();
  });

  it("blocks a disallowed IP and shows it", async () => {
    stubIp("198.51.100.7");
    const { user } = setup();
    await loadFile(user, await zeferFile({ allowedIps: ["203.0.113.9"] }));
    await unlock(user);

    expect(await screen.findByRole("heading", { name: en("decrypt.ipblocked.title") }, FIND)).toBeInTheDocument();
    expect(screen.getByText(en("decrypt.ipblocked.yourip"))).toBeInTheDocument();
    expect(screen.getByText("198.51.100.7")).toBeInTheDocument();
  });

  it("blocks an IP-restricted file when the address cannot be detected", async () => {
    stubIp(null);
    const { user } = setup();
    await loadFile(user, await zeferFile({ allowedIps: ["203.0.113.9"] }));
    await unlock(user);

    expect(await screen.findByRole("heading", { name: en("decrypt.ipblocked.title") }, FIND)).toBeInTheDocument();
    expect(screen.queryByText(en("decrypt.ipblocked.yourip"))).not.toBeInTheDocument();
  });

  it("lets an allowed IP through", async () => {
    stubIp("203.0.113.9");
    const { user } = setup();
    await loadFile(user, await zeferFile({ content: "ip gated", allowedIps: ["203.0.113.9"] }));
    await unlock(user);

    expect(await screen.findByText("ip gated", {}, FIND)).toBeInTheDocument();
  });
});

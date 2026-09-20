/** @vitest-environment jsdom */
import { useEffect } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
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

/** The store is module-level, so every test starts from the same known state.
 *  One PBKDF2 iteration keeps the real crypto round-trips fast. */
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

function renderForm() {
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
const textPicker = () =>
  document.querySelector<HTMLInputElement>('input[type="file"][accept=".txt,.env"]')!;
const filePicker = () =>
  document.querySelector<HTMLInputElement>('input[type="file"]:not([accept])')!;
const dropzone = () => screen.getByRole("button", { name: T("mode.file.placeholder") });
const errorText = () => screen.getByRole("alert").textContent;

function setText(value: string) {
  fireEvent.change(textArea(), { target: { value } });
}

/** Drive a Radix Select. userEvent's synthetic pointer stops opening Radix
 *  triggers after the first test in a file, so the two events the primitive
 *  actually listens for are dispatched directly. */
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

function pick(input: HTMLInputElement, files: File[] | null) {
  Object.defineProperty(input, "files", { configurable: true, value: files });
  fireEvent.change(input);
}

/** Capture every blob handed to the download helper. */
function captureDownloads() {
  const blobs: Blob[] = [];
  vi.spyOn(URL, "createObjectURL").mockImplementation((obj: Blob | MediaSource) => {
    blobs.push(obj as Blob);
    return "blob:captured";
  });
  return blobs;
}

async function encryptAndWait(user: ReturnType<typeof userEvent.setup>) {
  await user.click(submit());
  await screen.findByRole("heading", { level: 2, name: T("encrypt.success.title") }, {
    timeout: 20_000,
  });
}

describe("EncryptForm", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    localStorage.clear();
    resetPreferences();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Rendering ───

  it("renders the text mode by default with the expiry select", () => {
    renderForm();
    expect(screen.getByRole("heading", { level: 2, name: T("encrypt.title") })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: T("mode.text") })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(textArea()).toBeInTheDocument();
    expect(screen.getByLabelText(T("form.expires"))).toHaveTextContent(T("ttl.30min"));
  });

  it("renders on the server from the default snapshots", () => {
    const html = renderToString(
      <LanguageProvider>
        <EncryptForm />
      </LanguageProvider>
    );
    expect(html).toContain(T("encrypt.title"));
    // Server snapshot: text mode, advanced panel present, no device probing.
    expect(html).toContain(T("form.content.placeholder"));
    expect(html).toContain(T("form.security.note"));
  });

  // ─── Validation ───

  it("refuses an empty secret", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(submit());
    expect(errorText()).toContain(T("form.error.empty"));
  });

  it("refuses binary content pasted into the textarea", async () => {
    const user = userEvent.setup();
    renderForm();
    setText("\u0001\u0002\u0003abc");
    await user.type(passInput(), "longenough");
    await user.click(submit());
    expect(errorText()).toContain(T("form.error.binary"));
  });

  it("accepts tabs, newlines and carriage returns as plain text", async () => {
    const user = userEvent.setup();
    renderForm();
    setText("line\tone\nline\r\ntwo");
    await user.type(passInput(), "longenough");
    captureDownloads();
    await encryptAndWait(user);
    expect(screen.getByRole("heading", { level: 2, name: T("encrypt.success.title") })).toBeInTheDocument();
  });

  it("refuses a missing passphrase and one shorter than six characters", async () => {
    const user = userEvent.setup();
    renderForm();
    setText("secret");

    await user.click(submit());
    expect(errorText()).toContain(T("form.error.passphrase"));

    await user.type(passInput(), "short");
    await user.click(submit());
    expect(errorText()).toContain(T("form.error.passphrase"));
  });

  it("refuses file mode with no file attached", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("mode.file") }));
    await user.type(passInput(), "longenough");
    await user.click(submit());
    expect(errorText()).toContain(T("form.error.nofile"));
  });

  // ─── Passphrase UI ───

  it("grades the passphrase through all four strength levels", async () => {
    const user = userEvent.setup();
    renderForm();
    const meter = () => document.querySelector(".strength-meter-fill")!;

    expect(document.querySelector(".strength-meter")).toBeNull();

    await user.type(passInput(), "abc");
    expect(meter()).toHaveClass("strength-weak");
    expect(screen.getByText(T("strength.weak"))).toBeInTheDocument();

    await user.type(passInput(), "defg");
    expect(meter()).toHaveClass("strength-fair");

    await user.type(passInput(), "hijkl");
    expect(meter()).toHaveClass("strength-good");

    await user.type(passInput(), "mnopqrstuv");
    expect(meter()).toHaveClass("strength-strong");
  });

  it("toggles passphrase visibility", async () => {
    const user = userEvent.setup();
    renderForm();
    expect(passInput()).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: T("aria.showpass") }));
    expect(passInput()).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: T("aria.hidepass") }));
    expect(passInput()).toHaveAttribute("type", "password");
  });

  it("expands and collapses the advanced panel", async () => {
    const user = userEvent.setup();
    renderForm();
    const toggle = screen.getByRole("button", { name: T("advanced.title") });
    const panel = document.getElementById("advanced-options")!;

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).not.toHaveClass("advanced-open");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(panel).toHaveClass("advanced-open");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("warns when the secret never expires", () => {
    renderForm();
    expect(screen.queryByText(T("ttl.never.warning"))).toBeNull();
    chooseOption(T("form.expires"), T("ttl.never"));
    expect(screen.getByText(T("ttl.never.warning"))).toBeInTheDocument();
  });

  // ─── Text-mode file upload ───

  it("loads a .txt file into the textarea and clears it again", async () => {
    const user = userEvent.setup();
    renderForm();

    pick(textPicker(), [new File(["from disk"], "notes.txt", { type: "text/plain" })]);
    await waitFor(() => expect(textArea()).toHaveValue("from disk"));
    expect(screen.getByText("notes.txt")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: T("aria.removefile") }));
    expect(textArea()).toHaveValue("");
    expect(screen.queryByText("notes.txt")).toBeNull();
  });

  it("drops the file badge as soon as the textarea is edited by hand", async () => {
    renderForm();
    pick(textPicker(), [new File(["from disk"], "notes.env", { type: "" })]);
    await waitFor(() => expect(screen.getByText("notes.env")).toBeInTheDocument());
    setText("typed over");
    expect(screen.queryByText("notes.env")).toBeNull();
  });

  it("opens the hidden .txt picker from the upload button", async () => {
    const user = userEvent.setup();
    renderForm();
    const click = vi.spyOn(textPicker(), "click").mockImplementation(() => {});
    await user.click(screen.getByRole("button", { name: /\.txt \/ \.env/ }));
    expect(click).toHaveBeenCalledOnce();
  });

  it("ignores a change event that carries no file list", () => {
    renderForm();
    pick(textPicker(), null);
    expect(textArea()).toHaveValue("");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("rejects a text upload with the wrong extension", async () => {
    renderForm();
    pick(textPicker(), [new File(["x"], "report.pdf", { type: "application/pdf" })]);
    await waitFor(() => expect(errorText()).toContain(T("form.error.file.type")));
    expect(textPicker().value).toBe("");
  });

  it("rejects a text upload whose MIME type is not textual", async () => {
    renderForm();
    pick(textPicker(), [new File(["x"], "notes.txt", { type: "image/png" })]);
    await waitFor(() => expect(errorText()).toContain(T("form.error.file.type")));
  });

  it("rejects a text upload over the 256 KB limit", async () => {
    renderForm();
    const big = new File(["x"], "big.txt", { type: "text/plain" });
    Object.defineProperty(big, "size", { value: 300 * 1024 });
    pick(textPicker(), [big]);
    await waitFor(() => expect(errorText()).toContain(T("form.error.file.size")));
  });

  it("rejects a .txt file whose bytes are actually binary", async () => {
    renderForm();
    pick(textPicker(), [new File(["ok\u0000nope"], "notes.txt", { type: "text/plain" })]);
    await waitFor(() => expect(errorText()).toContain(T("form.error.binary")));
    expect(textArea()).toHaveValue("");
  });

  // ─── File mode ───

  it("accepts a file by click upload and removes it again", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("mode.file") }));

    pick(filePicker(), [new File(["payload"], "photo.png", { type: "image/png" })]);
    await waitFor(() => expect(screen.getByText("photo.png")).toBeInTheDocument());
    expect(screen.getByText(/image\/png/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: T("aria.removefile") }));
    expect(screen.queryByText("photo.png")).toBeNull();
    expect(dropzone()).toBeInTheDocument();
  });

  it("falls back to a generic MIME type when the browser reports none", async () => {
    const user = userEvent.setup();
    const blobs = captureDownloads();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("mode.file") }));
    pick(filePicker(), [new File(["payload"], "blob.bin", { type: "" })]);
    await waitFor(() =>
      expect(screen.getByText(/application\/octet-stream/)).toBeInTheDocument()
    );

    await user.type(passInput(), "correct horse");
    await encryptAndWait(user);
    const result = await decodeZefer("", "correct horse", { fileBlob: blobs[0] });
    if (!result.ok) throw new Error("decode failed");
    expect(result.payload.meta.fileType).toBe("application/octet-stream");
  });

  it("switches back to text mode, keeping the attached file aside", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("mode.file") }));
    pick(filePicker(), [new File(["payload"], "photo.png", { type: "image/png" })]);
    await waitFor(() => expect(screen.getByText("photo.png")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: T("mode.text") }));
    expect(screen.getByRole("button", { name: T("mode.text") })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(textArea()).toBeInTheDocument();
    expect(screen.queryByText("photo.png")).toBeNull();
  });

  it("opens the hidden picker from the dropzone and from a double-clicked tab", async () => {
    const user = userEvent.setup();
    renderForm();

    // Double-clicking the tab switches mode; the input is not mounted yet.
    await user.dblClick(screen.getByRole("button", { name: T("mode.file") }));
    expect(dropzone()).toBeInTheDocument();

    const click = vi.spyOn(filePicker(), "click").mockImplementation(() => {});
    await user.click(dropzone());
    expect(click).toHaveBeenCalledOnce();
  });

  it("ignores a file change event with no file list", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("mode.file") }));
    pick(filePicker(), null);
    expect(dropzone()).toBeInTheDocument();
  });

  it("accepts a dropped file and tracks the drag state", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("mode.file") }));
    const zone = dropzone();

    fireEvent.dragEnter(zone);
    expect(zone).toHaveClass("dropzone-active");
    fireEvent.dragLeave(zone);
    expect(zone).not.toHaveClass("dropzone-active");
    fireEvent.dragOver(zone);
    expect(zone).toHaveClass("dropzone-active");

    fireEvent.drop(zone, {
      dataTransfer: { files: [new File(["data"], "dropped.bin", { type: "application/x-bin" })] },
    });
    await waitFor(() => expect(screen.getByText("dropped.bin")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: T("mode.file.placeholder") })).not.toHaveClass(
      "dropzone-active"
    );
  });

  it("ignores a drop that carries no files", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("mode.file") }));
    fireEvent.drop(dropzone(), { dataTransfer: { files: null } });
    expect(dropzone()).toBeInTheDocument();
  });

  it("sends .txt and .env files back to text mode", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("mode.file") }));
    pick(filePicker(), [new File(["x"], "notes.txt", { type: "text/plain" })]);
    await waitFor(() => expect(errorText()).toContain(T("form.error.file.usetext")));
    expect(filePicker().value).toBe("");
  });

  it("rejects a file larger than the device limit", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("mode.file") }));
    const huge = new File(["x"], "huge.iso", { type: "application/x-iso" });
    Object.defineProperty(huge, "size", { value: 64 * 1024 * 1024 * 1024 });
    pick(filePicker(), [huge]);
    await waitFor(() => expect(errorText()).toContain(T("form.error.file.max")));
    expect(filePicker().value).toBe("");
  });

  it("warns about double encryption and locks compression for a .zefer file", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: T("mode.file") }));
    pick(filePicker(), [new File(["x"], "inner.zefer", { type: "application/octet-stream" })]);

    await waitFor(() => expect(screen.getByText(T("form.zefer.warning.title"))).toBeInTheDocument());
    expect(screen.getByText(T("form.zefer.compression.disabled"), { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: T("compression.gzip") })).toBeDisabled();
    expect(screen.getByRole("button", { name: T("compression.none") })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    // Removing the file unlocks compression again.
    await user.click(screen.getByRole("button", { name: T("aria.removefile") }));
    expect(screen.getByRole("button", { name: T("compression.gzip") })).toBeEnabled();
  });

  // ─── Encryption ───

  it("encrypts text end to end and produces a decryptable .zefer", async () => {
    const user = userEvent.setup();
    const blobs = captureDownloads();
    renderForm();

    setText("top secret");
    await user.type(passInput(), "correct horse");

    await user.click(submit());
    // The progress panel is on screen while the work runs.
    const status = await screen.findByRole("status");
    expect(status.querySelector("progress.crypto-progress")).toBeInTheDocument();

    await screen.findByRole("heading", { level: 2, name: T("encrypt.success.title") }, {
      timeout: 20_000,
    });

    expect(blobs).toHaveLength(1);
    const result = await decodeZefer("", "correct horse", { fileBlob: blobs[0] });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("decode failed");
    expect(result.payload.content).toBe("top secret");
    expect(result.header.iterations).toBe(1);
    expect(result.payload.meta.expiresAt).toBeGreaterThan(Date.now());
  });

  it("encrypts a file, keeping its name and type inside the payload", async () => {
    const user = userEvent.setup();
    const blobs = captureDownloads();
    renderForm();

    await user.click(screen.getByRole("button", { name: T("mode.file") }));
    pick(filePicker(), [new File(["binary-ish"], "report.pdf", { type: "application/pdf" })]);
    await waitFor(() => expect(screen.getByText("report.pdf")).toBeInTheDocument());
    await user.type(passInput(), "correct horse");
    await encryptAndWait(user);

    const result = await decodeZefer("", "correct horse", { fileBlob: blobs[0] });
    if (!result.ok) throw new Error("decode failed");
    expect(result.payload.meta.fileName).toBe("report.pdf");
    expect(result.payload.meta.fileType).toBe("application/pdf");
    expect(result.header.mode).toBe("file");
  });

  it("names the download after the uploaded text file, falling back to secret", async () => {
    const user = userEvent.setup();
    captureDownloads();
    const anchors: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      anchors.push(this.download);
    });
    renderForm();

    pick(textPicker(), [new File(["from disk"], "notes.txt", { type: "text/plain" })]);
    await waitFor(() => expect(textArea()).toHaveValue("from disk"));
    await user.type(passInput(), "correct horse");
    await encryptAndWait(user);
    expect(anchors).toEqual(["notes.zefer"]);

    await user.click(screen.getByRole("button", { name: T("encrypt.another") }));
    setText("plain typing");
    await user.type(passInput(), "correct horse");
    await encryptAndWait(user);
    expect(anchors).toEqual(["notes.zefer", "secret.zefer"]);
  });

  it("stores no expiry and offers no share link when the secret never expires", async () => {
    const user = userEvent.setup();
    const blobs = captureDownloads();
    renderForm();

    chooseOption(T("form.expires"), T("ttl.never"));
    setText("forever");
    await user.type(passInput(), "correct horse");
    await encryptAndWait(user);

    expect(screen.queryByText(T("encrypt.success.link.title"))).toBeNull();
    const result = await decodeZefer("", "correct horse", { fileBlob: blobs[0] });
    if (!result.ok) throw new Error("decode failed");
    expect(result.payload.meta.expiresAt).toBe(0);
  });

  it("offers no share link for an expiry beyond a week", async () => {
    const user = userEvent.setup();
    captureDownloads();
    renderForm();

    chooseOption(T("form.expires"), T("ttl.1month"));
    setText("long lived");
    await user.type(passInput(), "correct horse");
    await encryptAndWait(user);

    expect(screen.queryByText(T("encrypt.success.link.title"))).toBeNull();
  });

  it("reports a generic error and keeps the form when encryption blows up", async () => {
    const user = userEvent.setup();
    vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
      throw new Error("no object urls here");
    });
    renderForm();

    setText("boom");
    await user.type(passInput(), "correct horse");
    await user.click(submit());

    await waitFor(() => expect(errorText()).toContain(T("form.error.generic")), {
      timeout: 20_000,
    });
    expect(screen.queryByRole("heading", { level: 2, name: T("encrypt.success.title") })).toBeNull();
    expect(submit()).toBeEnabled();
  });

  it("resets everything when a new secret is started", async () => {
    const user = userEvent.setup();
    captureDownloads();
    renderForm();

    setText("first one");
    await user.type(passInput(), "correct horse");
    await encryptAndWait(user);

    await user.click(screen.getByRole("button", { name: T("encrypt.another") }));
    expect(textArea()).toHaveValue("");
    expect(passInput()).toHaveValue("");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

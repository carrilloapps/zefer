/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@/app/components/LanguageProvider";
import AnalyzerContent from "@/app/components/AnalyzerContent";
import { encodeZefer } from "@/app/lib/zefer";
import { takePendingDecryptFile } from "@/app/lib/file-handoff";

// The page chrome belongs to other suites; stubbing it keeps this one focused
// on the analyzer and off Navbar's drawer/portal machinery.
vi.mock("@/app/components/Navbar", () => ({ default: () => null }));
vi.mock("@/app/components/Footer", () => ({ default: () => null }));

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

// jsdom's File/Blob do not implement arrayBuffer() in every version.
if (typeof Blob.prototype.arrayBuffer !== "function") {
  Blob.prototype.arrayBuffer = function arrayBuffer(this: Blob) {
    return new Response(this).arrayBuffer();
  };
}

// ─── Fixture helpers ───

const ITERATIONS = 1000; // keep PBKDF2 cheap; the analyzer never derives a key

function u32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, false);
  return b;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

function bytes(length: number, fill: (i: number) => number): Uint8Array {
  return Uint8Array.from({ length }, (_, i) => fill(i));
}

/** Real random bytes: proper ciphertext sits at ~8.0 bits/byte. */
function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/** salt(32) + baseIv(12) + framed chunks (4-byte big-endian length each) */
function block(chunks: Uint8Array[]): Uint8Array {
  const parts: Uint8Array[] = [bytes(32, (i) => i + 1), bytes(12, (i) => 200 - i)];
  for (const c of chunks) {
    parts.push(u32(c.length), c);
  }
  return concat(parts);
}

/** Hand-built container: full control over header fields and chunk framing. */
function craft(opts: {
  magic?: "ZEFB3" | "ZEFR3";
  header: Record<string, unknown>;
  main: Uint8Array;
  reveal?: Uint8Array;
}): Uint8Array {
  const magic = new TextEncoder().encode(opts.magic ?? "ZEFB3");
  const header = new TextEncoder().encode(JSON.stringify(opts.header));
  const parts = [magic, u32(header.length), header];
  if (opts.reveal) {
    parts.push(u32(opts.main.length), opts.main, opts.reveal);
  } else {
    parts.push(opts.main);
  }
  return concat(parts);
}

function fileOf(data: Uint8Array | string, name = "secret.zefer"): File {
  return new File([data as BlobPart], name, { type: "application/octet-stream" });
}

async function realZefer(opts: Parameters<typeof encodeZefer>[0]): Promise<File> {
  const blob = await encodeZefer({ iterations: ITERATIONS, ...opts });
  return new File([blob], "secret.zefer", { type: "application/octet-stream" });
}

// ─── Rendering helpers ───

function renderAnalyzer() {
  return render(
    <LanguageProvider>
      <AnalyzerContent />
    </LanguageProvider>
  );
}

function fileInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("file input missing");
  return input;
}

/** Upload through the hidden input and wait for the async report. */
async function upload(file: File) {
  await userEvent.upload(fileInput(), file);
  await screen.findByRole("heading", { name: "File report" });
}

function rowValue(label: string): string {
  const dt = screen.getByText(label);
  const dd = dt.parentElement?.querySelector("dd");
  return dd?.textContent ?? "";
}

beforeEach(() => {
  push.mockClear();
});

afterEach(() => {
  takePendingDecryptFile();
});

describe("AnalyzerContent — upload surface", () => {
  it("opens the file picker when the dropzone is activated", async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});
    renderAnalyzer();
    await userEvent.click(screen.getByRole("button", { name: /Drag a \.zefer file here/ }));
    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  it("highlights on drag over, clears on drag leave and inspects on drop", async () => {
    const file = await realZefer({ content: "dropped", fileName: null, passphrase: "pw", expiresAt: 0 });
    renderAnalyzer();
    const zone = screen.getByRole("button", { name: /Drag a \.zefer file here/ });

    fireEvent.dragOver(zone);
    expect(zone.className).toContain("theme-primary-border");
    fireEvent.dragLeave(zone);
    expect(zone.className).not.toContain("theme-primary-border");

    fireEvent.dragOver(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(await screen.findByRole("heading", { name: "File report" })).toBeInTheDocument();
  });

  it("ignores a drop that carries no file", async () => {
    renderAnalyzer();
    const zone = screen.getByRole("button", { name: /Drag a \.zefer file here/ });
    fireEvent.drop(zone, { dataTransfer: { files: [] } });
    await Promise.resolve();
    expect(screen.queryByRole("heading", { name: "File report" })).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("reports an unrecognised file instead of a report", async () => {
    renderAnalyzer();
    await userEvent.upload(fileInput(), fileOf("just some plain text\nnot zefer\nat all"));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Not a valid .zefer file");
    expect(screen.queryByRole("heading", { name: "File report" })).not.toBeInTheDocument();
  });
});

describe("AnalyzerContent — ZEFB3 public header", () => {
  it("reports format, text mode, KDF level, sizes and an absent hint/note", async () => {
    const file = await realZefer({ content: "tiny secret", fileName: null, passphrase: "pw", expiresAt: 0 });
    renderAnalyzer();
    await upload(file);

    expect(rowValue("Format")).toBe("ZEFB3 — binary, single key");
    expect(rowValue("Content")).toBe("Text");
    expect(rowValue("PBKDF2 iterations")).toBe(`${(1000).toLocaleString()} — Standard level`);
    expect(rowValue("Compression")).toBe("No compression");
    expect(rowValue("Total size")).toMatch(/^\d+ B$/);
    expect(rowValue("Reveal key")).toBe("Not included");
    expect(rowValue("Public hint")).toBe("Not set");
    expect(rowValue("Public note")).toBe("Not set");
    expect(screen.getByText("secret.zefer")).toBeInTheDocument();
  });

  it("reports file mode, a public hint and note, and megabyte sizes", async () => {
    const file = await realZefer({
      fileData: new Uint8Array(1_200_000).fill(7).buffer,
      fileName: "payload.bin",
      fileType: "application/octet-stream",
      passphrase: "pw",
      expiresAt: 0,
      hint: "ask alice",
      note: "for bob only",
    });
    renderAnalyzer();
    await upload(file);

    expect(rowValue("Content")).toBe("File");
    expect(rowValue("Total size")).toMatch(/^1\.\d\d MB$/);
    expect(rowValue("Public hint")).toBe("ask alice");
    expect(rowValue("Public note")).toBe("for bob only");
    expect(screen.getByText(/Estimated content/i).parentElement).toHaveTextContent(/~1\.\d\d MB/);
  });

  it("walks the chunk framing and measures ciphertext randomness", async () => {
    const file = await realZefer({
      content: "x".repeat(5000),
      fileName: null,
      passphrase: "pw",
      expiresAt: 0,
    });
    renderAnalyzer();
    await upload(file);

    expect(screen.getByText("Structural integrity")).toBeInTheDocument();
    expect(screen.getByText(/Valid structure/)).toBeInTheDocument();
    expect(rowValue("Total size")).toMatch(/KB$/);

    const entropy = screen.getByText("Ciphertext randomness").parentElement?.parentElement;
    const shown = Number(/([\d.]+) bits\/byte/.exec(entropy?.textContent ?? "")?.[1]);
    expect(shown).toBeGreaterThan(7.5);
    expect(shown).toBeLessThanOrEqual(8);
    expect(screen.getByText(/KDF at standard level/)).toBeInTheDocument();
  });

  it("shows a dash when the ciphertext sample is too small to measure", async () => {
    const file = await realZefer({ content: "hi", fileName: null, passphrase: "pw", expiresAt: 0 });
    renderAnalyzer();
    await upload(file);
    const entropy = screen.getByText("Ciphertext randomness").parentElement?.parentElement;
    expect(entropy).toHaveTextContent("—");
  });

  it("exposes the salt, base IV and whole-file SHA-256", async () => {
    const file = await realZefer({ content: "fingerprint me", fileName: null, passphrase: "pw", expiresAt: 0 });
    const expected = [...new Uint8Array(await crypto.subtle.digest("SHA-256", await file.arrayBuffer()))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    renderAnalyzer();
    await upload(file);

    expect(rowValue("Salt (public)")).toMatch(/^[0-9a-f]{64}$/);
    expect(rowValue("Base IV (public)")).toMatch(/^[0-9a-f]{24}$/);
    expect(rowValue("File SHA-256")).toBe(expected);
  });
});

describe("AnalyzerContent — ZEFR3 and legacy containers", () => {
  it("counts both blocks of a reveal-key file and flags the wider access surface", async () => {
    const single = await realZefer({ content: "shared", fileName: null, passphrase: "pw", expiresAt: 0 });
    const dual = await realZefer({ content: "shared", fileName: null, passphrase: "pw", revealKey: "reveal-me", expiresAt: 0 });
    renderAnalyzer();

    await upload(single);
    const soloChunks = screen.getByText("Encrypted chunks").parentElement?.parentElement?.textContent;

    await userEvent.click(screen.getByRole("button", { name: "Analyze another file" }));
    await upload(dual);

    expect(rowValue("Format")).toBe("ZEFR3 — binary with reveal key");
    expect(rowValue("Reveal key")).toBe("Included — secondary block present");
    expect(screen.getByText(/Includes a reveal key/)).toBeInTheDocument();
    const dualChunks = screen.getByText("Encrypted chunks").parentElement?.parentElement?.textContent;
    expect(dualChunks).toContain("2");
    expect(dualChunks).not.toBe(soloChunks);
  });

  it("reads a legacy ZEFER3 text container without any binary metrics", async () => {
    const header = JSON.stringify({ iterations: 600_000, compression: "none", hint: null, note: null, mode: "text" });
    renderAnalyzer();
    await upload(fileOf(`ZEFER3\n${header}\nZm9vYmFyYmF6\n`, "legacy.zefer"));

    expect(rowValue("Format")).toBe("Legacy text format (read-only)");
    expect(screen.queryByText("Structural integrity")).not.toBeInTheDocument();
    expect(screen.queryByText("Encrypted chunks")).not.toBeInTheDocument();
    expect(screen.queryByText("Salt (public)")).not.toBeInTheDocument();
    expect(screen.queryByText("Base IV (public)")).not.toBeInTheDocument();
    expect(rowValue("File SHA-256")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("reads a legacy ZEFER2 container and defaults its missing mode to text", async () => {
    const header = JSON.stringify({ iterations: 600_000, compression: "none", hint: null, note: null });
    renderAnalyzer();
    await upload(fileOf(`ZEFER2\n${header}\nZm9vYmFy\n`, "old.zefer"));
    expect(rowValue("Format")).toBe("Legacy text format (read-only)");
    expect(rowValue("Content")).toBe("Text");
  });
});

describe("AnalyzerContent — structural integrity", () => {
  it("flags a truncated file whose last chunk runs past the end", async () => {
    const whole = new Uint8Array(await (await realZefer({
      content: "y".repeat(4000), fileName: null, passphrase: "pw", expiresAt: 0,
    })).arrayBuffer());
    renderAnalyzer();
    await upload(fileOf(whole.subarray(0, whole.length - 500), "truncated.zefer"));

    expect(screen.getByText(/Inconsistent structure/)).toBeInTheDocument();
    expect(screen.getByText("The internal structure does not match the declared format")).toBeInTheDocument();
  });

  it("flags trailing bytes that leave the walk short of the end", async () => {
    const whole = new Uint8Array(await (await realZefer({
      content: "z".repeat(2000), fileName: null, passphrase: "pw", expiresAt: 0,
    })).arrayBuffer());
    renderAnalyzer();
    await upload(fileOf(concat([whole, new Uint8Array([1, 2])]), "padded.zefer"));
    expect(screen.getByText(/Inconsistent structure/)).toBeInTheDocument();
  });

  it("flags a chunk length below the 16-byte auth tag", async () => {
    const data = craft({
      header: { iterations: 600_000, compression: "none", hint: null, note: null, mode: "file" },
      main: block([bytes(5, () => 9), randomBytes(2000)]),
    });
    renderAnalyzer();
    await upload(fileOf(data, "shortchunk.zefer"));
    expect(screen.getByText(/Inconsistent structure/)).toBeInTheDocument();
    expect(screen.getByText("Encrypted chunks").parentElement?.parentElement).toHaveTextContent("0");
  });

  it("flags a container too small to hold a single framed chunk", async () => {
    const data = craft({
      header: { iterations: 600_000, compression: "none", hint: null, note: null, mode: "text" },
      main: randomBytes(50),
    });
    renderAnalyzer();
    await upload(fileOf(data, "stub.zefer"));
    expect(screen.getByText(/Inconsistent structure/)).toBeInTheDocument();
    expect(screen.getByText("Ciphertext randomness").parentElement?.parentElement).toHaveTextContent("—");
  });

  it("flags a reveal block that does not frame cleanly", async () => {
    const data = craft({
      magic: "ZEFR3",
      header: { iterations: 600_000, compression: "none", hint: null, note: null, mode: "text" },
      main: block([randomBytes(2000)]),
      reveal: concat([block([randomBytes(300)]), new Uint8Array([7, 7, 7])]),
    });
    renderAnalyzer();
    await upload(fileOf(data, "badreveal.zefer"));
    expect(screen.getByText(/Inconsistent structure/)).toBeInTheDocument();
    expect(rowValue("Format")).toBe("ZEFR3 — binary with reveal key");
  });
});

describe("AnalyzerContent — security observations", () => {
  it("gives an all-clear when nothing is exposed", async () => {
    const data = craft({
      header: { iterations: 600_000, compression: "none", hint: null, note: null, mode: "text" },
      main: block([randomBytes(2048)]),
    });
    renderAnalyzer();
    await upload(fileOf(data, "clean.zefer"));

    expect(screen.getByText("No observations — the file follows best practices")).toBeInTheDocument();
    expect(screen.queryByText(/KDF at standard level/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Includes a reveal key/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Compression enabled/)).not.toBeInTheDocument();
  });

  it("flags low ciphertext randomness", async () => {
    const data = craft({
      header: { iterations: 1_000_000, compression: "none", hint: null, note: null, mode: "text" },
      main: block([bytes(4096, (i) => i % 3)]),
    });
    renderAnalyzer();
    await upload(fileOf(data, "flat.zefer"));

    expect(screen.getByText(/Ciphertext randomness is unusually low/)).toBeInTheDocument();
    expect(rowValue("PBKDF2 iterations")).toBe(`${(1_000_000).toLocaleString()} — Maximum level`);
    expect(screen.getByText(/Valid structure/)).toBeInTheDocument();
  });

  it("flags a compression side-channel and a public hint at the high KDF level", async () => {
    const data = craft({
      header: { iterations: 600_000, compression: "gzip", hint: "look in the vault", note: null, mode: "file" },
      main: block([randomBytes(2048)]),
    });
    renderAnalyzer();
    await upload(fileOf(data, "gz.zefer"));

    expect(rowValue("PBKDF2 iterations")).toBe(`${(600_000).toLocaleString()} — High level`);
    expect(rowValue("Compression")).toBe("gzip");
    expect(screen.getByText(/Compression enabled/)).toBeInTheDocument();
    expect(screen.getByText(/Contains a public hint/)).toBeInTheDocument();
    expect(screen.getByText(/before decompression/)).toBeInTheDocument();
    expect(screen.queryByText(/KDF at standard level/)).not.toBeInTheDocument();
  });

  it("flags a public note and a standard-level KDF, and tolerates a header with no compression field", async () => {
    const data = craft({
      header: { iterations: 300_000, hint: null, note: "invoice for Q3", mode: "text" },
      main: block([randomBytes(2048)]),
    });
    renderAnalyzer();
    await upload(fileOf(data, "note.zefer"));

    expect(screen.getByText(/Contains a public note/)).toBeInTheDocument();
    expect(screen.getByText(/KDF at standard level/)).toBeInTheDocument();
    expect(screen.queryByText(/Compression enabled/)).not.toBeInTheDocument();
    expect(rowValue("PBKDF2 iterations")).toBe(`${(300_000).toLocaleString()} — Standard level`);
  });
});

describe("AnalyzerContent — KDF resistance table", () => {
  it("scales crack times with the iteration count in the header", async () => {
    const weak = craft({
      header: { iterations: 1000, compression: "none", hint: null, note: null, mode: "text" },
      main: block([randomBytes(2048)]),
    });
    renderAnalyzer();
    await upload(fileOf(weak, "weak-kdf.zefer"));

    const table = screen.getByText(/Passphrase resistance/).parentElement?.parentElement as HTMLElement;
    expect(within(table).getByText(new RegExp(`${(5_000_000).toLocaleString().replace(/[.,]/g, "\$&")} passphrases per second`))).toBeInTheDocument();
    const row = (label: string) =>
      within(table).getByText(label).parentElement?.textContent ?? "";
    expect(row("6 common characters (~28 bits)")).toMatch(/Instant/i);
    expect(row("8 mixed characters (~45 bits)")).toMatch(/minute/i);
    expect(row("12 mixed characters (~72 bits)")).toMatch(/year/i);
    expect(row("64-character generated key (~400 bits)")).toContain("≈10");
  });

  it("slows the attacker model down at one million iterations", async () => {
    const strong = craft({
      header: { iterations: 1_000_000, compression: "none", hint: null, note: null, mode: "text" },
      main: block([randomBytes(2048)]),
    });
    renderAnalyzer();
    await upload(fileOf(strong, "strong-kdf.zefer"));

    const table = screen.getByText(/Passphrase resistance/).parentElement?.parentElement as HTMLElement;
    expect(within(table).getByText(new RegExp(`${(5000).toLocaleString().replace(/[.,]/g, "\$&")} passphrases per second`))).toBeInTheDocument();
    expect(within(table).getByText("6 common characters (~28 bits)").parentElement?.textContent)
      .toMatch(/second/i);
  });
});

describe("AnalyzerContent — report actions", () => {
  it("hands the analyzed file to the decrypt form", async () => {
    const file = await realZefer({ content: "handoff", fileName: null, passphrase: "pw", expiresAt: 0 });
    renderAnalyzer();
    await upload(file);

    await userEvent.click(screen.getByRole("button", { name: "Decrypt this file" }));
    expect(push).toHaveBeenCalledWith("/?t=decrypt");
    expect(takePendingDecryptFile()).toBe(file);
  });

  it("returns to the dropzone and clears a previous error", async () => {
    const file = await realZefer({ content: "again", fileName: null, passphrase: "pw", expiresAt: 0 });
    renderAnalyzer();

    await userEvent.upload(fileInput(), fileOf("garbage"));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await upload(file);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Analyze another file" }));
    expect(screen.getByRole("button", { name: /Drag a \.zefer file here/ })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("AnalyzerContent — explanatory tooltips", () => {
  it("opens a tip on tap and closes it again", async () => {
    const file = await realZefer({ content: "tips", fileName: null, passphrase: "pw", expiresAt: 0 });
    renderAnalyzer();
    await upload(file);

    const tip = screen.getAllByRole("button", { name: "More information" })[0];

    fireEvent.pointerDown(tip);
    const bubble = await waitFor(() => {
      const el = document.querySelector(".info-tip-bubble");
      expect(el).not.toBeNull();
      return el as HTMLElement;
    });
    expect(bubble.textContent?.length).toBeGreaterThan(10);
    expect(tip).toHaveAttribute("aria-describedby");

    fireEvent.pointerDown(tip);
    await waitFor(() => expect(document.querySelector(".info-tip-bubble")).toBeNull());
  });
});

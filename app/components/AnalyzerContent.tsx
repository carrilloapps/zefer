"use client";

import { useRef, useState } from "react";
import {
  FileSearch, Upload, ShieldCheck, ShieldAlert, Lock, FileText,
  Layers, Gauge, KeyRound, MessageSquare, Unlock, RefreshCw,
  CheckCircle2, AlertTriangle, Info, Fingerprint, Binary, Microscope,
} from "lucide-react";
import { PageLayout, PageHeader, InfoTip } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";
import { parseFile, type ParsedFile } from "@/app/lib/zefer";
import { crackBucketFor, toSuperscript } from "@/app/lib/passwords";
import type { TranslationKey } from "@/app/lib/i18n";

// ─── Deep-analysis helpers (all computable without the passphrase) ───

interface ChunkWalk {
  ok: boolean;
  chunks: number;
  ciphertext: number;
}

/** Walk the 4-byte-length-prefixed chunk framing after salt(32) + iv(12) */
function walkChunks(data: Uint8Array): ChunkWalk {
  if (data.length < 44 + 4 + 17) return { ok: false, chunks: 0, ciphertext: 0 };
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let off = 44;
  let chunks = 0;
  let ciphertext = 0;
  while (off + 4 <= data.length) {
    const len = dv.getUint32(off, false);
    off += 4;
    if (len < 17 || off + len > data.length) return { ok: false, chunks, ciphertext };
    chunks++;
    ciphertext += len;
    off += len;
  }
  return { ok: off === data.length && chunks > 0, chunks, ciphertext };
}

/** Shannon entropy in bits/byte over a sample (proper AES output ≈ 8.0) */
function shannonEntropy(bytes: Uint8Array): number {
  if (bytes.length === 0) return 0;
  const freq = new Array<number>(256).fill(0);
  for (let i = 0; i < bytes.length; i++) freq[bytes[i]]++;
  let h = 0;
  for (const f of freq) {
    if (f > 0) {
      const p = f / bytes.length;
      h -= p * Math.log2(p);
    }
  }
  return h;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface DeepAnalysis {
  sha256: string;
  /** null for legacy text format (no binary framing to walk) */
  structureOk: boolean | null;
  chunks: number;
  ciphertext: number;
  estimatedPlain: number;
  entropy: number | null;
  saltHex: string | null;
  ivHex: string | null;
}

interface Observation {
  key: TranslationKey;
  severity: "info" | "warn" | "danger";
}

interface Report {
  fileName: string;
  fileSize: number;
  parsed: ParsedFile;
  deep: DeepAnalysis;
  observations: Observation[];
}

async function deepAnalyze(rawBytes: ArrayBuffer, parsed: ParsedFile): Promise<DeepAnalysis> {
  const digest = await crypto.subtle.digest("SHA-256", rawBytes);
  const sha256 = toHex(new Uint8Array(digest));

  if (!parsed.binary || !parsed.binaryData) {
    return { sha256, structureOk: null, chunks: 0, ciphertext: 0, estimatedPlain: 0, entropy: null, saltHex: null, ivHex: null };
  }

  const main = walkChunks(parsed.binaryData);
  const reveal = parsed.revealBinaryData ? walkChunks(parsed.revealBinaryData) : null;
  const structureOk = main.ok && (reveal === null || reveal.ok);
  const chunks = main.chunks + (reveal?.chunks ?? 0);
  const ciphertext = main.ciphertext + (reveal?.ciphertext ?? 0);
  // Each AES-GCM chunk carries a 16-byte auth tag; the payload also embeds
  // a 4-byte meta-length prefix + metadata JSON we cannot subtract blindly.
  const estimatedPlain = Math.max(0, main.ciphertext - 16 * main.chunks);

  const sampleStart = 44;
  const sample = parsed.binaryData.subarray(sampleStart, Math.min(parsed.binaryData.length, sampleStart + 64 * 1024));
  const entropy = sample.length >= 1024 ? shannonEntropy(sample) : null;

  return {
    sha256,
    structureOk,
    chunks,
    ciphertext,
    estimatedPlain,
    entropy,
    saltHex: toHex(parsed.binaryData.subarray(0, 32)),
    ivHex: toHex(parsed.binaryData.subarray(32, 44)),
  };
}

function collectObservations(parsed: ParsedFile, deep: DeepAnalysis): Observation[] {
  const obs: Observation[] = [];
  if (deep.structureOk === false) obs.push({ key: "anlz.obs.struct", severity: "danger" });
  if (deep.entropy !== null && deep.entropy < 7.5) obs.push({ key: "anlz.obs.lowentropy", severity: "danger" });
  if (parsed.header.iterations < 600_000) obs.push({ key: "anlz.obs.kdfstd", severity: "warn" });
  if (parsed.header.hint) obs.push({ key: "anlz.obs.hint", severity: "warn" });
  if (parsed.header.note) obs.push({ key: "anlz.obs.note", severity: "info" });
  if (parsed.revealBinaryData) obs.push({ key: "anlz.obs.reveal", severity: "info" });
  if (parsed.header.compression && parsed.header.compression !== "none") obs.push({ key: "anlz.obs.compress", severity: "info" });
  return obs;
}

// KDF brute-force model: PBKDF2-SHA256 ≈ 2 SHA-256 ops per iteration;
// a high-end GPU does ~10^10 SHA-256/s. Fleet model: 1,000 GPUs.
const GPU_SHA256_PER_SECOND = 1e10;
const FLEET_SIZE = 1000;

const KDF_ROWS: { key: TranslationKey; bits: number }[] = [
  { key: "anlz.kdfres.weak", bits: 28 },
  { key: "anlz.kdfres.mid", bits: 45 },
  { key: "anlz.kdfres.good", bits: 72 },
  { key: "anlz.kdfres.gen", bits: 400 },
];

const OBS_STYLE = {
  info: { icon: Info, text: "theme-muted" },
  warn: { icon: AlertTriangle, text: "theme-warning" },
  danger: { icon: ShieldAlert, text: "theme-danger" },
} as const;

export default function AnalyzerContent() {
  const { t } = useLanguage();
  const [report, setReport] = useState<Report | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function formatCrack(bits: number, gps: number): string {
    const { bucket, value } = crackBucketFor(bits, gps);
    if (bucket === "instant") return t("time.instant");
    if (bucket === "yearsExp") return `≈10${toSuperscript(value)} ${t("time.years")}`;
    return `${value.toLocaleString()} ${t(`time.${bucket}` as TranslationKey)}`;
  }

  async function inspect(file: File) {
    setInvalid(false);
    setReport(null);
    const rawBytes = await file.arrayBuffer();
    let textContent = "";
    try {
      textContent = new TextDecoder().decode(rawBytes.slice(0, 64 * 1024));
    } catch {
      /* binary-only file: text parse will simply fail */
    }
    const parsed = parseFile(textContent, rawBytes);
    if (!parsed) {
      setInvalid(true);
      return;
    }
    const deep = await deepAnalyze(rawBytes, parsed);
    setReport({
      fileName: file.name,
      fileSize: rawBytes.byteLength,
      parsed,
      deep,
      observations: collectObservations(parsed, deep),
    });
  }

  function onFile(files: FileList | null) {
    const f = files?.[0];
    if (f) void inspect(f);
  }

  function reset() {
    setReport(null);
    setInvalid(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const formatKey = report
    ? report.parsed.binary
      ? report.parsed.revealBinaryData
        ? "anlz.format.zefr3"
        : "anlz.format.zefb3"
      : "anlz.format.legacy"
    : null;

  const kdfLevel = report
    ? report.parsed.header.iterations >= 1_000_000
      ? "anlz.kdf.maximum"
      : report.parsed.header.iterations >= 600_000
        ? "anlz.kdf.high"
        : "anlz.kdf.standard"
    : null;

  const guessesPerGpu = report
    ? Math.max(1, Math.round(GPU_SHA256_PER_SECOND / (2 * report.parsed.header.iterations)))
    : 0;

  return (
    <PageLayout>
      <PageHeader
        icon={FileSearch}
        badge={t("anlz.badge")}
        title={t("anlz.title")}
        subtitle={t("anlz.subtitle")}
      />

      {!report && (
        <div className="glass glow-green-sm p-6 sm:p-8 animate-in">
          {/* Dropzone */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer.files); }}
            className={`w-full flex flex-col items-center justify-center gap-3 py-12 px-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
              dragging ? "theme-primary-border theme-primary-faint" : "border-[var(--glass-border)] hover:border-[var(--input-border-focus)]"
            }`}
            aria-label={t("anlz.drop")}
          >
            <span className="w-12 h-12 rounded-xl theme-primary-faint theme-primary-border border flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </span>
            <span className="text-sm theme-text font-medium">{t("anlz.drop")}</span>
            <span className="text-[11px] theme-faint">{t("anlz.drop.hint")}</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".zefer"
            onChange={(e) => onFile(e.target.files)}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />

          {invalid && (
            <div role="alert" className="flex items-start gap-2.5 mt-4 theme-danger-faint theme-danger-border border rounded-xl px-3.5 py-3 error-shake">
              <ShieldAlert className="w-4 h-4 theme-danger shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium theme-danger">{t("anlz.invalid")}</p>
                <p className="text-[11px] theme-danger opacity-80 mt-0.5 leading-relaxed">{t("anlz.invalid.desc")}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {report && (
        <div className="glass glow-green p-6 sm:p-8 animate-in stagger-children">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl theme-primary-faint theme-primary-border border flex items-center justify-center success-icon">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold theme-heading">{t("anlz.report")}</h2>
              <p className="text-xs theme-muted font-mono truncate">{report.fileName}</p>
            </div>
          </div>

          {/* Public header fields */}
          <dl className="space-y-2 mb-5">
            {[
              { icon: Layers, label: t("anlz.field.format"), value: t(formatKey! as TranslationKey), mono: true },
              { icon: report.parsed.header.mode === "file" ? FileText : MessageSquare, label: t("anlz.field.mode"), value: report.parsed.header.mode === "file" ? t("anlz.mode.file") : t("anlz.mode.text") },
              { icon: Gauge, label: t("anlz.field.iterations"), value: `${report.parsed.header.iterations.toLocaleString()} — ${t(kdfLevel! as TranslationKey)}`, mono: true },
              { icon: Layers, label: t("anlz.field.compression"), value: report.parsed.header.compression === "none" ? t("anlz.compression.none") : report.parsed.header.compression, mono: true },
              { icon: FileText, label: t("anlz.field.size"), value: formatBytes(report.fileSize), mono: true },
              { icon: KeyRound, label: t("anlz.field.reveal"), value: report.parsed.revealBinaryData ? t("anlz.reveal.yes") : t("anlz.reveal.no") },
              { icon: MessageSquare, label: t("anlz.field.hint"), value: report.parsed.header.hint ?? t("anlz.none"), faded: !report.parsed.header.hint },
              { icon: MessageSquare, label: t("anlz.field.note"), value: report.parsed.header.note ?? t("anlz.none"), faded: !report.parsed.header.note },
            ].map((f) => (
              <div key={f.label} className="glass !rounded-lg px-3.5 py-2.5 flex items-center gap-3">
                <f.icon className="w-3.5 h-3.5 theme-faint shrink-0" />
                <dt className="text-[11px] theme-muted w-32 sm:w-40 shrink-0">{f.label}</dt>
                <dd className={`text-xs flex-1 break-words ${f.mono ? "font-mono" : ""} ${f.faded ? "theme-faint" : "theme-text"}`}>{f.value}</dd>
              </div>
            ))}
          </dl>

          {/* ─── Deep analysis ─── */}
          <h3 className="flex items-center gap-1.5 text-xs font-semibold theme-heading mb-3">
            <Microscope className="w-3.5 h-3.5 text-primary" />{t("anlz.deep.title")}
          </h3>

          {/* Structural integrity */}
          {report.deep.structureOk !== null && (
            <div className={`flex items-start gap-2.5 mb-3 rounded-xl px-3.5 py-3 border ${
              report.deep.structureOk ? "theme-primary-faint theme-primary-border" : "theme-danger-faint theme-danger-border"
            }`}>
              {report.deep.structureOk ? (
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-4 h-4 theme-danger shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-xs font-medium ${report.deep.structureOk ? "text-primary" : "theme-danger"}`}>{t("anlz.struct.title")}</p>
                <p className={`text-[11px] leading-relaxed mt-0.5 ${report.deep.structureOk ? "theme-muted" : "theme-danger opacity-80"}`}>
                  {report.deep.structureOk ? t("anlz.struct.ok") : t("anlz.struct.bad")}
                </p>
              </div>
            </div>
          )}

          {/* Deep metrics */}
          {report.parsed.binary && (
            <div className="grid grid-cols-1 min-[440px]:grid-cols-3 gap-2 mb-3">
              <div className="glass !rounded-lg px-3 py-2.5">
                <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Binary className="w-2.5 h-2.5" />{t("anlz.field.chunks")}
                  <InfoTip tipKey="tip.anlz.chunks" align="left" />
                </p>
                <p className="text-sm font-mono theme-heading">{report.deep.chunks}</p>
              </div>
              <div className="glass !rounded-lg px-3 py-2.5">
                <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5">{t("anlz.field.estplain")}</p>
                <p className="text-sm font-mono theme-heading">
                  ~{formatBytes(report.deep.estimatedPlain)}
                  {report.parsed.header.compression !== "none" && (
                    <span className="text-[9px] theme-faint block">{t("anlz.estplain.note")}</span>
                  )}
                </p>
              </div>
              <div className="glass !rounded-lg px-3 py-2.5">
                <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  {t("anlz.field.entropy")}
                  <InfoTip tipKey="tip.anlz.entropy" align="right" />
                </p>
                <p className="text-sm font-mono theme-heading">
                  {report.deep.entropy !== null ? `${report.deep.entropy.toFixed(2)} ${t("anlz.entropy.unit")}` : "—"}
                </p>
              </div>
            </div>
          )}

          {/* Cryptographic identifiers */}
          <div className="space-y-2 mb-5">
            {report.deep.saltHex && (
              <div className="glass !rounded-lg px-3.5 py-2.5 flex items-center gap-3">
                <KeyRound className="w-3.5 h-3.5 theme-faint shrink-0" />
                <dt className="text-[11px] theme-muted w-32 sm:w-40 shrink-0 flex items-center gap-1">
                  {t("anlz.field.salt")}
                  <InfoTip tipKey="tip.anlz.salt" align="left" />
                </dt>
                <dd className="text-[10px] font-mono theme-text flex-1 break-all leading-relaxed">{report.deep.saltHex}</dd>
              </div>
            )}
            {report.deep.ivHex && (
              <div className="glass !rounded-lg px-3.5 py-2.5 flex items-center gap-3">
                <KeyRound className="w-3.5 h-3.5 theme-faint shrink-0" />
                <dt className="text-[11px] theme-muted w-32 sm:w-40 shrink-0">{t("anlz.field.iv")}</dt>
                <dd className="text-[10px] font-mono theme-text flex-1 break-all leading-relaxed">{report.deep.ivHex}</dd>
              </div>
            )}
            <div className="glass !rounded-lg px-3.5 py-2.5 flex items-center gap-3">
              <Fingerprint className="w-3.5 h-3.5 theme-faint shrink-0" />
              <dt className="text-[11px] theme-muted w-32 sm:w-40 shrink-0 flex items-center gap-1">
                {t("anlz.field.sha")}
                <InfoTip tipKey="tip.anlz.sha" align="left" />
              </dt>
              <dd className="text-[10px] font-mono text-primary flex-1 break-all leading-relaxed select-all">{report.deep.sha256}</dd>
            </div>
          </div>

          {/* ─── KDF resistance ─── */}
          <div className="glass !rounded-xl p-4 mb-5">
            <p className="flex items-center gap-1.5 text-xs font-medium theme-heading mb-1">
              <Gauge className="w-3 h-3" />{t("anlz.kdfres.title")}
              <InfoTip tipKey="tip.anlz.kdfres" />
            </p>
            <p className="text-[11px] theme-muted mb-3 leading-relaxed">
              {t("anlz.kdfres.desc").replace("{n}", guessesPerGpu.toLocaleString())}
            </p>
            <ul className="space-y-1.5">
              {KDF_ROWS.map((row) => (
                <li key={row.key} className="glass !rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] theme-text">{t(row.key)}</span>
                  <span className="text-[11px] font-mono text-primary shrink-0">
                    {formatCrack(row.bits, guessesPerGpu * FLEET_SIZE)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Security observations ─── */}
          <div className="mb-5">
            <p className="flex items-center gap-1.5 text-xs font-medium theme-heading mb-2">
              <ShieldCheck className="w-3 h-3" />{t("anlz.obs.title")}
            </p>
            {report.observations.length === 0 ? (
              <div className="flex items-center gap-2.5 theme-primary-faint theme-primary-border border rounded-xl px-3.5 py-3">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[11px] text-primary leading-relaxed">{t("anlz.obs.ok")}</p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {report.observations.map((o) => {
                  const S = OBS_STYLE[o.severity];
                  return (
                    <li key={o.key} className={`flex items-start gap-2.5 glass !rounded-lg px-3.5 py-2.5 text-[11px] leading-relaxed ${S.text}`}>
                      <S.icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {t(o.key)}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Protected metadata notice */}
          <div className="glass !rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium theme-heading mb-1">{t("anlz.private.title")}</p>
                <p className="text-[11px] theme-muted leading-relaxed">{t("anlz.private.desc")}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <a href="/?t=decrypt" className="btn-primary flex-1">
              <Unlock className="w-4 h-4" />{t("anlz.decrypt.cta")}
            </a>
            <button
              type="button"
              onClick={reset}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-medium glass theme-muted hover:theme-text transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />{t("anlz.another")}
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

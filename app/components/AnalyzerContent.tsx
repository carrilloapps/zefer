"use client";

import { useRef, useState } from "react";
import {
  FileSearch, Upload, ShieldCheck, ShieldAlert, Lock, FileText,
  Layers, Gauge, KeyRound, MessageSquare, Unlock, RefreshCw,
} from "lucide-react";
import { PageLayout, PageHeader } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";
import { parseFile, type ParsedFile } from "@/app/lib/zefer";

interface Report {
  fileName: string;
  fileSize: number;
  parsed: ParsedFile;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AnalyzerContent() {
  const { t } = useLanguage();
  const [report, setReport] = useState<Report | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setReport({ fileName: file.name, fileSize: rawBytes.byteLength, parsed });
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

          {/* Fields */}
          <dl className="space-y-2 mb-5">
            {[
              { icon: Layers, label: t("anlz.field.format"), value: t(formatKey! as Parameters<typeof t>[0]), mono: true },
              { icon: report.parsed.header.mode === "file" ? FileText : MessageSquare, label: t("anlz.field.mode"), value: report.parsed.header.mode === "file" ? t("anlz.mode.file") : t("anlz.mode.text") },
              { icon: Gauge, label: t("anlz.field.iterations"), value: `${report.parsed.header.iterations.toLocaleString()} — ${t(kdfLevel! as Parameters<typeof t>[0])}`, mono: true },
              { icon: Layers, label: t("anlz.field.compression"), value: report.parsed.header.compression === "none" ? t("anlz.compression.none") : report.parsed.header.compression, mono: true },
              { icon: FileText, label: t("anlz.field.size"), value: formatBytes(report.fileSize), mono: true },
              ...(report.parsed.binaryData
                ? [{ icon: Lock, label: t("anlz.field.payload"), value: formatBytes(report.parsed.binaryData.byteLength), mono: true }]
                : []),
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

"use client";

import { useState, useRef, useEffect } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Clock,
  Upload,
  FileText,
  X,
  AlertTriangle,
  Loader2,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
  KeyRound,
  MessageSquare,
  HelpCircle,
  Hash,
  Gauge,
  Globe,
} from "lucide-react";
import { encodeZefer } from "@/app/lib/zefer";
import { parseIpList, detectIp, type IpDetectionResult } from "@/app/lib/ip";
import { analyzeDevice, formatBytes, type DeviceLimits } from "@/app/lib/device";
import { createEncryptTracker, type ProgressState } from "@/app/lib/progress";
import CryptoProgress from "@/app/components/CryptoProgress";
import KeyGenerator from "@/app/components/KeyGenerator";
import DeviceInfo from "@/app/components/DeviceInfo";
import type { CompressionMethod } from "@/app/lib/compression";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePreferences } from "@/app/lib/preferences";

const TTL_OPTIONS = [
  { labelKey: "ttl.30min" as const, value: 30 },
  { labelKey: "ttl.1hour" as const, value: 60 },
  { labelKey: "ttl.24hours" as const, value: 1440 },
  { labelKey: "ttl.7days" as const, value: 10080 },
  { labelKey: "ttl.2weeks" as const, value: 20160 },
  { labelKey: "ttl.never" as const, value: 0 },
];

const SECURITY_LEVELS = [
  { labelKey: "security.standard" as const, value: 300_000 },
  { labelKey: "security.high" as const, value: 600_000 },
  { labelKey: "security.maximum" as const, value: 1_000_000 },
];

const COMPRESSION_OPTIONS: { labelKey: string; value: CompressionMethod }[] = [
  { labelKey: "compression.none", value: "none" },
  { labelKey: "compression.gzip", value: "gzip" },
  { labelKey: "compression.deflate", value: "deflate" },
];

type InputMode = "text" | "file";

const TEXT_EXTENSIONS = [".txt", ".env"];
const TEXT_MAX = 256 * 1024;

export default function EncryptForm() {
  const { t } = useLanguage();

  // Persisted preferences
  const {
    ttl, setTtl,
    iterations, setIterations,
    compression, setCompression,
    inputMode, setInputMode,
  } = usePreferences();

  // Text mode
  const [content, setContent] = useState("");
  const [textFileName, setTextFileName] = useState<string | null>(null);
  const textFileRef = useRef<HTMLInputElement>(null);

  // File mode
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Shared
  const [passphrase, setPassphrase] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Device limits
  const [limits, setLimits] = useState<DeviceLimits>({
    maxFileSize: 40 * 1024 * 1024, maxFileSizeLabel: "40 MB",
    profile: { ram: 0, cores: 0, gpu: null, gpuVendor: null, cpuArch: null, platform: "unknown", platformVersion: null, userAgent: "", mobile: false, heapLimit: null, heapUsed: null, heapTotal: null },
  });
  useEffect(() => { setLimits(analyzeDevice()); }, []);

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dualKey, setDualKey] = useState(false);
  const [secondPassphrase, setSecondPassphrase] = useState("");
  const [showSecondPass, setShowSecondPass] = useState(false);
  const [revealKey, setRevealKey] = useState("");
  const [showRevealKey, setShowRevealKey] = useState(false);
  const [hint, setHint] = useState("");
  const [note, setNote] = useState("");
  const [question, setQuestion] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(0);
  const [allowedIpsInput, setAllowedIpsInput] = useState("");
  const [ipLoading, setIpLoading] = useState(false);
  const [ipResult, setIpResult] = useState<IpDetectionResult | null>(null);

  // State
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);

  // Text mode: STRICTLY .txt / .env only
  function handleTextFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict extension check
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!TEXT_EXTENSIONS.includes(ext)) {
      setError(t("form.error.file.type"));
      // Reset the input so the same file can't be re-selected
      if (textFileRef.current) textFileRef.current.value = "";
      return;
    }

    // Strict MIME type check (browsers report these for text files)
    const validMimes = ["text/plain", "application/x-env", "application/octet-stream", ""];
    if (file.type && !validMimes.includes(file.type)) {
      setError(t("form.error.file.type"));
      if (textFileRef.current) textFileRef.current.value = "";
      return;
    }

    if (file.size > TEXT_MAX) {
      setError(t("form.error.file.size"));
      if (textFileRef.current) textFileRef.current.value = "";
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text !== "string") return;

      // Final check: reject binary content
      if (hasBinaryContent(text)) {
        setError(t("form.error.binary"));
        if (textFileRef.current) textFileRef.current.value = "";
        return;
      }

      setContent(text);
      setTextFileName(file.name);
    };
    reader.readAsText(file);
  }

  function clearTextFile() {
    setTextFileName(null); setContent("");
    if (textFileRef.current) textFileRef.current.value = "";
  }

  // Detect binary content in text
  function hasBinaryContent(text: string): boolean {
    // Check for null bytes or high concentration of control characters
    let controlCount = 0;
    const sample = text.substring(0, 4096);
    for (let i = 0; i < sample.length; i++) {
      const code = sample.charCodeAt(i);
      if (code === 0) return true; // null byte = definitely binary
      if (code < 32 && code !== 9 && code !== 10 && code !== 13) controlCount++;
    }
    return controlCount > sample.length * 0.1; // >10% control chars = binary
  }

  // File mode: any file EXCEPT .txt and .env (those must use text mode)
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (TEXT_EXTENSIONS.includes(ext)) {
      setError(t("form.error.file.usetext"));
      return;
    }

    if (file.size > limits.maxFileSize) {
      setError(`${t("form.error.file.max")} ${limits.maxFileSizeLabel}`);
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result instanceof ArrayBuffer) {
        setFileData(ev.target.result);
        setFileName(file.name);
        setFileType(file.type || "application/octet-stream");
        setFileSize(file.size);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function clearFile() {
    setFileData(null); setFileName(null); setFileType(null); setFileSize(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (inputMode === "text" && !content.trim()) { setError(t("form.error.empty")); return; }
    if (inputMode === "text" && hasBinaryContent(content)) { setError(t("form.error.binary")); return; }
    if (inputMode === "file" && !fileData) { setError(t("form.error.nofile")); return; }
    if (!passphrase || passphrase.length < 6) { setError(t("form.error.passphrase")); return; }
    if (dualKey && (!secondPassphrase || secondPassphrase.length < 6)) { setError(t("form.error.passphrase2")); return; }
    if (revealKey && revealKey.length < 6) { setError(t("form.error.revealkey")); return; }
    if (question && !questionAnswer) { setError(t("form.error.noanswer")); return; }

    setLoading(true);
    const tracker = createEncryptTracker(setProgress);

    try {
      tracker.compressing(0);
      await new Promise((r) => requestAnimationFrame(r));

      const expiresAt = ttl > 0 ? Date.now() + ttl * 60 * 1000 : 0;

      const zefer = await encodeZefer({
        content: inputMode === "text" ? content : undefined,
        fileData: inputMode === "file" ? fileData! : undefined,
        passphrase,
        secondPassphrase: dualKey ? secondPassphrase : undefined,
        fileName: inputMode === "file" ? fileName : textFileName,
        fileType: inputMode === "file" ? fileType || undefined : undefined,
        expiresAt,
        hint: hint || undefined,
        note: note || undefined,
        question: question || undefined,
        questionAnswer: questionAnswer || undefined,
        maxAttempts,
        iterations,
        dualKey,
        compression,
        allowedIps: parseIpList(allowedIpsInput),
        revealKey: revealKey.trim() || undefined,
        onProgress: tracker,
      });

      tracker.packaging();

      // zefer is already a Blob
      const url = URL.createObjectURL(zefer);
      const a = document.createElement("a");
      a.href = url;
      const baseName = (inputMode === "file" ? fileName : textFileName)?.replace(/\.[^.]+$/, "") || "secret";
      a.download = baseName + ".zefer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      tracker.done();
      await new Promise((r) => setTimeout(r, 500));

      // Clear secrets from memory immediately after successful encryption
      setPassphrase(""); setSecondPassphrase(""); setRevealKey("");
      setQuestionAnswer("");

      setDone(true);
    } catch {
      tracker.cancel();
      setError(t("form.error.generic"));
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  function reset() {
    setContent(""); setPassphrase(""); setSecondPassphrase("");
    setTextFileName(null); setFileName(null); setFileData(null);
    setFileType(null); setFileSize(0);
    setError(null); setDone(false);
    setHint(""); setNote(""); setQuestion("");
    setQuestionAnswer(""); setMaxAttempts(0);
    setDualKey(false);
    setAllowedIpsInput(""); setRevealKey("");
    if (textFileRef.current) textFileRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  }

  // ─── Progress ───
  if (progress && loading) {
    return <CryptoProgress state={progress} mode="encrypt" />;
  }

  // ─── Success ───
  if (done) {
    return (
      <div className="glass glow-green p-6 sm:p-8 animate-in stagger-children">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl theme-primary-faint theme-primary-border border flex items-center justify-center success-icon">
            <Check className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold theme-heading">{t("encrypt.success.title")}</h2>
            <p className="text-xs theme-muted">{t("encrypt.success.subtitle")}</p>
          </div>
        </div>
        <div className="glass !rounded-xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <Download className="w-4 h-4 theme-faint shrink-0 mt-0.5" />
            <p className="text-[13px] theme-muted leading-relaxed">{t("encrypt.success.desc")}</p>
          </div>
        </div>
        <button onClick={reset} className="btn-primary">{t("encrypt.another")}</button>
      </div>
    );
  }

  // ─── Form ───
  return (
    <form onSubmit={handleSubmit}>
      <div className="glass glow-green-sm p-6 sm:p-8 animate-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl theme-primary-faint theme-primary-border border flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold theme-heading">{t("encrypt.title")}</h2>
            <p className="text-xs theme-muted">{t("encrypt.subtitle")}</p>
          </div>
        </div>

        {/* Input mode tabs */}
        <div className="flex gap-1 mb-4 glass !rounded-lg p-0.5">
          <button type="button" onClick={() => setInputMode("text")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium chip-select cursor-pointer ${inputMode === "text" ? "bg-[var(--primary)] text-[var(--btn-text)]" : "theme-muted hover:theme-text"}`}>
            <FileText className="w-3 h-3" />{t("mode.text")}
          </button>
          <button type="button" onClick={() => setInputMode("file")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium chip-select cursor-pointer ${inputMode === "file" ? "bg-[var(--primary)] text-[var(--btn-text)]" : "theme-muted hover:theme-text"}`}>
            <Upload className="w-3 h-3" />{t("mode.file")}
          </button>
        </div>

        {/* Text mode content */}
        {inputMode === "text" && (
          <div className="mb-4 animate-in">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="secret-content" className="text-xs font-medium theme-text">{t("form.content.label")}</label>
              <div className="flex items-center gap-2">
                {textFileName && (
                  <span className="flex items-center gap-1 text-[11px] text-primary theme-primary-faint theme-primary-border border px-2 py-0.5 rounded-md">
                    <FileText className="w-3 h-3" />{textFileName}
                    <button type="button" onClick={clearTextFile} className="hover:theme-heading cursor-pointer ml-0.5" aria-label="Remove file"><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button type="button" onClick={() => textFileRef.current?.click()} className="flex items-center gap-1 text-[11px] theme-faint hover:text-primary transition-colors duration-200 cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--glass-bg)]">
                  <Upload className="w-3 h-3" />.txt / .env
                </button>
                <input ref={textFileRef} type="file" accept=".txt,.env" onChange={handleTextFileUpload} className="hidden" />
              </div>
            </div>
            <textarea id="secret-content" rows={4} value={content} onChange={(e) => { setContent(e.target.value); setTextFileName(null); }} placeholder={t("form.content.placeholder")} className="w-full font-mono text-sm resize-none" />
          </div>
        )}

        {/* File mode content */}
        {inputMode === "file" && (
          <div className="mb-4 animate-in">
            <label className="text-xs font-medium theme-text mb-2 block">{t("mode.file.label")}</label>
            <div role="button" tabIndex={0} onClick={() => fileRef.current?.click()} onKeyDown={(e) => { if (e.key === "Enter") fileRef.current?.click(); }} className="w-full glass !rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors duration-200 dropzone-pulse">
              {fileName ? (
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-primary">{fileName}</p>
                    <p className="text-[10px] theme-muted">{fileType} &middot; {formatBytes(fileSize)}</p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); clearFile(); }} className="theme-faint hover:theme-danger transition-colors cursor-pointer ml-2" aria-label="Remove file">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 theme-faint" />
                  <span className="text-xs theme-muted">{t("mode.file.placeholder")}</span>
                  <span className="text-[10px] theme-faint">{t("mode.file.limit")} {limits.maxFileSizeLabel}</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" onChange={handleFileUpload} className="hidden" />
            <div className="mt-3">
              <DeviceInfo limits={limits} />
            </div>
          </div>
        )}

        {/* Passphrase + TTL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="passphrase" className="block text-xs font-medium theme-text mb-2">{t("form.passphrase")}</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input id="passphrase" type={showPass ? "text" : "password"} value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder={t("form.passphrase.placeholder")} className="w-full pr-10 font-mono text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 theme-faint hover:theme-muted transition-colors cursor-pointer" aria-label="Toggle passphrase">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <KeyGenerator onSelect={setPassphrase} />
            </div>
          </div>
          <div>
            <label htmlFor="ttl-select" className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2"><Clock className="w-3 h-3" />{t("form.expires")}</label>
            <select id="ttl-select" value={ttl} onChange={(e) => setTtl(Number(e.target.value))} className="w-full text-sm py-[0.6875rem] px-3 cursor-pointer">
              {TTL_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{t(opt.labelKey as Parameters<typeof t>[0])}</option>))}
            </select>
          </div>
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between py-2.5 px-3 mb-4 rounded-xl text-xs theme-muted hover:theme-text hover:bg-[var(--glass-bg)] transition-colors duration-200 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            {t("advanced.title")}
          </span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Advanced options */}
        {showAdvanced && (
          <div className="glass !rounded-xl p-5 mb-4 space-y-4">
            {/* Security level */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                <Gauge className="w-3 h-3" />{t("advanced.security")}
              </label>
              <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-2">
                {SECURITY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setIterations(level.value)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border ${
                      iterations === level.value
                        ? "bg-[var(--primary)] text-[var(--btn-text)] border-transparent"
                        : "glass theme-muted hover:theme-text"
                    }`}
                  >
                    {t(level.labelKey as Parameters<typeof t>[0])}
                  </button>
                ))}
              </div>
            </div>

            {/* Compression */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                <Hash className="w-3 h-3" />{t("advanced.compression")}
              </label>
              <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-2">
                {COMPRESSION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCompression(opt.value)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border ${
                      compression === opt.value
                        ? "bg-[var(--primary)] text-[var(--btn-text)] border-transparent"
                        : "glass theme-muted hover:theme-text"
                    }`}
                  >
                    {t(opt.labelKey as Parameters<typeof t>[0])}
                  </button>
                ))}
              </div>
            </div>

            {/* Dual key */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer group w-fit mb-2">
                <div className="relative">
                  <input type="checkbox" checked={dualKey} onChange={(e) => setDualKey(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 toggle-track rounded-full peer-checked:toggle-track-checked transition-colors duration-200" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 toggle-knob rounded-full peer-checked:translate-x-4 peer-checked:toggle-knob-checked transition-all duration-200" />
                </div>
                <span className="flex items-center gap-1.5 text-xs theme-muted group-hover:theme-text transition-colors">
                  <KeyRound className="w-3.5 h-3.5" />{t("advanced.dualkey")}
                </span>
              </label>
              {dualKey && (
                <div className="relative mt-2">
                  <input id="encrypt-pass2" type={showSecondPass ? "text" : "password"} value={secondPassphrase} onChange={(e) => setSecondPassphrase(e.target.value)} placeholder={t("advanced.dualkey.placeholder")} className="w-full pr-10 font-mono text-sm" aria-label="Second passphrase" />
                  <button type="button" onClick={() => setShowSecondPass(!showSecondPass)} className="absolute right-3 top-1/2 -translate-y-1/2 theme-faint hover:theme-muted transition-colors cursor-pointer">
                    {showSecondPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Reveal key */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                <KeyRound className="w-3 h-3" />{t("advanced.revealkey")}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input id="encrypt-reveal" type={showRevealKey ? "text" : "password"} value={revealKey} onChange={(e) => setRevealKey(e.target.value)} placeholder={t("advanced.revealkey.placeholder")} className="w-full pr-10 font-mono text-sm" aria-label="Reveal key" />
                  <button type="button" onClick={() => setShowRevealKey(!showRevealKey)} className="absolute right-3 top-1/2 -translate-y-1/2 theme-faint hover:theme-muted transition-colors cursor-pointer">
                    {showRevealKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <KeyGenerator onSelect={setRevealKey} />
              </div>
              <p className="text-[10px] theme-faint mt-1">{t("advanced.revealkey.help")}</p>
            </div>

            {/* Max attempts */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                <Shield className="w-3 h-3" />{t("advanced.attempts")}
              </label>
              <select id="max-attempts" value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))} className="w-full text-sm py-2.5 px-3 cursor-pointer" aria-label="Maximum decryption attempts">
                <option value={0}>{t("advanced.attempts.unlimited")}</option>
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </div>

            {/* Hint */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                <MessageSquare className="w-3 h-3" />{t("advanced.hint")}
              </label>
              <input type="text" value={hint} onChange={(e) => setHint(e.target.value)} placeholder={t("advanced.hint.placeholder")} className="w-full text-sm" />
            </div>

            {/* Public note */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                <MessageSquare className="w-3 h-3" />{t("advanced.note")}
              </label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("advanced.note.placeholder")} className="w-full text-sm" />
            </div>

            {/* Secret question */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                <HelpCircle className="w-3 h-3" />{t("advanced.question")}
              </label>
              <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t("advanced.question.placeholder")} className="w-full text-sm mb-2" />
              {question && (
                <input type="text" value={questionAnswer} onChange={(e) => setQuestionAnswer(e.target.value)} placeholder={t("advanced.question.answer")} className="w-full text-sm" />
              )}
            </div>

            {/* IP allowlist */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                <Globe className="w-3 h-3" />{t("advanced.ip")}
              </label>
              <div className="flex flex-col min-[400px]:flex-row gap-2 mb-1">
                <input id="allowed-ips" type="text" value={allowedIpsInput} onChange={(e) => setAllowedIpsInput(e.target.value)} placeholder={t("advanced.ip.placeholder")} className="flex-1 text-sm font-mono" aria-label="Allowed IP addresses" />
                <button
                  type="button"
                  disabled={ipLoading}
                  onClick={async () => {
                    setIpLoading(true);
                    const result = await detectIp();
                    setIpLoading(false);
                    setIpResult(result);
                    if (result.ip) {
                      setAllowedIpsInput((prev) => prev ? `${prev}, ${result.ip}` : result.ip);
                    }
                  }}
                  className="px-3 py-2 rounded-lg text-[11px] font-medium theme-primary-faint theme-primary-border border text-primary hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
                >
                  {ipLoading ? "..." : t("advanced.ip.addmine")}
                </button>
              </div>
              <p className="text-[10px] theme-faint mt-1">{t("advanced.ip.help")}</p>

              {/* VPN / Proxy / Inconsistency warnings */}
              {ipResult && ipResult.vpnDetected && (
                <div className="flex items-start gap-1.5 mt-2 glass !rounded-lg px-3 py-2">
                  <Shield className="w-3 h-3 theme-warning shrink-0 mt-0.5" />
                  <p className="text-[10px] theme-warning">{t("advanced.ip.vpn")}</p>
                </div>
              )}
              {ipResult && ipResult.inconsistent && !ipResult.vpnDetected && (
                <div className="flex items-start gap-1.5 mt-2 glass !rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3 h-3 theme-warning shrink-0 mt-0.5" />
                  <p className="text-[10px] theme-warning">{t("advanced.ip.inconsistent")} ({ipResult.allIps.join(", ")})</p>
                </div>
              )}
              {ipResult && !ipResult.vpnDetected && !ipResult.inconsistent && (
                <p className="text-[10px] text-primary mt-1">{t("advanced.ip.clean")}</p>
              )}
              {!ipResult && (
                <p className="text-[10px] theme-faint mt-1">{t("advanced.ip.disclaimer")}</p>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div role="alert" aria-live="assertive" className="flex items-center gap-2 theme-danger text-sm mb-4 theme-danger-faint theme-danger-border border rounded-xl px-3.5 py-2.5 error-shake">
            <AlertTriangle className="w-4 h-4 shrink-0" /><span className="text-xs">{error}</span>
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> {t("form.encrypting")}</>) : (<><Lock className="w-4 h-4" /> {t("encrypt.submit")}</>)}
        </button>

        <p className="text-[10px] theme-faint text-center mt-4 leading-relaxed max-w-sm mx-auto">{t("form.security.note")}</p>
      </div>
    </form>
  );
}

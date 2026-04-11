"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Upload,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  Download,
  Clock,
  FileText,
  ShieldOff,
  MessageSquare,
  HelpCircle,
  KeyRound,
  Info,
} from "lucide-react";
import { decodeZefer, parseFile, type ZeferPayload, type ZeferHeader } from "@/app/lib/zefer";
import { analyzeDevice, formatBytes, type DeviceLimits } from "@/app/lib/device";
import DeviceInfo from "@/app/components/DeviceInfo";
import { detectIp, isIpAllowed } from "@/app/lib/ip";
import { createDecryptTracker, type ProgressState } from "@/app/lib/progress";
import CryptoProgress from "@/app/components/CryptoProgress";
import { useLanguage } from "@/app/components/LanguageProvider";
import { notifySuccess, notifyError } from "@/app/lib/notify";

export default function DecryptForm() {
  const { t } = useLanguage();

  // File
  const [fileLoaded, setFileLoaded] = useState<string | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [zeferFileName, setZeferFileName] = useState<string | null>(null);
  const [header, setHeader] = useState<ZeferHeader | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Device limits
  const [limits, setLimits] = useState<DeviceLimits | null>(null);
  useEffect(() => { setLimits(analyzeDevice()); }, []);

  // Auth
  const [passphrase, setPassphrase] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [useDualKey, setUseDualKey] = useState(false);
  const [secondPassphrase, setSecondPassphrase] = useState("");
  const [showSecondPass, setShowSecondPass] = useState(false);

  // URL params (long and short aliases)
  const searchParams = useSearchParams();
  const paramsApplied = useRef(false);
  useEffect(() => {
    if (paramsApplied.current) return;
    paramsApplied.current = true;
    const urlTab = searchParams.get("tab") || searchParams.get("t");
    if (urlTab === "encrypt") return;
    const g = (long: string, short: string) => searchParams.get(long) ?? searchParams.get(short) ?? null;
    let hasSensitive = false;

    const pass = g("passphrase", "p");
    if (pass) { setPassphrase(pass); hasSensitive = true; }
    const pass2 = g("passphrase2", "p2");
    if (pass2) { setSecondPassphrase(pass2); setUseDualKey(true); hasSensitive = true; }
    const dual = g("dual", "d");
    if (dual === "1" || dual === "true") setUseDualKey(true);
    const ans = g("answer", "a");
    if (ans) { setQuestionAnswer(ans); hasSensitive = true; }

    if (hasSensitive) window.history.replaceState({}, "", window.location.pathname);
  }, [searchParams]);

  // Post-decryption question
  const [questionAnswer, setQuestionAnswer] = useState("");

  // Performance
  const [progress, setProgress] = useState<ProgressState | null>(null);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [blockedIp, setBlockedIp] = useState<string | null>(null);
  const [payload, setPayload] = useState<ZeferPayload | null>(null);
  const [copied, setCopied] = useState(false);


  function processFile(file: File) {
    if (!file.name.endsWith(".zefer")) {
      setError(t("decrypt.error.format"));
      return;
    }
    // Check file size against device limits
    if (limits && file.size > limits.maxFileSize) {
      setError(`${t("decrypt.error.toolarge")} ${limits.maxFileSizeLabel}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError(null);
    setErrorType(null);
    setZeferFileName(file.name);

    // Read as both ArrayBuffer (for binary .zefer) and text (for text .zefer)
    const bufReader = new FileReader();
    bufReader.onload = (ev) => {
      const buf = ev.target?.result as ArrayBuffer;
      if (!buf) return;
      setFileBytes(buf);

      // Try binary parse first
      const parsed = parseFile("", buf);
      if (parsed) {
        setHeader(parsed.header);
        setFileLoaded("__binary__");
        return;
      }

      // Fall back to text parse
      const textReader = new FileReader();
      textReader.onload = (ev2) => {
        const text = ev2.target?.result as string;
        if (!text) return;
        setFileLoaded(text);
        const textParsed = parseFile(text);
        if (textParsed) setHeader(textParsed.header);
      };
      textReader.readAsText(file);
    };
    bufReader.readAsArrayBuffer(file);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  async function handleDecrypt(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorType(null);

    if (!fileLoaded) { setError(t("decrypt.error.nofile")); return; }
    if (!passphrase) { setError(t("decrypt.error.nopass")); return; }

    setLoading(true);

    const tracker = createDecryptTracker(setProgress);

    try {
      tracker.deriving();
      await new Promise((r) => requestAnimationFrame(r));

      const result = await decodeZefer(fileLoaded || "", passphrase, {
        secondPassphrase: useDualKey ? secondPassphrase : undefined,
        questionAnswer: questionAnswer || undefined,
        rawBytes: fileBytes || undefined,
        onProgress: tracker,
      });

      if (!result.ok) {
        if (result.error === "needs_answer") {
          setError(t("decrypt.error.noanswer"));
          setErrorType("needs_answer");
          setLoading(false);
          setProgress(null);
          return;
        }

        setErrorType(result.error);
        const errorMap: Record<string, string> = {
          invalid_format: t("decrypt.error.format"),
          expired: t("decrypt.error.expired"),
          wrong_passphrase: t("decrypt.error.wrong"),
          wrong_answer: t("decrypt.error.wronganswer"),
          max_attempts: t("decrypt.error.maxattempts"),
          ip_blocked: t("decrypt.error.ipblocked"),
          needs_dual_key: t("decrypt.error.wrong"),
        };
        setError(errorMap[result.error] || t("form.error.generic"));
        setLoading(false);
        setProgress(null);
        return;
      }

      tracker.verifying();
      await new Promise((r) => requestAnimationFrame(r));

      // IP restriction check (allowedIps is inside the decrypted payload)
      if (result.payload.meta.allowedIps.length > 0) {
        const ipResult = await detectIp();
        if (!ipResult.ip || !isIpAllowed(ipResult.ip, result.payload.meta.allowedIps)) {
          setErrorType("ip_blocked");
          setBlockedIp(ipResult.ip || null);
          setError(t("decrypt.error.ipblocked"));
          setLoading(false);
          setProgress(null);
          return;
        }
      }

      tracker.done();
      await new Promise((r) => setTimeout(r, 400));

      // Clear secrets from memory immediately after successful decryption
      setPassphrase(""); setSecondPassphrase(""); setQuestionAnswer("");

      setPayload(result.payload);
      notifySuccess(t("toast.decrypt.success"), t("toast.decrypt.success.desc"));
    } catch {
      setError(t("form.error.generic"));
      notifyError(t("toast.error.generic"));
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }


  async function copyContent() {
    if (!payload?.content) return;
    await navigator.clipboard.writeText(payload.content);
    setCopied(true);
    notifySuccess(t("toast.copy.success"));
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadContent() {
    if (!payload) return;
    const isFile = !!payload.fileData;
    const blob = isFile
      ? new Blob([payload.fileData!], { type: payload.meta.fileType || "application/octet-stream" })
      : new Blob([payload.content || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = payload.meta.fileName || (isFile ? "file" : "secret.txt");
    document.body.appendChild(a);
    a.click();
    notifySuccess(t("toast.download.success"));
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function reset() {
    setPassphrase(""); setSecondPassphrase(""); setQuestionAnswer("");
    setFileLoaded(null); setFileBytes(null); setZeferFileName(null); setHeader(null);
    setPayload(null); setError(null); setErrorType(null);
    setCopied(false); setUseDualKey(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function formatExpiry(ts: number): string {
    if (ts === 0) return t("decrypt.never");
    return new Date(ts).toLocaleString();
  }

  // ─── Progress ───
  if (progress && loading) {
    return <CryptoProgress state={progress} mode="decrypt" />;
  }

  // ─── Fatal errors ───
  if (errorType === "expired" || errorType === "max_attempts" || errorType === "ip_blocked") {
    return (
      <div className="glass p-6 sm:p-8 text-center animate-in">
        <div className="w-12 h-12 rounded-xl theme-danger-faint flex items-center justify-center mx-auto mb-4">
          <ShieldOff className="w-6 h-6 theme-danger" />
        </div>
        <h2 className="text-base font-semibold theme-heading mb-2">
          {errorType === "expired" ? t("decrypt.expired.title") : errorType === "ip_blocked" ? t("decrypt.ipblocked.title") : t("decrypt.blocked.title")}
        </h2>
        <p className="text-sm theme-muted mb-3 max-w-sm mx-auto">
          {errorType === "expired" ? t("decrypt.expired.desc") : errorType === "ip_blocked" ? t("decrypt.ipblocked.desc") : t("decrypt.blocked.desc")}
        </p>
        {errorType === "ip_blocked" && blockedIp && (
          <div className="glass !rounded-lg px-4 py-2.5 mb-5 inline-block">
            <p className="text-[10px] theme-faint mb-1">{t("decrypt.ipblocked.yourip")}</p>
            <p className="text-xs font-mono theme-danger font-medium">{blockedIp}</p>
          </div>
        )}
        {errorType !== "ip_blocked" && <div className="mb-5" />}
        <button onClick={reset} className="btn-primary w-full">{t("decrypt.tryother")}</button>
      </div>
    );
  }

  // ─── Revealed ───
  if (payload) {
    const isFile = !!payload.fileData;

    return (
      <div className="glass glow-green p-6 sm:p-8 animate-in stagger-children">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl theme-primary-faint theme-primary-border border flex items-center justify-center success-icon">
            <Unlock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold theme-heading">{t("decrypt.success.title")}</h2>
            {payload.meta.fileName && (
              <p className="text-xs theme-muted flex items-center gap-1"><FileText className="w-3 h-3" /> {payload.meta.fileName}</p>
            )}
          </div>
        </div>

        {/* Metadata badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="glass !rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <Clock className="w-3 h-3 theme-faint" />
            <span className="text-[11px] theme-muted">
              {payload.meta.expiresAt > 0 ? `${t("decrypt.expires")}: ${formatExpiry(payload.meta.expiresAt)}` : t("decrypt.never")}
            </span>
          </div>
          {isFile && (
            <div className="glass !rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <FileText className="w-3 h-3 theme-faint" />
              <span className="text-[11px] theme-muted">{payload.meta.fileType} &middot; {formatBytes(payload.meta.fileSize)}</span>
            </div>
          )}
        </div>

        {/* Content: text preview or file download */}
        {isFile ? (
          <div className="glass !rounded-xl p-6 mb-4 text-center animate-in">
            <FileText className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="text-sm theme-heading font-medium mb-1">{payload.meta.fileName}</p>
            <p className="text-xs theme-muted mb-4">{formatBytes(payload.meta.fileSize)}</p>
            <button onClick={downloadContent} className="btn-primary">
              <Download className="w-4 h-4" /> {t("decrypt.download")}
            </button>
          </div>
        ) : (
          <>
            <div className="glass !rounded-xl p-4 mb-4">
              <pre className="text-sm theme-text font-mono whitespace-pre-wrap break-all max-h-80 overflow-y-auto reveal-content">{payload.content}</pre>
            </div>
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 mb-4">
              <button onClick={copyContent} className="btn-primary">
                {copied ? <><Check className="w-4 h-4" /> {t("success.copied")}</> : <><Copy className="w-4 h-4" /> {t("decrypt.copy")}</>}
              </button>
              <button onClick={downloadContent} className="btn-primary">
                <Download className="w-4 h-4" /> {t("decrypt.download")}
              </button>
            </div>
          </>
        )}

        <button onClick={reset} className="w-full text-xs theme-faint hover:theme-muted py-2 transition-colors duration-200 cursor-pointer">{t("decrypt.another")}</button>
      </div>
    );
  }

  // ─── Form ───
  return (
    <form onSubmit={handleDecrypt}>
      <div className="glass glow-green-sm p-6 sm:p-8 animate-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl theme-primary-faint theme-primary-border border flex items-center justify-center">
            <Unlock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold theme-heading">{t("decrypt.title")}</h2>
            <p className="text-xs theme-muted">{t("decrypt.subtitle")}</p>
          </div>
        </div>

        {/* File upload */}
        <div className="mb-4">
          <label className="text-xs font-medium theme-text mb-2 block">{t("decrypt.file.label")}</label>
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter") fileInputRef.current?.click(); }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`w-full glass !rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors duration-200 dropzone-pulse ${isDragging ? "ring-2 ring-[var(--primary)] bg-[var(--glass-bg-hover)]" : ""}`}
          >
            {zeferFileName ? (
              <div className="flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">{zeferFileName}</span>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 theme-faint" />
                <span className="text-xs theme-muted">{t("decrypt.file.placeholder")}</span>
                {limits && <span className="text-[10px] theme-faint">{t("mode.file.limit")} {limits.maxFileSizeLabel}</span>}
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept=".zefer" onChange={handleFileUpload} className="hidden" />
          {limits && (
            <div className="mt-3">
              <DeviceInfo limits={limits} />
            </div>
          )}
        </div>

        {/* Public header info: hint, note */}
        {header && (header.note || header.hint) && (
          <div className="glass !rounded-xl p-4 mb-4 space-y-3">
            {header.note && (
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] theme-faint uppercase tracking-wider font-mono mb-0.5">{t("decrypt.info.note")}</p>
                  <p className="text-xs theme-text">{header.note}</p>
                </div>
              </div>
            )}
            {header.hint && (
              <div className="flex items-start gap-2">
                <MessageSquare className="w-3.5 h-3.5 theme-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] theme-faint uppercase tracking-wider font-mono mb-0.5">{t("decrypt.info.hint")}</p>
                  <p className="text-xs theme-text">{header.hint}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Passphrase */}
        <div className="mb-4">
          <label htmlFor="decrypt-pass" className="block text-xs font-medium theme-text mb-2">{t("form.passphrase")}</label>
          <div className="relative has-toggle-wrap">
            <input id="decrypt-pass" type={showPass ? "text" : "password"} value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder={t("form.passphrase.placeholder")} className="w-full has-toggle font-mono text-sm" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center theme-faint hover:theme-text transition-colors cursor-pointer" aria-label={showPass ? "Hide passphrase" : "Show passphrase"}>
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dual key toggle — user can enable if first attempt fails */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className="relative">
              <input type="checkbox" checked={useDualKey} onChange={(e) => setUseDualKey(e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 toggle-track rounded-full peer-checked:toggle-track-checked transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 toggle-knob rounded-full peer-checked:translate-x-4 peer-checked:toggle-knob-checked transition-all duration-200" />
            </div>
            <span className="flex items-center gap-1.5 text-xs theme-muted group-hover:theme-text transition-colors">
              <KeyRound className="w-3.5 h-3.5" />{t("decrypt.dualkey.toggle")}
            </span>
          </label>
          {useDualKey && (
            <div className="relative mt-2 has-toggle-wrap">
              <input id="decrypt-pass2" type={showSecondPass ? "text" : "password"} value={secondPassphrase} onChange={(e) => setSecondPassphrase(e.target.value)} placeholder={t("advanced.dualkey.placeholder")} className="w-full has-toggle font-mono text-sm" aria-label="Second passphrase" />
              <button type="button" onClick={() => setShowSecondPass(!showSecondPass)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center theme-faint hover:theme-text transition-colors cursor-pointer" aria-label={showSecondPass ? "Hide passphrase" : "Show passphrase"}>
                {showSecondPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Secret question answer — shown only after decryption reveals a question */}
        {errorType === "needs_answer" && (
          <div className="mb-4">
            <label className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
              <HelpCircle className="w-3 h-3" />{t("decrypt.question.label")}
            </label>
            <input type="text" value={questionAnswer} onChange={(e) => setQuestionAnswer(e.target.value)} placeholder={t("advanced.question.answer")} className="w-full text-sm" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div role="alert" aria-live="assertive" className="flex items-center gap-2 theme-danger text-sm mb-4 theme-danger-faint theme-danger-border border rounded-xl px-3.5 py-2.5 error-shake">
            <AlertTriangle className="w-4 h-4 shrink-0" /><span className="text-xs">{error}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> {t("decrypt.decrypting")}</>) : (<><Unlock className="w-4 h-4" /> {t("decrypt.submit")}</>)}
        </button>

        <p className="text-[10px] theme-faint text-center mt-4 leading-relaxed max-w-sm mx-auto">{t("decrypt.note")}</p>
      </div>
    </form>
  );
}

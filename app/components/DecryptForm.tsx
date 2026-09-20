"use client";

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import { useUrlParams } from "@/app/lib/useUrlParams";
import {
  Unlock,
  Eye,
  EyeOff,
  Upload,
  AlertTriangle,
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
import { decodeZefer, parseFile, type DecodeError, type ZeferPayload, type ZeferHeader } from "@/app/lib/zefer";
import { analyzeDevice, formatBytes, type DeviceLimits } from "@/app/lib/device";
import DeviceInfo from "@/app/components/DeviceInfo";
import { detectIp, isIpAllowed } from "@/app/lib/ip";
import { createDecryptTracker, type ProgressState } from "@/app/lib/progress";
import CryptoProgress from "@/app/components/CryptoProgress";
import { useLanguage } from "@/app/components/LanguageProvider";
import { Toggle } from "@/app/components/ui";
import { notifySuccess, notifyError } from "@/app/lib/notify";
import { takePendingDecryptFile } from "@/app/lib/file-handoff";
import type { TranslationKey } from "@/app/lib/i18n";

// ─── External store: device limits ───
//
// The hardware profile comes from `navigator`, an external system that cannot
// change while the page is open. Reading it through an external store keeps the
// server render on `null` (so hydration matches) without a setState-in-effect.
let deviceSnapshot: DeviceLimits | null = null;

function getDeviceSnapshot(): DeviceLimits {
  deviceSnapshot ??= analyzeDevice();
  return deviceSnapshot;
}

/** No server snapshot exists — the hardware is only known on the client. */
function getServerDeviceSnapshot(): DeviceLimits | null {
  return null;
}

function subscribeDevice(): () => void {
  return () => {};
}

/** Read only a small head slice to detect the format and parse the public
 *  header for the UI — never the whole (possibly multi-GB) file. The full file
 *  is streamed in slices at decrypt time. `legacyText` is set only for the old
 *  text container, which is small enough to read whole. */
async function readPublicHeader(file: File): Promise<{ header: ZeferHeader | null; legacyText: string | null }> {
  const headBuf = await file.slice(0, Math.min(file.size, 65536)).arrayBuffer();
  const binary = parseFile("", headBuf);
  if (binary) return { header: binary.header, legacyText: null };

  const text = await file.text();
  return { header: parseFile(text)?.header ?? null, legacyText: text };
}

interface DecryptUrlParams {
  passphrase: string | null;
  secondPassphrase: string | null;
  dualKey: boolean;
  answer: string | null;
  /** True when any secret travelled in the URL and it has to be scrubbed. */
  hasSensitive: boolean;
}

/** Decrypt params off the URL, long and short aliases. `null` when the URL
 *  explicitly asks for the encrypt tab instead. */
function readUrlParams(searchParams: URLSearchParams): DecryptUrlParams | null {
  const urlTab = searchParams.get("tab") || searchParams.get("t");
  if (urlTab === "encrypt") return null;

  const g = (long: string, short: string) => searchParams.get(long) ?? searchParams.get(short) ?? null;
  const passphrase = g("passphrase", "p");
  const secondPassphrase = g("passphrase2", "p2");
  const answer = g("answer", "a");
  const dual = g("dual", "d");

  return {
    passphrase,
    secondPassphrase,
    answer,
    dualKey: !!secondPassphrase || dual === "1" || dual === "true",
    hasSensitive: !!passphrase || !!secondPassphrase || !!answer,
  };
}

/** Errors that end the attempt outright — no retry form is offered. */
const FATAL_ERRORS: Record<string, { title: TranslationKey; desc: TranslationKey }> = {
  expired: { title: "decrypt.expired.title", desc: "decrypt.expired.desc" },
  ip_blocked: { title: "decrypt.ipblocked.title", desc: "decrypt.ipblocked.desc" },
  max_attempts: { title: "decrypt.blocked.title", desc: "decrypt.blocked.desc" },
};

/** Expired file, exhausted attempts or a blocked IP: a dead end with one way out. */
function FatalError({
  errorType,
  blockedIp,
  onReset,
}: Readonly<{ errorType: string; blockedIp: string | null; onReset: () => void }>) {
  const { t } = useLanguage();
  const copy = FATAL_ERRORS[errorType];

  return (
    <div className="glass p-6 sm:p-8 text-center animate-in">
      <div className="w-12 h-12 rounded-xl theme-danger-faint flex items-center justify-center mx-auto mb-4">
        <ShieldOff className="w-6 h-6 theme-danger" />
      </div>
      <h2 className="text-base font-semibold theme-heading mb-2">{t(copy.title)}</h2>
      <p className="text-sm theme-muted mb-3 max-w-sm mx-auto">{t(copy.desc)}</p>
      {errorType === "ip_blocked" && blockedIp ? (
        <div className="glass !rounded-lg px-4 py-2.5 mb-5 inline-block">
          <p className="text-[10px] theme-faint mb-1">{t("decrypt.ipblocked.yourip")}</p>
          <p className="text-xs font-mono theme-danger font-medium">{blockedIp}</p>
        </div>
      ) : (
        <div className="mb-5" />
      )}
      <button onClick={onReset} className="btn-primary w-full">{t("decrypt.tryother")}</button>
    </div>
  );
}

/** The decrypted secret: text preview with copy, or a file download. */
function RevealedPayload({
  payload,
  onReset,
}: Readonly<{ payload: ZeferPayload; onReset: () => void }>) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const isFile = !!payload.fileData;

  async function copyContent() {
    if (!payload.content) return;
    await navigator.clipboard.writeText(payload.content);
    setCopied(true);
    notifySuccess(t("toast.copy.success"));
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadContent() {
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
    a.remove();
    URL.revokeObjectURL(url);
  }

  const expiry = payload.meta.expiresAt > 0
    ? `${t("decrypt.expires")}: ${new Date(payload.meta.expiresAt).toLocaleString()}`
    : t("decrypt.never");

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
          <span className="text-[11px] theme-muted">{expiry}</span>
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

      <button onClick={onReset} className="w-full text-xs theme-faint hover:theme-muted py-2 transition-colors duration-200 cursor-pointer">{t("decrypt.another")}</button>
    </div>
  );
}

/** Masked text field with its own show/hide toggle. Both passphrase inputs on
 *  this form are the same control, so the visibility state lives here. */
function PasswordInput({
  id, name, value, onChange, placeholder, inputLabel, showKey, hideKey,
}: Readonly<{
  id: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputLabel?: string;
  showKey: TranslationKey;
  hideKey: TranslationKey;
}>) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative has-toggle-wrap">
      <input
        id={id}
        name={name}
        autoComplete="current-password"
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={inputLabel}
        className="w-full has-toggle font-mono text-sm"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center theme-faint hover:theme-text transition-colors cursor-pointer"
        aria-label={t(visible ? hideKey : showKey)}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

/** Public hint / note carried in the header — readable without the passphrase. */
function PublicHeaderInfo({ header }: Readonly<{ header: ZeferHeader }>) {
  const { t } = useLanguage();

  return (
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
  );
}

export default function DecryptForm() {
  const { t } = useLanguage();

  // File — the text form of the container ("__binary__" for the binary ones)
  // and the File itself, streamed in slices at decrypt time so multi-GB files
  // are never read into a single buffer. Both land together or not at all.
  const [source, setSource] = useState<{ text: string; blob: File } | null>(null);
  const [zeferFileName, setZeferFileName] = useState<string | null>(null);
  const [header, setHeader] = useState<ZeferHeader | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth
  const [passphrase, setPassphrase] = useState("");
  const [useDualKey, setUseDualKey] = useState(false);
  const [secondPassphrase, setSecondPassphrase] = useState("");

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
  const [isDragging, setIsDragging] = useState(false);

  const limits = useSyncExternalStore(subscribeDevice, getDeviceSnapshot, getServerDeviceSnapshot);

  /** Drop the picked file so the very same one can be chosen again after a
   *  rejection. Null once the form itself is gone (fatal error / revealed). */
  const clearFileInput = useCallback(() => {
    const input = fileInputRef.current;
    if (input) input.value = "";
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".zefer")) {
      setError(t("decrypt.error.format"));
      return;
    }
    // Check file size against device limits
    if (limits && file.size > limits.maxFileSize) {
      setError(`${t("decrypt.error.toolarge")} ${limits.maxFileSizeLabel}`);
      clearFileInput();
      return;
    }

    setError(null);
    setErrorType(null);
    setZeferFileName(file.name);

    readPublicHeader(file).then(
      ({ header: parsedHeader, legacyText }) => {
        setHeader(parsedHeader);
        setSource({ text: legacyText ?? "__binary__", blob: file });
      },
      () => {
        setError(t("form.error.file.read"));
        clearFileInput();
      }
    );
  }, [limits, t, clearFileInput]);

  // File handed over from /analyzer ("Decrypt this file"). The ref guard makes
  // this run exactly once even though `processFile` is re-created when the
  // locale changes.
  const pendingTaken = useRef(false);
  useEffect(() => {
    if (pendingTaken.current) return;
    pendingTaken.current = true;
    const pending = takePendingDecryptFile();
    if (pending) processFile(pending);
  }, [processFile]);

  // URL params (long and short aliases), applied exactly once
  const searchParams = useUrlParams();
  const paramsApplied = useRef(false);
  useEffect(() => {
    if (!searchParams || paramsApplied.current) return;
    paramsApplied.current = true;

    const params = readUrlParams(searchParams);
    if (!params) return;

    if (params.passphrase) setPassphrase(params.passphrase);
    if (params.secondPassphrase) setSecondPassphrase(params.secondPassphrase);
    if (params.dualKey) setUseDualKey(true);
    if (params.answer) setQuestionAnswer(params.answer);
    if (params.hasSensitive) window.history.replaceState({}, "", window.location.pathname);
  }, [searchParams]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  /** Map a decode failure onto the message shown under the form. */
  function reportDecodeFailure(code: DecodeError) {
    setErrorType(code);
    const errorMap: Record<DecodeError, string> = {
      invalid_format: t("decrypt.error.format"),
      expired: t("decrypt.error.expired"),
      wrong_passphrase: t("decrypt.error.wrong"),
      wrong_answer: t("decrypt.error.wronganswer"),
      max_attempts: t("decrypt.error.maxattempts"),
      ip_blocked: t("decrypt.error.ipblocked"),
      needs_answer: t("decrypt.error.noanswer"),
    };
    setError(errorMap[code]);
  }

  /** IP allowlist lives inside the decrypted payload, so it is checked here.
   *  Returns true when the current IP may see the secret. */
  async function passesIpCheck(allowedIps: string[]): Promise<boolean> {
    if (allowedIps.length === 0) return true;
    const ipResult = await detectIp();
    if (ipResult.ip && isIpAllowed(ipResult.ip, allowedIps)) return true;
    setErrorType("ip_blocked");
    setBlockedIp(ipResult.ip || null);
    setError(t("decrypt.error.ipblocked"));
    return false;
  }

  async function handleDecrypt(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorType(null);

    if (!source) { setError(t("decrypt.error.nofile")); return; }
    if (!passphrase) { setError(t("decrypt.error.nopass")); return; }

    setLoading(true);
    const tracker = createDecryptTracker(setProgress);

    try {
      tracker.deriving();
      await new Promise((r) => requestAnimationFrame(r));

      const result = await decodeZefer(source.text, passphrase, {
        secondPassphrase: useDualKey ? secondPassphrase : undefined,
        questionAnswer: questionAnswer || undefined,
        fileBlob: source.blob,
        onProgress: tracker,
      });

      if (!result.ok) {
        reportDecodeFailure(result.error);
        return;
      }

      tracker.verifying();
      await new Promise((r) => requestAnimationFrame(r));

      if (!await passesIpCheck(result.payload.meta.allowedIps)) return;

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

  function reset() {
    setPassphrase(""); setSecondPassphrase(""); setQuestionAnswer("");
    setSource(null); setZeferFileName(null); setHeader(null);
    setPayload(null); setError(null); setErrorType(null);
    setUseDualKey(false);
    clearFileInput();
  }

  // ─── Progress ───
  if (progress && loading) {
    return <CryptoProgress state={progress} mode="decrypt" />;
  }

  // ─── Fatal errors ───
  if (errorType && FATAL_ERRORS[errorType]) {
    return <FatalError errorType={errorType} blockedIp={blockedIp} onReset={reset} />;
  }

  // ─── Revealed ───
  if (payload) {
    return <RevealedPayload payload={payload} onReset={reset} />;
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

        {/* File upload — a real <button>, so Enter and Space both activate it */}
        <div className="mb-4">
          <label className="text-xs font-medium theme-text mb-2 block">{t("decrypt.file.label")}</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            aria-label={t("decrypt.file.placeholder")}
            className={`w-full glass !rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors duration-200 dropzone-pulse ${isDragging ? "ring-2 ring-[var(--primary)] bg-[var(--glass-bg-hover)]" : ""}`}
          >
            {zeferFileName ? (
              <span className="flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">{zeferFileName}</span>
              </span>
            ) : (
              <>
                <Upload className="w-5 h-5 theme-faint" />
                <span className="text-xs theme-muted">{t("decrypt.file.placeholder")}</span>
                {limits && <span className="text-[10px] theme-faint">{t("mode.file.limit")} {limits.maxFileSizeLabel}</span>}
              </>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept=".zefer" onChange={handleFileUpload} className="hidden" />
          {limits && (
            <div className="mt-3">
              <DeviceInfo limits={limits} />
            </div>
          )}
        </div>

        {/* Public header info: hint, note */}
        {header && (header.note || header.hint) && <PublicHeaderInfo header={header} />}

        {/* Passphrase */}
        <div className="mb-4">
          <label htmlFor="decrypt-pass" className="block text-xs font-medium theme-text mb-2">{t("form.passphrase")}</label>
          <PasswordInput
            id="decrypt-pass"
            name="passphrase"
            value={passphrase}
            onChange={setPassphrase}
            placeholder={t("form.passphrase.placeholder")}
            showKey="aria.showpass"
            hideKey="aria.hidepass"
          />
        </div>

        {/* Dual key toggle — user can enable if first attempt fails */}
        <div className="mb-4">
          <Toggle checked={useDualKey} onCheckedChange={setUseDualKey} icon={KeyRound} label={t("decrypt.dualkey.toggle")} />
          {useDualKey && (
            <div className="mt-2">
              <PasswordInput
                id="decrypt-pass2"
                name="second-passphrase"
                value={secondPassphrase}
                onChange={setSecondPassphrase}
                placeholder={t("advanced.dualkey.placeholder")}
                inputLabel={t("advanced.dualkey")}
                showKey="aria.showsecond"
                hideKey="aria.hidesecond"
              />
            </div>
          )}
        </div>

        {/* Secret question answer — shown once decryption reveals a question,
            and kept on screen after a wrong answer so it can be corrected. */}
        {(errorType === "needs_answer" || errorType === "wrong_answer") && (
          <div className="mb-4">
            <label htmlFor="decrypt-answer" className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
              <HelpCircle className="w-3 h-3" />{t("decrypt.question.label")}
            </label>
            <input id="decrypt-answer" name="answer" type="text" value={questionAnswer} onChange={(e) => setQuestionAnswer(e.target.value)} placeholder={t("advanced.question.answer")} className="w-full text-sm" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div role="alert" aria-live="assertive" className="flex items-center gap-2 theme-danger text-sm mb-4 theme-danger-faint theme-danger-border border rounded-xl px-3.5 py-2.5 error-shake">
            <AlertTriangle className="w-4 h-4 shrink-0" /><span className="text-xs">{error}</span>
          </div>
        )}

        {/* While decrypting, the whole form is replaced by <CryptoProgress>,
            so this button never renders a spinner of its own. */}
        <button type="submit" disabled={loading} className="btn-primary">
          <Unlock className="w-4 h-4" /> {t("decrypt.submit")}
        </button>

        <p className="text-[10px] theme-faint text-center mt-4 leading-relaxed max-w-sm mx-auto">{t("decrypt.note")}</p>
      </div>
    </form>
  );
}

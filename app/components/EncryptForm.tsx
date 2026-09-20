"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { useUrlParams } from "@/app/lib/useUrlParams";
import {
  Lock,
  Eye,
  EyeOff,
  Clock,
  Upload,
  FileText,
  X,
  AlertTriangle,
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
  Copy,
  Link2,
  Share2,
} from "lucide-react";
import { encodeZefer } from "@/app/lib/zefer";
import { parseIpList, detectIp, type IpDetectionResult } from "@/app/lib/ip";
import { analyzeDevice, formatBytes, type DeviceLimits } from "@/app/lib/device";
import { createEncryptTracker, type ProgressState } from "@/app/lib/progress";
import CryptoProgress from "@/app/components/CryptoProgress";
import KeyGenerator from "@/app/components/KeyGenerator";
import DeviceInfo from "@/app/components/DeviceInfo";
import { Tooltip } from "radix-ui";
import { GlassSelect, TipBubble, Toggle } from "@/app/components/ui";
import type { CompressionMethod } from "@/app/lib/compression";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePreferences } from "@/app/lib/preferences";
import { notifySuccess, notifyError, notifyWarning } from "@/app/lib/notify";
import type { TranslationKey } from "@/app/lib/i18n";

const TTL_OPTIONS: { labelKey: TranslationKey; value: number }[] = [
  { labelKey: "ttl.5min", value: 5 },
  { labelKey: "ttl.15min", value: 15 },
  { labelKey: "ttl.30min", value: 30 },
  { labelKey: "ttl.1hour", value: 60 },
  { labelKey: "ttl.24hours", value: 1440 },
  { labelKey: "ttl.7days", value: 10080 },
  { labelKey: "ttl.2weeks", value: 20160 },
  { labelKey: "ttl.1month", value: 43200 },
  { labelKey: "ttl.never", value: 0 },
];

const SECURITY_LEVELS: { labelKey: TranslationKey; value: number }[] = [
  { labelKey: "security.standard", value: 300_000 },
  { labelKey: "security.high", value: 600_000 },
  { labelKey: "security.maximum", value: 1_000_000 },
];

const SECURITY_BY_NAME: Record<string, number> = {
  standard: 300_000,
  high: 600_000,
  maximum: 1_000_000,
};

const COMPRESSION_OPTIONS: { labelKey: TranslationKey; value: CompressionMethod }[] = [
  { labelKey: "compression.none", value: "none" },
  { labelKey: "compression.gzip", value: "gzip" },
  { labelKey: "compression.deflate", value: "deflate" },
];

type InputMode = "text" | "file";

const TEXT_EXTENSIONS = new Set([".txt", ".env"]);
const TEXT_MAX = 256 * 1024;

const FALLBACK_LIMITS: DeviceLimits = {
  maxFileSize: 40 * 1024 * 1024,
  maxFileSizeLabel: "40 MB",
  profile: {
    ram: 0, cores: 0, gpu: null, gpuVendor: null, cpuArch: null,
    platform: "unknown", platformVersion: null, userAgent: "", mobile: false,
    heapLimit: null, heapUsed: null, heapTotal: null,
  },
};

// ─── External store: device limits ───
//
// The hardware profile comes from `navigator`, an external system that cannot
// change while the page is open. Reading it through an external store keeps the
// server render and the hydration render on FALLBACK_LIMITS — which is what the
// static markup ships — without a setState-in-effect.
let deviceSnapshot: DeviceLimits | null = null;

function getDeviceSnapshot(): DeviceLimits {
  deviceSnapshot ??= analyzeDevice();
  return deviceSnapshot;
}

function getServerDeviceSnapshot(): DeviceLimits {
  return FALLBACK_LIMITS;
}

function subscribeDevice(): () => void {
  return () => {};
}

/** Parse a non-negative integer URL param; `null` when it is absent or junk. */
function parseCount(raw: string | null): number | null {
  if (raw === null) return null;
  const value = Number.parseInt(raw, 10);
  return Number.isNaN(value) || value < 0 ? null : value;
}

/** Null bytes or a heavy concentration of control characters mean binary. */
function hasBinaryContent(text: string): boolean {
  const sample = text.substring(0, 4096);
  let controlCount = 0;
  for (const char of sample) {
    const code = char.codePointAt(0)!;
    if (code === 0) return true; // null byte = definitely binary
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) controlCount++;
  }
  return controlCount > sample.length * 0.1; // >10% control chars = binary
}

function extensionOf(fileName: string): string {
  return fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
}

/** Open the OS file picker for a hidden input. The ref is null while the
 *  input for that mode is not mounted yet (double-clicking the mode tab). */
function openPicker(ref: React.RefObject<HTMLInputElement | null>) {
  ref.current?.click();
}

/** Reset a file input so picking the same file again still fires `change`.
 *  The ref is null whenever the form itself is unmounted (success panel). */
function clearFileInput(ref: React.RefObject<HTMLInputElement | null>) {
  if (ref.current) ref.current.value = "";
}

/** Trigger a browser download for an already-built blob. */
function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type UrlGetter = (long: string, short: string) => string | null;

interface CoreParams {
  inputMode?: InputMode;
  ttl?: number;
  compression?: CompressionMethod;
  iterations?: number;
}

/** Mode, expiry, compression and KDF strength, read straight off the URL. */
function readCoreParams(g: UrlGetter): CoreParams {
  const core: CoreParams = {};

  const mode = g("mode", "m");
  if (mode === "text" || mode === "file") core.inputMode = mode;

  const ttl = parseCount(g("ttl", "ttl"));
  if (ttl !== null) core.ttl = ttl;

  const comp = g("compression", "c");
  if (comp === "gzip" || comp === "deflate" || comp === "none") core.compression = comp;

  // A named security level wins over a raw iteration count.
  const sec = g("security", "s");
  if (sec && SECURITY_BY_NAME[sec]) {
    core.iterations = SECURITY_BY_NAME[sec];
    return core;
  }
  const iter = parseCount(g("iterations", "i"));
  if (iter !== null && iter > 0) core.iterations = iter;

  return core;
}

/** Advanced-panel params from the URL; `null` when none were supplied. */
function readAdvancedParams(g: UrlGetter): Partial<AdvancedState> | null {
  const patch: Partial<AdvancedState> = {};

  const pass2 = g("passphrase2", "p2");
  if (pass2) { patch.secondPassphrase = pass2; patch.dualKey = true; }
  const dual = g("dual", "d");
  if (dual === "1" || dual === "true") patch.dualKey = true;
  const rev = g("reveal", "r");
  if (rev) patch.revealKey = rev;
  const hintVal = g("hint", "h");
  if (hintVal) patch.hint = hintVal;
  const noteVal = g("note", "n");
  if (noteVal) patch.note = noteVal;
  const quest = g("question", "q");
  if (quest) patch.question = quest;
  const ans = g("answer", "a");
  if (ans) patch.questionAnswer = ans;
  const att = parseCount(g("attempts", "att"));
  if (att !== null) patch.maxAttempts = att;
  const ipsVal = g("ips", "ips");
  if (ipsVal) patch.allowedIpsInput = ipsVal;

  return Object.keys(patch).length > 0 ? patch : null;
}

// ─── Passphrase strength ───

const STRENGTH_LEVELS = [
  { min: 16, fill: "strength-strong", text: "text-primary", labelKey: "strength.strong" as TranslationKey },
  { min: 10, fill: "strength-good", text: "text-primary", labelKey: "strength.good" as TranslationKey },
  { min: 6, fill: "strength-fair", text: "theme-warning", labelKey: "strength.fair" as TranslationKey },
  { min: 0, fill: "strength-weak", text: "theme-danger", labelKey: "strength.weak" as TranslationKey },
];

function PassphraseStrength({ length }: Readonly<{ length: number }>) {
  const { t } = useLanguage();
  const level = STRENGTH_LEVELS.find((l) => length >= l.min)!;

  return (
    <div className="mt-2">
      <div className="strength-meter">
        <div className={`strength-meter-fill ${level.fill}`} />
      </div>
      <p className={`text-[10px] mt-1 ${level.text}`}>{t(level.labelKey)}</p>
    </div>
  );
}

// ─── Advanced options ───

/** Everything behind the "Advanced" disclosure. Kept in one object so the whole
 *  panel travels as a single prop instead of a dozen. */
interface AdvancedState {
  dualKey: boolean;
  secondPassphrase: string;
  revealKey: string;
  hint: string;
  note: string;
  question: string;
  questionAnswer: string;
  maxAttempts: number;
  allowedIpsInput: string;
}

const ADVANCED_DEFAULTS: AdvancedState = {
  dualKey: false,
  secondPassphrase: "",
  revealKey: "",
  hint: "",
  note: "",
  question: "",
  questionAnswer: "",
  maxAttempts: 0,
  allowedIpsInput: "",
};

interface AdvancedOptionsProps {
  open: boolean;
  advanced: AdvancedState;
  onChange: (patch: Partial<AdvancedState>) => void;
  iterations: number;
  onIterations: (v: number) => void;
  compression: CompressionMethod;
  onCompression: (v: CompressionMethod) => void;
  isZefer: boolean;
  keygenMode: Parameters<typeof KeyGenerator>[0]["savedMode"];
  keygenLength: number;
  onKeygenMode: (v: NonNullable<Parameters<typeof KeyGenerator>[0]["savedMode"]>) => void;
  onKeygenLength: (v: number) => void;
}

/** Warning about the detected IP, or the neutral disclaimer when none was run. */
function IpNotice({ result }: Readonly<{ result: IpDetectionResult | null }>) {
  const { t } = useLanguage();

  if (!result) return <p className="text-[10px] theme-faint mt-1">{t("advanced.ip.disclaimer")}</p>;

  if (result.vpnDetected) {
    return (
      <div className="flex items-start gap-1.5 mt-2 glass !rounded-lg px-3 py-2">
        <Shield className="w-3 h-3 theme-warning shrink-0 mt-0.5" />
        <p className="text-[10px] theme-warning">{t("advanced.ip.vpn")}</p>
      </div>
    );
  }

  if (result.inconsistent) {
    return (
      <div className="flex items-start gap-1.5 mt-2 glass !rounded-lg px-3 py-2">
        <AlertTriangle className="w-3 h-3 theme-warning shrink-0 mt-0.5" />
        <p className="text-[10px] theme-warning">{t("advanced.ip.inconsistent")} ({result.allIps.join(", ")})</p>
      </div>
    );
  }

  return <p className="text-[10px] text-primary mt-1">{t("advanced.ip.clean")}</p>;
}

function AdvancedOptions({
  open, advanced, onChange,
  iterations, onIterations,
  compression, onCompression,
  isZefer,
  keygenMode, keygenLength, onKeygenMode, onKeygenLength,
}: Readonly<AdvancedOptionsProps>) {
  const { t } = useLanguage();
  const [showSecondPass, setShowSecondPass] = useState(false);
  const [showRevealKey, setShowRevealKey] = useState(false);
  const [ipLoading, setIpLoading] = useState(false);
  const [ipResult, setIpResult] = useState<IpDetectionResult | null>(null);

  async function addMyIp() {
    setIpLoading(true);
    const result = await detectIp();
    setIpLoading(false);
    setIpResult(result);
    if (!result.ip) return;
    const current = advanced.allowedIpsInput;
    onChange({ allowedIpsInput: current ? `${current}, ${result.ip}` : result.ip });
  }

  return (
    <div id="advanced-options" className={`advanced-panel ${open ? "advanced-open" : ""} mb-4`}>
      <div>
      <div className="border-t border-[var(--border-subtle)] pt-4 space-y-4">
        {/* Security level */}
        <fieldset className="min-w-0">
          <legend className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
            <Gauge className="w-3 h-3" />{t("advanced.security")}
          </legend>
          <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-2">
            {SECURITY_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => onIterations(level.value)}
                aria-pressed={iterations === level.value}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border ${
                  iterations === level.value
                    ? "bg-[var(--primary)] text-[var(--btn-text)] border-transparent"
                    : "glass theme-muted hover:theme-text"
                }`}
              >
                {t(level.labelKey)}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Compression */}
        <fieldset className="min-w-0">
          <legend className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
            <Hash className="w-3 h-3" />{t("advanced.compression")}
            {isZefer && <span className="text-[9px] theme-warning ml-1">({t("form.zefer.compression.disabled")})</span>}
          </legend>
          <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-2">
            {COMPRESSION_OPTIONS.map((opt) => (
              <CompressionButton
                key={opt.value}
                labelKey={opt.labelKey}
                value={opt.value}
                active={compression === opt.value}
                locked={isZefer && opt.value !== "none"}
                onPick={onCompression}
              />
            ))}
          </div>
        </fieldset>

        {/* Dual key */}
        <div>
          <div className="mb-2">
            <Toggle
              checked={advanced.dualKey}
              onCheckedChange={(v) => onChange({ dualKey: v })}
              icon={KeyRound}
              label={t("advanced.dualkey")}
            />
          </div>
          {advanced.dualKey && (
            <div className="relative mt-2 has-toggle-wrap">
              <input id="encrypt-pass2" name="second-passphrase" autoComplete="new-password" type={showSecondPass ? "text" : "password"} value={advanced.secondPassphrase} onChange={(e) => onChange({ secondPassphrase: e.target.value })} placeholder={t("advanced.dualkey.placeholder")} className="w-full has-toggle font-mono text-sm" aria-label={t("advanced.dualkey")} />
              <button type="button" onClick={() => setShowSecondPass(!showSecondPass)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center theme-faint hover:theme-text transition-colors cursor-pointer" aria-label={showSecondPass ? t("aria.hidesecond") : t("aria.showsecond")}>
                {showSecondPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Reveal key */}
        <div>
          <label htmlFor="encrypt-reveal" className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
            <KeyRound className="w-3 h-3" />{t("advanced.revealkey")}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1 has-toggle-wrap">
              <input id="encrypt-reveal" name="reveal-key" autoComplete="new-password" type={showRevealKey ? "text" : "password"} value={advanced.revealKey} onChange={(e) => onChange({ revealKey: e.target.value })} placeholder={t("advanced.revealkey.placeholder")} className="w-full has-toggle font-mono text-sm" />
              <button type="button" onClick={() => setShowRevealKey(!showRevealKey)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center theme-faint hover:theme-text transition-colors cursor-pointer" aria-label={showRevealKey ? t("aria.hidereveal") : t("aria.showreveal")}>
                {showRevealKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <KeyGenerator onSelect={(v) => onChange({ revealKey: v })} savedMode={keygenMode} savedLength={keygenLength} onModeChange={onKeygenMode} onLengthChange={onKeygenLength} />
          </div>
          <p className="text-[10px] theme-faint mt-1">{t("advanced.revealkey.help")}</p>
        </div>

        {/* Max attempts */}
        <div>
          <GlassSelect
            value={advanced.maxAttempts}
            onChange={(v) => onChange({ maxAttempts: v as number })}
            label={t("advanced.attempts")}
            icon={Shield}
            options={[
              { label: t("advanced.attempts.unlimited"), value: 0 },
              { label: "3", value: 3 },
              { label: "5", value: 5 },
              { label: "10", value: 10 },
            ]}
          />
        </div>

        {/* Hint */}
        <div>
          <label htmlFor="encrypt-hint" className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
            <MessageSquare className="w-3 h-3" />{t("advanced.hint")}
          </label>
          <input id="encrypt-hint" name="hint" type="text" value={advanced.hint} onChange={(e) => onChange({ hint: e.target.value })} placeholder={t("advanced.hint.placeholder")} className="w-full text-sm" />
        </div>

        {/* Public note */}
        <div>
          <label htmlFor="encrypt-note" className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
            <MessageSquare className="w-3 h-3" />{t("advanced.note")}
          </label>
          <input id="encrypt-note" name="note" type="text" value={advanced.note} onChange={(e) => onChange({ note: e.target.value })} placeholder={t("advanced.note.placeholder")} className="w-full text-sm" />
        </div>

        {/* Secret question */}
        <div>
          <label htmlFor="encrypt-question" className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
            <HelpCircle className="w-3 h-3" />{t("advanced.question")}
          </label>
          <input id="encrypt-question" name="question" type="text" value={advanced.question} onChange={(e) => onChange({ question: e.target.value })} placeholder={t("advanced.question.placeholder")} className="w-full text-sm mb-2" />
          {advanced.question && (
            <input id="encrypt-answer" name="answer" type="text" value={advanced.questionAnswer} onChange={(e) => onChange({ questionAnswer: e.target.value })} placeholder={t("advanced.question.answer")} aria-label={t("advanced.question.answer")} className="w-full text-sm" />
          )}
        </div>

        {/* IP allowlist */}
        <div>
          <label htmlFor="allowed-ips" className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
            <Globe className="w-3 h-3" />{t("advanced.ip")}
          </label>
          <div className="flex flex-col min-[400px]:flex-row gap-2 mb-1">
            <input id="allowed-ips" name="allowed-ips" type="text" value={advanced.allowedIpsInput} onChange={(e) => onChange({ allowedIpsInput: e.target.value })} placeholder={t("advanced.ip.placeholder")} className="flex-1 text-sm font-mono" />
            <button
              type="button"
              disabled={ipLoading}
              onClick={addMyIp}
              className="px-3 py-2 rounded-lg text-[11px] font-medium theme-primary-faint theme-primary-border border text-primary hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
            >
              {ipLoading ? "..." : t("advanced.ip.addmine")}
            </button>
          </div>
          <p className="text-[10px] theme-faint mt-1">{t("advanced.ip.help")}</p>
          <IpNotice result={ipResult} />
        </div>
      </div>
      </div>
    </div>
  );
}

/** One compression choice. Locked (and visibly disabled) when the input is
 *  already a .zefer file, since re-compressing ciphertext gains nothing. */
function CompressionButton({
  labelKey, value, active, locked, onPick,
}: Readonly<{
  labelKey: TranslationKey;
  value: CompressionMethod;
  active: boolean;
  locked: boolean;
  onPick: (v: CompressionMethod) => void;
}>) {
  const { t } = useLanguage();
  let tone = "glass theme-muted hover:theme-text cursor-pointer";
  if (locked) tone = "glass theme-faint cursor-not-allowed opacity-50";
  else if (active) tone = "bg-[var(--primary)] text-[var(--btn-text)] border-transparent cursor-pointer";

  return (
    <button
      type="button"
      disabled={locked}
      aria-pressed={active}
      onClick={() => onPick(value)}
      className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 border ${tone}`}
    >
      {t(labelKey)}
    </button>
  );
}

// ─── Success panel ───

/** Post-encryption panel: download, native share and (for short-lived files)
 *  the decrypt link. It only ever renders after a user action, so the Web Share
 *  capability checks can be read straight from `navigator`. */
function EncryptSuccess({
  zeferFile,
  shareLink,
  onReset,
}: Readonly<{ zeferFile: File; shareLink: string | null; onReset: () => void }>) {
  const { t } = useLanguage();
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareTipOpen, setShareTipOpen] = useState(false);

  const canShareLink = typeof navigator.share === "function";
  const canShareFiles = typeof navigator.canShare === "function"
    && navigator.canShare({ files: [zeferFile] });

  // Bring the panel fully into view — the form is taller, so the viewport would
  // otherwise rest with the panel under the fixed navbar.
  useEffect(() => {
    document.getElementById("encrypt-success")!.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  async function shareFile() {
    // Only the file travels here — never the passphrase (different channel by design).
    // Several platforms accept files OR text, but reject files + title/text together,
    // so add the text only when canShare() confirms the exact payload is supported.
    const fileOnly: ShareData = { files: [zeferFile] };
    const withText: ShareData = {
      ...fileOnly,
      title: t("encrypt.success.file.share.title"),
      text: t("encrypt.success.file.share.text"),
    };
    try {
      await navigator.share(navigator.canShare(withText) ? withText : fileOnly);
    } catch {
      // User dismissed the native sheet or sharing failed — Download stays available
    }
  }

  async function shareTheLink(url: string) {
    try {
      await navigator.share({
        title: t("encrypt.success.link.share.title"),
        text: t("encrypt.success.link.share.text"),
        url,
      });
    } catch {
      // User dismissed the native sheet or sharing failed — copy stays available
    }
  }

  return (
    <div id="encrypt-success" className="glass glow-green p-6 sm:p-8 animate-in stagger-children scroll-mt-28">
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
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => downloadBlob(zeferFile, zeferFile.name)}
            className="flex-1 flex items-center justify-center gap-2 glass px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors text-xs font-medium theme-heading"
            aria-label={t("aria.downloadfile")}
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            {t("encrypt.success.file.download")}
          </button>
          {canShareFiles ? (
            <button
              type="button"
              onClick={shareFile}
              className="flex-1 flex items-center justify-center gap-2 glass px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors text-xs font-medium theme-heading"
              aria-label={t("aria.sharefile")}
            >
              <Share2 className="w-3.5 h-3.5 text-primary" />
              {t("encrypt.success.file.send")}
            </button>
          ) : (
            <Tooltip.Provider delayDuration={150}>
              <Tooltip.Root open={shareTipOpen} onOpenChange={setShareTipOpen}>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    aria-disabled="true"
                    onPointerDown={(e) => { e.preventDefault(); setShareTipOpen((o) => !o); }}
                    className="flex-1 flex items-center justify-center gap-2 glass px-3 py-2.5 rounded-lg cursor-help opacity-50 transition-colors text-xs font-medium theme-heading"
                    aria-label={t("encrypt.success.file.unsupported")}
                  >
                    <Share2 className="w-3.5 h-3.5 theme-faint" />
                    {t("encrypt.success.file.send")}
                  </button>
                </Tooltip.Trigger>
                <TipBubble align="end">{t("encrypt.success.file.unsupported")}</TipBubble>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>
      </div>

      {(canShareFiles || shareLink) && (
        <div className="glass !rounded-xl p-4 mb-5 theme-warning-faint">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 theme-warning shrink-0 mt-0.5" />
            <p className="text-[12px] theme-muted leading-relaxed">{t("encrypt.success.separate")}</p>
          </div>
        </div>
      )}

      {shareLink && (
        <div className="glass !rounded-xl p-4 mb-5 animate-in">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs font-medium theme-heading">{t("encrypt.success.link.title")}</p>
          </div>
          <p className="text-[11px] theme-muted mb-3">{t("encrypt.success.link.desc")}</p>
          <div className="flex gap-2">
            <code className="flex-1 text-[11px] font-mono text-primary theme-primary-faint rounded-lg px-3 py-2 overflow-x-auto whitespace-nowrap">{shareLink}</code>
            {canShareLink && (
              <button
                type="button"
                onClick={() => shareTheLink(shareLink)}
                className="shrink-0 glass px-3 py-2 rounded-lg cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors"
                aria-label={t("aria.sharelink")}
              >
                <Share2 className="w-3.5 h-3.5 theme-muted" />
              </button>
            )}
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(shareLink); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}
              className="shrink-0 glass px-3 py-2 rounded-lg cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors"
              aria-label={t("aria.copylink")}
            >
              {linkCopied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 theme-muted" />}
            </button>
          </div>
        </div>
      )}

      <button onClick={onReset} className="btn-primary">{t("encrypt.another")}</button>
    </div>
  );
}

// ─── Form ───

export default function EncryptForm() {
  const { t } = useLanguage();

  // Persisted preferences
  const {
    ttl, setTtl,
    iterations, setIterations,
    compression, setCompression,
    inputMode, setInputMode,
    keygenMode, keygenLength,
    setKeygenMode, setKeygenLength,
  } = usePreferences();

  // Text mode
  const [content, setContent] = useState("");
  const [textFileName, setTextFileName] = useState<string | null>(null);
  const textFileRef = useRef<HTMLInputElement>(null);

  // File mode — keep the File reference (streamed in slices at encrypt time)
  // instead of reading the whole thing into an ArrayBuffer up front.
  const [fileData, setFileData] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Shared
  const [passphrase, setPassphrase] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isZefer, setIsZefer] = useState(false);

  const limits = useSyncExternalStore(subscribeDevice, getDeviceSnapshot, getServerDeviceSnapshot);

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advanced, setAdvanced] = useState<AdvancedState>(ADVANCED_DEFAULTS);
  const patchAdvanced = (patch: Partial<AdvancedState>) =>
    setAdvanced((prev) => ({ ...prev, ...patch }));

  // State — a non-null `progress` IS the in-flight state, so there is no
  // separate `loading` flag: the form is swapped for the progress panel.
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  // The encrypted .zefer kept in memory so it can be shared as a file after
  // the automatic download. It is ciphertext, never a secret, so holding it
  // is safe — and it is deliberately separate from the passphrase channel.
  const [zeferFile, setZeferFile] = useState<File | null>(null);

  // URL params (long and short aliases). Applied EXACTLY ONCE: the setters from
  // usePreferences() are fresh on every render, so a re-run would keep
  // re-asserting the URL values over any later user change.
  const searchParams = useUrlParams();
  const paramsApplied = useRef(false);
  useEffect(() => {
    if (!searchParams || paramsApplied.current) return;
    paramsApplied.current = true;
    const urlTab = searchParams.get("tab") || searchParams.get("t");
    if (urlTab === "decrypt") return;
    const g = (long: string, short: string) => searchParams.get(long) ?? searchParams.get(short) ?? null;

    const core = readCoreParams(g);
    if (core.inputMode) setInputMode(core.inputMode);
    if (core.ttl !== undefined) setTtl(core.ttl);
    if (core.compression) setCompression(core.compression);
    if (core.iterations !== undefined) setIterations(core.iterations);

    const pass = g("passphrase", "p");
    if (pass) setPassphrase(pass);

    const advancedPatch = readAdvancedParams(g);
    if (advancedPatch) {
      setAdvanced((prev) => ({ ...prev, ...advancedPatch }));
      setShowAdvanced(true);
    }

    const sensitive = [pass, g("passphrase2", "p2"), g("reveal", "r"), g("answer", "a")];
    if (sensitive.some(Boolean)) window.history.replaceState({}, "", window.location.pathname);
  }, [searchParams, setInputMode, setTtl, setIterations, setCompression]);

  // Text mode: STRICTLY .txt / .env only
  async function handleTextFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reject = (key: TranslationKey) => {
      setError(t(key));
      // Reset the input so the same file can't be re-selected
      clearFileInput(textFileRef);
    };

    // Strict extension check
    if (!TEXT_EXTENSIONS.has(extensionOf(file.name))) return reject("form.error.file.type");

    // Strict MIME type check (browsers report these for text files)
    const validMimes = ["text/plain", "application/x-env", "application/octet-stream", ""];
    if (file.type && !validMimes.includes(file.type)) return reject("form.error.file.type");

    if (file.size > TEXT_MAX) return reject("form.error.file.size");

    setError(null);
    const text = await file.text();

    // Final check: reject binary content
    if (hasBinaryContent(text)) return reject("form.error.binary");

    setContent(text);
    setTextFileName(file.name);
  }

  function clearTextFile() {
    setTextFileName(null); setContent("");
    clearFileInput(textFileRef);
  }

  // File mode: any file EXCEPT .txt and .env (those must use text mode)
  function processFile(file: File) {
    const ext = extensionOf(file.name);
    if (TEXT_EXTENSIONS.has(ext)) {
      setError(t("form.error.file.usetext"));
      clearFileInput(fileRef);
      return;
    }

    if (file.size > limits.maxFileSize) {
      setError(`${t("form.error.file.max")} ${limits.maxFileSizeLabel}`);
      clearFileInput(fileRef);
      return;
    }

    // Detect .zefer files — disable compression, warn user
    const nested = ext === ".zefer";
    setIsZefer(nested);
    if (nested) {
      setCompression("none");
      notifyWarning(t("toast.zefer.detected"), t("toast.zefer.detected.desc"));
    }

    setError(null);
    // Keep the File reference — it is read in 16 MB slices during encryption,
    // so large files are never loaded into a single buffer up front.
    setFileData(file);
    setFileName(file.name);
  }

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

  function clearFile() {
    setFileData(null); setFileName(null);
    setIsZefer(false);
    clearFileInput(fileRef);
  }

  /** All the client-side guards before a single byte is derived. Returns the
   *  message to show, or null when the form is good to submit. */
  function validationError(): TranslationKey | null {
    if (inputMode === "text" && !content.trim()) return "form.error.empty";
    if (inputMode === "text" && hasBinaryContent(content)) return "form.error.binary";
    if (inputMode === "file" && !fileData) return "form.error.nofile";
    if (!passphrase || passphrase.length < 6) return "form.error.passphrase";
    if (advanced.dualKey && advanced.secondPassphrase.length < 6) return "form.error.passphrase2";
    if (advanced.revealKey && advanced.revealKey.length < 6) return "form.error.revealkey";
    if (advanced.revealKey && advanced.revealKey === passphrase) return "form.error.revealkey.same";
    if (advanced.question && !advanced.questionAnswer) return "form.error.noanswer";
    return null;
  }

  /** Decrypt link carrying the key, only for files that expire within a week. */
  function buildShareLink(): string | null {
    if (ttl <= 0 || ttl > 10080) return null;
    const linkPass = advanced.revealKey || passphrase;
    const params = new URLSearchParams({ t: "decrypt", p: linkPass });
    if (!advanced.revealKey && advanced.dualKey && advanced.secondPassphrase) {
      params.set("p2", advanced.secondPassphrase);
    }
    return `${window.location.origin}/?${params.toString()}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const invalid = validationError();
    if (invalid) { setError(t(invalid)); return; }

    const tracker = createEncryptTracker(setProgress);

    try {
      tracker.compressing(0);
      await new Promise((r) => requestAnimationFrame(r));

      const zefer = await encodeZefer({
        content: inputMode === "text" ? content : undefined,
        fileBlob: inputMode === "file" ? fileData! : undefined,
        passphrase,
        secondPassphrase: advanced.dualKey ? advanced.secondPassphrase : undefined,
        fileName: inputMode === "file" ? fileName : textFileName,
        fileType: inputMode === "file" ? fileData!.type || "application/octet-stream" : undefined,
        expiresAt: ttl > 0 ? Date.now() + ttl * 60 * 1000 : 0,
        hint: advanced.hint || undefined,
        note: advanced.note || undefined,
        question: advanced.question || undefined,
        questionAnswer: advanced.questionAnswer || undefined,
        maxAttempts: advanced.maxAttempts,
        iterations,
        dualKey: advanced.dualKey,
        compression,
        allowedIps: parseIpList(advanced.allowedIpsInput),
        revealKey: advanced.revealKey.trim() || undefined,
        onProgress: tracker,
      });

      tracker.packaging();

      const baseName = (inputMode === "file" ? fileName : textFileName)?.replace(/\.[^.]+$/, "") || "secret";
      const zeferName = `${baseName}.zefer`;
      downloadBlob(zefer, zeferName);

      // Keep the encrypted file so it can be shared natively (e.g. WhatsApp,
      // Telegram, Slack, email) through the OS share sheet — separate from the key.
      setZeferFile(new File([zefer], zeferName, { type: "application/octet-stream" }));

      tracker.done();
      await new Promise((r) => setTimeout(r, 500));

      setShareLink(buildShareLink());

      // Clear secrets from memory immediately after successful encryption
      setPassphrase("");
      patchAdvanced({ secondPassphrase: "", revealKey: "", questionAnswer: "" });

      setDone(true);
      notifySuccess(t("toast.encrypt.success"), t("toast.encrypt.success.desc"));
    } catch {
      setError(t("form.error.generic"));
      notifyError(t("toast.error.generic"));
    } finally {
      setProgress(null);
    }
  }

  function reset() {
    setContent(""); setPassphrase("");
    setTextFileName(null); setFileName(null); setFileData(null);
    setIsZefer(false);
    setError(null); setDone(false); setShareLink(null); setZeferFile(null);
    setAdvanced(ADVANCED_DEFAULTS);
    clearFileInput(textFileRef);
    clearFileInput(fileRef);
  }

  // ─── Progress ───
  if (progress) {
    return <CryptoProgress state={progress} mode="encrypt" />;
  }

  // ─── Success ───
  if (done) {
    return <EncryptSuccess zeferFile={zeferFile!} shareLink={shareLink} onReset={reset} />;
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
          <button type="button" onClick={() => setInputMode("text")} aria-pressed={inputMode === "text"} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium chip-select cursor-pointer ${inputMode === "text" ? "bg-[var(--primary)] text-[var(--btn-text)]" : "theme-muted hover:theme-text"}`}>
            <FileText className="w-3 h-3" />{t("mode.text")}
          </button>
          <button type="button" onClick={() => setInputMode("file")} onDoubleClick={() => { setInputMode("file"); openPicker(fileRef); }} aria-pressed={inputMode === "file"} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium chip-select cursor-pointer ${inputMode === "file" ? "bg-[var(--primary)] text-[var(--btn-text)]" : "theme-muted hover:theme-text"}`}>
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
                    <button type="button" onClick={clearTextFile} className="w-6 h-6 flex items-center justify-center hover:theme-heading cursor-pointer rounded" aria-label={t("aria.removefile")}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button type="button" onClick={() => openPicker(textFileRef)} className="flex items-center gap-1 text-[11px] theme-faint hover:text-primary transition-colors duration-200 cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--glass-bg)]">
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium theme-text block">{t("mode.file.label")}</label>
              {fileData && (
                <button type="button" onClick={clearFile} className="w-9 h-9 flex items-center justify-center rounded-lg theme-faint hover:theme-danger transition-colors cursor-pointer" aria-label={t("aria.removefile")}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Dropzone — a real <button>, so Enter and Space both activate it */}
            <button
              type="button"
              onClick={() => openPicker(fileRef)}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              aria-label={t("mode.file.placeholder")}
              className={`w-full !rounded-xl p-8 sm:p-10 flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 dropzone-pulse ${isDragging ? "dropzone-active" : ""}`}
            >
              {fileData ? (
                <span className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-left">
                    <span className="block text-sm font-medium text-primary">{fileName}</span>
                    <span className="block text-[10px] theme-muted">{fileData.type || "application/octet-stream"} &middot; {formatBytes(fileData.size)}</span>
                  </span>
                </span>
              ) : (
                <>
                  <Upload className="w-5 h-5 theme-faint" />
                  <span className="text-xs theme-muted">{t("mode.file.placeholder")}</span>
                  <span className="text-[10px] theme-faint">{t("mode.file.limit")} {limits.maxFileSizeLabel}</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" onChange={handleFileUpload} className="hidden" />

            {/* .zefer double-encryption warning */}
            {isZefer && (
              <div role="alert" className="glass !rounded-xl p-4 mt-3 flex items-start gap-3 theme-warning-faint animate-in">
                <AlertTriangle className="w-4 h-4 theme-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium theme-warning mb-1">{t("form.zefer.warning.title")}</p>
                  <p className="text-[11px] theme-muted leading-relaxed">{t("form.zefer.warning.desc")}</p>
                </div>
              </div>
            )}

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
              <div className="relative flex-1 has-toggle-wrap">
                <input id="passphrase" name="passphrase" autoComplete="new-password" type={showPass ? "text" : "password"} value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder={t("form.passphrase.placeholder")} className="w-full has-toggle font-mono text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center theme-faint hover:theme-text transition-colors cursor-pointer" aria-label={showPass ? t("aria.hidepass") : t("aria.showpass")}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <KeyGenerator onSelect={setPassphrase} savedMode={keygenMode} savedLength={keygenLength} onModeChange={setKeygenMode} onLengthChange={setKeygenLength} />
            </div>
            {passphrase.length > 0 && <PassphraseStrength length={passphrase.length} />}
          </div>
          <GlassSelect
            value={ttl}
            onChange={(v) => setTtl(v as number)}
            options={TTL_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))}
            label={t("form.expires")}
            icon={Clock}
          />
        </div>

        {ttl === 0 && (
          <div className="flex items-start gap-2.5 mb-4 p-3 rounded-xl theme-warning-faint animate-in">
            <AlertTriangle className="w-4 h-4 theme-warning shrink-0 mt-0.5" />
            <p className="text-[11px] theme-warning leading-relaxed">{t("ttl.never.warning")}</p>
          </div>
        )}

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between py-2.5 px-3 mb-4 rounded-xl text-xs theme-muted hover:theme-text hover:bg-[var(--glass-bg)] transition-colors duration-200 cursor-pointer"
          aria-expanded={showAdvanced}
          aria-controls="advanced-options"
        >
          <span className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            {t("advanced.title")}
          </span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <AdvancedOptions
          open={showAdvanced}
          advanced={advanced}
          onChange={patchAdvanced}
          iterations={iterations}
          onIterations={setIterations}
          compression={compression}
          onCompression={setCompression}
          isZefer={isZefer}
          keygenMode={keygenMode}
          keygenLength={keygenLength}
          onKeygenMode={setKeygenMode}
          onKeygenLength={setKeygenLength}
        />

        {/* Error */}
        {error && (
          <div role="alert" aria-live="assertive" className="flex items-center gap-2 theme-danger text-sm mb-4 theme-danger-faint theme-danger-border border rounded-xl px-3.5 py-2.5 error-shake">
            <AlertTriangle className="w-4 h-4 shrink-0" /><span className="text-xs">{error}</span>
          </div>
        )}

        {/* Submit */}
        <button type="submit" className="btn-primary">
          <Lock className="w-4 h-4" /> {t("encrypt.submit")}
        </button>

        <p className="text-[10px] theme-faint text-center mt-4 leading-relaxed max-w-sm mx-auto">{t("form.security.note")}</p>
      </div>
    </form>
  );
}

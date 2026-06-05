"use client";

import { useEffect, useMemo, useState } from "react";
import {
  KeyRound, Copy, Check, RefreshCw, Download, Hash, Eye, EyeOff,
  ShieldCheck, AlertTriangle, Gauge, Layers, ScanSearch, Shield,
  ChevronUp, ChevronDown, Ban, SquareAsterisk, X, Atom, User, Crosshair,
} from "lucide-react";
import { PageLayout, PageHeader, InfoTip } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";
import { notifySuccess } from "@/app/lib/notify";
import { usePreferences } from "@/app/lib/preferences";
import type { TranslationKey } from "@/app/lib/i18n";
import {
  MODES, charsetFor, generateWithOptions, analyzePassword,
  toSuperscript, ATTACK_SCENARIOS, crackBucketFor, complianceOf,
  keyspaceExponent, AVERAGE_HUMAN_BITS,
  type PasswordAnalysis, type PasswordWarning,
} from "@/app/lib/passwords";

// Same presets as the home KeyGenerator, plus shorter passphrase sizes
const LENGTHS = [16, 32, 64, 128, 256, 512, 1024];
const COUNTS = [1, 5, 10, 25, 50];

const MAX_LENGTH = 2048;
const MAX_COUNT = 50;

const clampLength = (n: number) => Math.min(MAX_LENGTH, Math.max(1, Math.floor(n)));
const clampCount = (n: number) => Math.min(MAX_COUNT, Math.max(1, Math.floor(n)));

/** Range slider over discrete stops with dot markers centered on each thumb position.
 *  The thumb is 20px wide, so its center travels from 10px to (100% - 10px) —
 *  each marker is absolutely positioned on that exact path. */
function StopSlider({
  id, stops, value, onPick, ariaLabel,
}: {
  id: string;
  stops: number[];
  value: number;
  onPick: (stop: number) => void;
  ariaLabel: string;
}) {
  let nearest = 0;
  for (let i = 1; i < stops.length; i++) {
    if (Math.abs(stops[i] - value) < Math.abs(stops[nearest] - value)) nearest = i;
  }
  return (
    <div className="flex-1 min-w-0">
      <input
        id={id}
        type="range"
        min={0}
        max={stops.length - 1}
        step={1}
        value={nearest}
        onChange={(e) => onPick(stops[Number(e.target.value)])}
        aria-label={ariaLabel}
        aria-valuetext={`${stops[nearest]}`}
        className="range-slider"
      />
      <div className="relative h-8 -mt-1.5">
        {stops.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            aria-pressed={value === s}
            aria-label={`${ariaLabel}: ${s}`}
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer group py-0.5"
            style={{ left: `calc(10px + (100% - 20px) * ${stops.length > 1 ? i / (stops.length - 1) : 0})` }}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                value === s ? "bg-primary" : "bg-[var(--glass-border)] group-hover:bg-[var(--muted)]"
              }`}
              aria-hidden="true"
            />
            <span
              className={`text-[9px] font-mono leading-none transition-colors ${
                value === s ? "text-primary font-semibold" : "theme-faint group-hover:theme-muted"
              }`}
            >
              {s}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

const WARNING_KEYS: Record<PasswordWarning, string> = {
  tooShort: "gen.warn.tooShort",
  common: "gen.warn.common",
  onlyDigits: "gen.warn.onlyDigits",
  onlyLetters: "gen.warn.onlyLetters",
  repeats: "gen.warn.repeats",
  sequence: "gen.warn.sequence",
  keyboard: "gen.warn.keyboard",
  datelike: "gen.warn.datelike",
  lowVariety: "gen.warn.lowVariety",
};

const SCORE_FILL = ["strength-weak", "strength-weak", "strength-fair", "strength-good", "strength-strong"] as const;
const SCORE_TEXT = ["theme-danger", "theme-danger", "theme-warning", "text-primary", "text-primary"] as const;

type TFn = (key: TranslationKey) => string;

// Log-space computation: never shows "Infinity" even for multi-thousand-bit keys
function formatCrack(bits: number, gps: number, t: TFn): string {
  const { bucket, value } = crackBucketFor(bits, gps);
  if (bucket === "instant") return t("time.instant");
  if (bucket === "yearsExp") return `≈10${toSuperscript(value)} ${t("time.years")}`;
  return `${value.toLocaleString()} ${t(`time.${bucket}` as TranslationKey)}`;
}

const FRAME_TIPS: Record<string, TranslationKey> = {
  nist: "tip.nist",
  owasp: "tip.owasp",
  longterm: "tip.longterm",
  aes128: "tip.aes128",
  quantum: "tip.quantum",
};

const FRAME_LABELS: Record<string, TranslationKey> = {
  nist: "gen.frame.nist",
  owasp: "gen.frame.owasp",
  longterm: "gen.frame.longterm",
  aes128: "gen.frame.aes128",
  quantum: "gen.frame.quantum",
};

const SCENARIO_LABELS: Record<string, TranslationKey> = {
  online: "gen.scen.online",
  cloud: "gen.scen.cloud",
  gpu: "gen.scen.gpu",
  nation: "gen.scen.nation",
};

/** Full security report: attack scenarios, framework compliance,
 *  post-quantum entropy, keyspace and average-password comparison. */
function SecurityInsights({ bits, length, subjectKey }: { bits: number; length: number; subjectKey: TranslationKey }) {
  const { t } = useLanguage();
  const checks = complianceOf(bits, length);
  const quantumBits = Math.floor(bits / 2);
  const ksExp = keyspaceExponent(bits);
  const advantageExp = Math.floor((bits - AVERAGE_HUMAN_BITS) * Math.log10(2));
  const maxBits = Math.max(bits, AVERAGE_HUMAN_BITS);
  const humanPct = Math.max(4, Math.round((AVERAGE_HUMAN_BITS / maxBits) * 100));
  const subjectPct = Math.max(4, Math.round((bits / maxBits) * 100));

  return (
    <div className="space-y-4">
      {/* Attack scenarios */}
      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
          <Crosshair className="w-3 h-3" />{t("gen.scen.title")}
          <InfoTip tipKey="tip.scenarios" />
        </p>
        <div className="grid grid-cols-1 min-[440px]:grid-cols-2 lg:grid-cols-4 gap-2">
          {ATTACK_SCENARIOS.map((s) => (
            <div key={s.key} className="glass !rounded-lg px-3 py-2.5">
              <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5 leading-snug whitespace-nowrap truncate">
                {t(SCENARIO_LABELS[s.key])}
              </p>
              <p className="text-[9px] theme-faint font-mono mb-1">{s.expLabel} {t("gen.scen.guesses")}</p>
              <p className="text-[13px] font-mono text-primary leading-tight">{formatCrack(bits, s.gps, t)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Framework compliance */}
      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium theme-text mb-1">
          <ShieldCheck className="w-3 h-3" />{t("gen.frame.title")}
        </p>
        <p className="text-[10px] theme-faint mb-2">{t("gen.frame.desc")}</p>
        <ul className="space-y-1.5 mb-2">
          {checks.map((c) => (
            <li key={c.key} className="glass !rounded-lg px-3 py-2 flex items-center gap-2.5">
              {c.pass ? (
                <Check className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
              ) : (
                <X className="w-3.5 h-3.5 theme-warning shrink-0" aria-hidden="true" />
              )}
              <span className="text-[11px] theme-text flex-1 leading-snug">
                {t(FRAME_LABELS[c.key])}{" "}
                <InfoTip tipKey={FRAME_TIPS[c.key]} />
              </span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                c.pass ? "theme-primary-faint theme-primary-border text-primary" : "theme-warning-faint theme-warning"
              }`}>
                {c.pass ? t("gen.frame.pass") : t("gen.frame.fail")}
              </span>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-2">
          <div className="glass !rounded-lg px-3 py-2.5">
            <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Hash className="w-2.5 h-2.5" />{t("gen.frame.keyspace")}
              <InfoTip tipKey="tip.keyspace" align="left" />
            </p>
            <p className="text-sm font-mono theme-heading">≈10{toSuperscript(ksExp)}</p>
          </div>
          <div className="glass !rounded-lg px-3 py-2.5">
            <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Atom className="w-2.5 h-2.5" />{t("gen.frame.quantumbits")}
              <InfoTip tipKey="tip.quantumbits" align="right" />
            </p>
            <p className="text-sm font-mono theme-heading">{quantumBits} <span className="text-[10px] theme-muted">{t("gen.metric.bits")}</span></p>
          </div>
        </div>
      </div>

      {/* Versus an average human password */}
      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
          <User className="w-3 h-3" />{t("gen.avg.title")}
          <InfoTip tipKey="tip.avg" />
        </p>
        <div className="glass !rounded-lg px-3 py-3 space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] theme-muted">{t("gen.avg.human")}</span>
              <span className="text-[10px] font-mono theme-faint">{AVERAGE_HUMAN_BITS} {t("gen.metric.bits")}</span>
            </div>
            <div className="strength-meter !mt-0">
              <div className="strength-meter-fill strength-fair !w-[var(--cmp)]" style={{ "--cmp": `${humanPct}%` } as React.CSSProperties} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] theme-text font-medium">{t(subjectKey)}</span>
              <span className="text-[10px] font-mono text-primary">{bits.toLocaleString()} {t("gen.metric.bits")}</span>
            </div>
            <div className="strength-meter !mt-0">
              <div className="strength-meter-fill strength-strong !w-[var(--cmp)]" style={{ "--cmp": `${subjectPct}%` } as React.CSSProperties} />
            </div>
          </div>
          <p className={`text-[11px] leading-snug ${advantageExp > 0 ? "text-primary" : "theme-warning"}`}>
            {advantageExp > 0
              ? <>≈10{toSuperscript(advantageExp)} {t("gen.avg.times")}</>
              : t("gen.avg.weaker")}
          </p>
        </div>
      </div>
    </div>
  );
}

interface GeneratedKey {
  value: string;
  analysis: PasswordAnalysis;
}

export default function GeneratorContent() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"generate" | "analyze">("generate");

  // ── Generator state — same persisted preferences the home KeyGenerator uses ──
  const {
    keygenMode: mode, keygenLength: length, keygenCount: count, keygenAdvanced: adv,
    setKeygenMode: setMode, setKeygenLength: setLength, setKeygenCount: setCount, setKeygenAdvanced: setAdv,
  } = usePreferences();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [keys, setKeys] = useState<GeneratedKey[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [genTick, setGenTick] = useState(0);

  // Free-typing buffers for the custom inputs, synced from persisted values
  const [lengthInput, setLengthInput] = useState(String(length));
  const [countInput, setCountInput] = useState(String(count));
  useEffect(() => setLengthInput(String(length)), [length]);
  useEffect(() => setCountInput(String(count)), [count]);

  // Migrate previously-persisted quantities above the new 50 cap
  useEffect(() => { if (count > MAX_COUNT) setCount(MAX_COUNT); }, [count, setCount]);

  // ── Analyzer state ──
  const [candidate, setCandidate] = useState("");
  const [showCandidate, setShowCandidate] = useState(false);
  const analysis = useMemo(() => analyzePassword(candidate), [candidate]);

  const isUuid = mode === "uuid";
  // Pool and entropy reflect the active exclusions
  const poolSize = isUuid ? 16 : Math.max(charsetFor(mode, adv).length, 2);
  const bits = isUuid ? 122 : Math.floor(Math.log2(poolSize) * length);
  const supportsClasses = ["secure", "unicode", "alpha", "base58"].includes(mode);

  function commitLength(raw: string) {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) setLength(clampLength(n));
  }

  function commitCount(raw: string) {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) setCount(clampCount(n));
  }

  function generate() {
    const safeCount = clampCount(count);
    const safeLength = clampLength(length);
    const generated: GeneratedKey[] = Array.from({ length: safeCount }, () => {
      const value = generateWithOptions(mode, safeLength, adv);
      return { value, analysis: analyzePassword(value) };
    }).sort((a, b) =>
      b.analysis.score - a.analysis.score || b.analysis.effectiveBits - a.analysis.effectiveBits
    );
    setKeys(generated);
    setCopiedIdx(null);
    setGenTick((k) => k + 1);
  }

  async function copyOne(value: string, idx: number) {
    await navigator.clipboard.writeText(value);
    setCopiedIdx(idx);
    notifySuccess(t("toast.gen.copied"));
    setTimeout(() => setCopiedIdx((c) => (c === idx ? null : c)), 1500);
  }

  async function copyAll() {
    await navigator.clipboard.writeText(keys.map((k) => k.value).join("\n"));
    notifySuccess(t("toast.gen.copiedall"));
  }

  function downloadTxt() {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
    const blob = new Blob([keys.map((k) => k.value).join("\n") + "\n"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zefer-keys-${stamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    notifySuccess(t("toast.gen.downloaded"));
  }

  const classChips = (Object.entries(analysis.classes) as [keyof typeof analysis.classes, boolean][]);

  return (
    <PageLayout>
      <PageHeader
        icon={KeyRound}
        badge={t("gen.badge")}
        title={t("gen.title")}
        subtitle={t("gen.subtitle")}
      />

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 mb-6 glass !rounded-lg p-0.5" role="tablist" aria-label={t("gen.title")}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "generate"}
          onClick={() => setTab("generate")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-medium chip-select cursor-pointer ${
            tab === "generate" ? "bg-[var(--primary)] text-[var(--btn-text)]" : "theme-muted hover:theme-text"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />{t("gen.tab.generate")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "analyze"}
          onClick={() => setTab("analyze")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-medium chip-select cursor-pointer ${
            tab === "analyze" ? "bg-[var(--primary)] text-[var(--btn-text)]" : "theme-muted hover:theme-text"
          }`}
        >
          <ScanSearch className="w-3.5 h-3.5" />{t("gen.tab.analyze")}
        </button>
      </div>

      {/* ─── Generator tab ─── */}
      {tab === "generate" && (
        <div className="glass glow-green-sm p-6 sm:p-8 animate-in">
          {/* Mode: all types on a single horizontal row */}
          <div className="mb-4">
            <p className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
              <ShieldCheck className="w-3 h-3" />{t("gen.mode")}
            </p>
            <div className="flex gap-0.5 glass !rounded-lg p-0.5" role="group" aria-label={t("gen.mode")}>
              {MODES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMode(m.key)}
                  aria-pressed={mode === m.key}
                  className={`flex-1 min-w-0 py-2 px-0.5 text-[9px] sm:text-[11px] font-medium rounded-md chip-select cursor-pointer truncate ${
                    mode === m.key ? "bg-[var(--primary)] text-[var(--btn-text)]" : "theme-muted hover:theme-text"
                  }`}
                >
                  {t(m.labelKey as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>
          </div>

          {/* Length: slider over the preset stops + manual input (max 2048) */}
          {!isUuid && (
            <div className="mb-4">
              <label htmlFor="gen-length-slider" className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                <Hash className="w-3 h-3" />{t("keygen.length")}
              </label>
              <div className="flex items-start gap-3">
                <StopSlider
                  id="gen-length-slider"
                  stops={LENGTHS}
                  value={length}
                  onPick={setLength}
                  ariaLabel={t("keygen.length")}
                />
                <input
                  id="gen-length"
                  name="gen-length"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_LENGTH}
                  value={lengthInput}
                  onChange={(e) => { setLengthInput(e.target.value); commitLength(e.target.value); }}
                  onBlur={() => setLengthInput(String(length))}
                  aria-label={t("gen.custom.length")}
                  title={t("gen.custom.length")}
                  className={`w-[4.5rem] shrink-0 !py-2 !px-2 text-center !rounded-md text-[11px] font-mono font-medium ${
                    !LENGTHS.includes(length) ? "theme-primary-border text-primary" : ""
                  }`}
                />
              </div>
            </div>
          )}

          {/* Advanced options — same collapsible pattern as the home encrypt form */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between py-2.5 px-3 mb-4 rounded-xl text-xs theme-muted hover:theme-text hover:bg-[var(--glass-bg)] transition-colors duration-200 cursor-pointer"
            aria-expanded={showAdvanced}
            aria-controls="gen-advanced"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              {t("advanced.title")}
            </span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div id="gen-advanced" className={`advanced-panel ${showAdvanced ? "advanced-open" : ""} mb-4`}>
            <div>
              <div className="border-t border-[var(--border-subtle)] pt-4 space-y-4">
                {/* Quantity: slider over preset stops + manual input (1–50, default 1) */}
                <div>
                  <label htmlFor="gen-count-slider" className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                    <Layers className="w-3 h-3" />{t("gen.count")}
                  </label>
                  <div className="flex items-start gap-3">
                    <StopSlider
                      id="gen-count-slider"
                      stops={COUNTS}
                      value={count}
                      onPick={setCount}
                      ariaLabel={t("gen.count")}
                    />
                    <input
                      id="gen-count"
                      name="gen-count"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={MAX_COUNT}
                      value={countInput}
                      onChange={(e) => { setCountInput(e.target.value); commitCount(e.target.value); }}
                      onBlur={() => setCountInput(String(count))}
                      aria-label={t("gen.custom.count")}
                      title={t("gen.custom.count")}
                      className={`w-[4.5rem] shrink-0 !py-2 !px-2 text-center !rounded-md text-[11px] font-mono font-medium ${
                        !COUNTS.includes(count) ? "theme-primary-border text-primary" : ""
                      }`}
                    />
                  </div>
                </div>

                {!isUuid && (
                  <>
                    {/* Exclude ambiguous */}
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer group w-fit">
                        <div className="relative">
                          <input type="checkbox" checked={!!adv.excludeAmbiguous} onChange={(e) => setAdv({ excludeAmbiguous: e.target.checked })} className="sr-only peer" />
                          <div className="w-9 h-5 toggle-track rounded-full peer-checked:toggle-track-checked transition-colors duration-200" />
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 toggle-knob rounded-full peer-checked:translate-x-4 peer-checked:toggle-knob-checked transition-all duration-200" />
                        </div>
                        <span className="flex items-center gap-1.5 text-xs theme-muted group-hover:theme-text transition-colors">
                          <Ban className="w-3.5 h-3.5" />{t("gen.adv.ambiguous")}
                        </span>
                      </label>
                      <p className="text-[10px] theme-faint mt-1 ml-12">{t("gen.adv.ambiguous.help")}</p>
                    </div>

                    {/* Require all classes */}
                    {supportsClasses && (
                      <div>
                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                          <div className="relative">
                            <input type="checkbox" checked={!!adv.requireAllClasses} onChange={(e) => setAdv({ requireAllClasses: e.target.checked })} className="sr-only peer" />
                            <div className="w-9 h-5 toggle-track rounded-full peer-checked:toggle-track-checked transition-colors duration-200" />
                            <div className="absolute top-0.5 left-0.5 w-4 h-4 toggle-knob rounded-full peer-checked:translate-x-4 peer-checked:toggle-knob-checked transition-all duration-200" />
                          </div>
                          <span className="flex items-center gap-1.5 text-xs theme-muted group-hover:theme-text transition-colors">
                            <ShieldCheck className="w-3.5 h-3.5" />{t("gen.adv.requireall")}
                          </span>
                        </label>
                        <p className="text-[10px] theme-faint mt-1 ml-12">{t("gen.adv.requireall.help")}</p>
                      </div>
                    )}

                    {/* No consecutive repeats */}
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer group w-fit">
                        <div className="relative">
                          <input type="checkbox" checked={!!adv.noRepeats} onChange={(e) => setAdv({ noRepeats: e.target.checked })} className="sr-only peer" />
                          <div className="w-9 h-5 toggle-track rounded-full peer-checked:toggle-track-checked transition-colors duration-200" />
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 toggle-knob rounded-full peer-checked:translate-x-4 peer-checked:toggle-knob-checked transition-all duration-200" />
                        </div>
                        <span className="flex items-center gap-1.5 text-xs theme-muted group-hover:theme-text transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" />{t("gen.adv.norepeats")}
                        </span>
                      </label>
                      <p className="text-[10px] theme-faint mt-1 ml-12">{t("gen.adv.norepeats.help")}</p>
                    </div>

                    {/* Exclude custom characters */}
                    <div>
                      <label htmlFor="gen-exclude" className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                        <SquareAsterisk className="w-3 h-3" />{t("gen.adv.exclude")}
                      </label>
                      <input
                        id="gen-exclude"
                        name="gen-exclude"
                        type="text"
                        value={adv.excludeChars ?? ""}
                        onChange={(e) => setAdv({ excludeChars: e.target.value })}
                        placeholder={t("gen.adv.exclude.placeholder")}
                        autoComplete="off"
                        className="w-full text-sm font-mono"
                      />
                    </div>

                    {/* Grouping */}
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                        <Hash className="w-3 h-3" />{t("gen.adv.group")}
                      </p>
                      <div className="flex gap-1" role="group" aria-label={t("gen.adv.group")}>
                        {[0, 4, 6, 8].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setAdv({ groupSize: g })}
                            aria-pressed={(adv.groupSize ?? 0) === g}
                            className={`flex-1 py-2 rounded-md text-[11px] font-mono font-medium chip-select cursor-pointer border ${
                              (adv.groupSize ?? 0) === g ? "bg-[var(--primary)] text-[var(--btn-text)] border-transparent" : "glass theme-muted hover:theme-text"
                            }`}
                          >
                            {g === 0 ? t("gen.adv.group.off") : g}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] theme-faint mt-1">{t("gen.adv.group.help")}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Analysis of the current configuration */}
          <div className="glass !rounded-xl p-4 mb-4">
            <p className="flex items-center gap-1.5 text-xs font-medium theme-heading mb-1">
              <Gauge className="w-3 h-3" />{t("gen.config.title")}
            </p>
            <p className="text-[11px] theme-muted mb-3">{t("gen.config.desc")}</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="glass !rounded-lg px-3 py-2.5">
                <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  {t("gen.metric.pool")}
                  <InfoTip tipKey="tip.pool" align="left" />
                </p>
                <p className="text-sm font-mono theme-heading">{poolSize.toLocaleString()} <span className="text-[10px] theme-muted">{t("gen.metric.symbols")}</span></p>
              </div>
              <div className="glass !rounded-lg px-3 py-2.5">
                <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  {t("gen.metric.entropy")}
                  <InfoTip tipKey="tip.entropy" align="right" />
                </p>
                <p className="text-sm font-mono theme-heading">~{bits.toLocaleString()} <span className="text-[10px] theme-muted">{t("gen.metric.bits")}</span></p>
              </div>
            </div>

            {/* Full report on demand */}
            <div id="config-insights" className={`advanced-panel ${showFullAnalysis ? "advanced-open" : ""}`}>
              <div>
                <div className="pt-1 pb-3">
                  <SecurityInsights bits={bits} length={isUuid ? 36 : length} subjectKey="gen.avg.config" />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowFullAnalysis(!showFullAnalysis)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium theme-muted hover:theme-text hover:bg-[var(--glass-bg)] transition-colors duration-200 cursor-pointer"
              aria-expanded={showFullAnalysis}
              aria-controls="config-insights"
            >
              {showFullAnalysis ? t("gen.config.less") : t("gen.config.more")}
              {showFullAnalysis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button type="button" onClick={generate} className="btn-primary">
            <RefreshCw key={genTick} className="w-4 h-4 spin-once" />
            {t("gen.generate")}
          </button>

          {/* Results — every key scored, sorted high → low */}
          <div className="mt-5">
            {keys.length === 0 ? (
              <p className="text-xs theme-faint text-center py-6">{t("gen.empty")}</p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <p className="text-xs font-medium theme-heading">{t("gen.results")}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={copyAll} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium glass theme-muted hover:theme-text transition-colors cursor-pointer">
                      <Copy className="w-3 h-3" />{t("gen.copyall")}
                    </button>
                    <button type="button" onClick={downloadTxt} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium theme-primary-faint theme-primary-border border text-primary hover:opacity-80 transition-opacity cursor-pointer">
                      <Download className="w-3 h-3" />{t("gen.download")}
                    </button>
                  </div>
                </div>
                {keys.length > 1 && (
                  <p className="text-[10px] theme-faint mb-2">{t("gen.sorted")}</p>
                )}
                <ul key={genTick} className="space-y-1.5 stagger-children mt-2">
                  {keys.map((k, i) => (
                    <li key={`${genTick}-${i}`} className="glass !rounded-lg px-3 py-2 animate-in">
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-[11px] font-mono theme-text break-all select-all leading-relaxed">{k.value}</code>
                        <button
                          type="button"
                          onClick={() => copyOne(k.value, i)}
                          className="w-9 h-9 flex items-center justify-center rounded-md theme-faint hover:theme-text transition-colors cursor-pointer shrink-0"
                          aria-label={t("aria.copy")}
                        >
                          {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="strength-meter flex-1 !mt-0">
                          <div className={`strength-meter-fill ${SCORE_FILL[k.analysis.score]}`} />
                        </div>
                        <span className={`text-[10px] font-medium shrink-0 ${SCORE_TEXT[k.analysis.score]}`}>
                          {t(`gen.score.${k.analysis.score}` as Parameters<typeof t>[0])}
                        </span>
                        <span className="text-[10px] font-mono theme-faint shrink-0">
                          ~{k.analysis.effectiveBits} {t("gen.metric.bits")}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <p className="text-[10px] theme-faint mt-4 leading-relaxed">{t("gen.privacy")}</p>
        </div>
      )}

      {/* ─── Analyzer tab ─── */}
      {tab === "analyze" && (
        <div className="glass glow-green-sm p-6 sm:p-8 animate-in">
          <h2 className="text-sm font-semibold theme-heading mb-1">{t("gen.analyze.title")}</h2>
          <p className="text-xs theme-muted mb-4">{t("gen.analyze.subtitle")}</p>

          <div className="relative has-toggle-wrap mb-4">
            <label htmlFor="analyze-input" className="sr-only">{t("gen.analyze.label")}</label>
            <input
              id="analyze-input"
              name="analyze-password"
              type={showCandidate ? "text" : "password"}
              value={candidate}
              onChange={(e) => setCandidate(e.target.value)}
              placeholder={t("gen.analyze.placeholder")}
              autoComplete="off"
              className="w-full has-toggle font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowCandidate(!showCandidate)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center theme-faint hover:theme-text transition-colors cursor-pointer"
              aria-label={showCandidate ? t("aria.hidepass") : t("aria.showpass")}
            >
              {showCandidate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {candidate.length > 0 && (
            <div className="animate-in space-y-4">
              {/* Score meter */}
              <div>
                <div className="strength-meter">
                  <div className={`strength-meter-fill ${SCORE_FILL[analysis.score]}`} />
                </div>
                <p className={`text-xs font-medium mt-1.5 ${SCORE_TEXT[analysis.score]}`}>
                  {t(`gen.score.${analysis.score}` as Parameters<typeof t>[0])}
                </p>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {([
                  { label: t("gen.metric.length"), value: `${analysis.length}`, unit: t("gen.metric.chars"), tip: null, align: undefined },
                  { label: t("gen.metric.pool"), value: `${analysis.poolSize}`, unit: t("gen.metric.symbols"), tip: "tip.pool" as TranslationKey, align: "right" as const },
                  { label: t("gen.metric.entropy"), value: `${analysis.entropyBits}`, unit: t("gen.metric.bits"), tip: "tip.entropy" as TranslationKey, align: "left" as const },
                  { label: t("gen.metric.effective"), value: `${analysis.effectiveBits}`, unit: t("gen.metric.bits"), tip: "tip.effective" as TranslationKey, align: "right" as const },
                ]).map((m) => (
                  <div key={m.label} className="glass !rounded-lg px-3 py-2.5">
                    <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5 flex items-center gap-1">
                      {m.label}
                      {m.tip && <InfoTip tipKey={m.tip} align={m.align} />}
                    </p>
                    <p className="text-sm font-mono theme-heading">{m.value} <span className="text-[10px] theme-muted">{m.unit}</span></p>
                  </div>
                ))}
              </div>

              {/* Full security report */}
              <SecurityInsights bits={analysis.effectiveBits} length={analysis.length} subjectKey="gen.avg.this" />

              {/* Character classes */}
              <div>
                <p className="text-xs font-medium theme-text mb-2">{t("gen.classes.title")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {classChips.map(([cls, present]) => (
                    <span
                      key={cls}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${
                        present ? "theme-primary-faint theme-primary-border text-primary" : "glass theme-faint line-through"
                      }`}
                    >
                      {t(`gen.class.${cls}` as Parameters<typeof t>[0])}
                    </span>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              {analysis.warnings.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-medium theme-warning mb-2">
                    <AlertTriangle className="w-3 h-3" />{t("gen.warnings.title")}
                  </p>
                  <ul className="space-y-1.5">
                    {analysis.warnings.map((w) => (
                      <li key={w} className="flex items-start gap-2 text-[11px] theme-warning theme-warning-faint rounded-lg px-3 py-2 leading-relaxed">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                        {t(WARNING_KEYS[w] as Parameters<typeof t>[0])}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}

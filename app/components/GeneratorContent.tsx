"use client";

import { useEffect, useMemo, useState } from "react";
import {
  KeyRound, Copy, Check, RefreshCw, Download, Hash, Eye, EyeOff,
  ShieldCheck, AlertTriangle, Gauge, Layers, ScanSearch,
} from "lucide-react";
import { PageLayout, PageHeader } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";
import { notifySuccess } from "@/app/lib/notify";
import { usePreferences } from "@/app/lib/preferences";
import {
  CHARSETS, MODES, generateValue, entropyOf, analyzePassword, bucketCrackTime,
  type PasswordAnalysis, type PasswordWarning,
} from "@/app/lib/passwords";

// Same presets as the home KeyGenerator, plus shorter passphrase sizes
const LENGTHS = [16, 32, 64, 128, 256, 512, 1024];
const COUNTS = [1, 5, 10, 25, 50];

const MAX_LENGTH = 2048;
const MAX_COUNT = 100;

const clampLength = (n: number) => Math.min(MAX_LENGTH, Math.max(1, Math.floor(n)));
const clampCount = (n: number) => Math.min(MAX_COUNT, Math.max(1, Math.floor(n)));

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

interface GeneratedKey {
  value: string;
  analysis: PasswordAnalysis;
}

export default function GeneratorContent() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"generate" | "analyze">("generate");

  // ── Generator state — same persisted preferences the home KeyGenerator uses ──
  const {
    keygenMode: mode, keygenLength: length, keygenCount: count,
    setKeygenMode: setMode, setKeygenLength: setLength, setKeygenCount: setCount,
  } = usePreferences();
  const [keys, setKeys] = useState<GeneratedKey[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [genTick, setGenTick] = useState(0);

  // Free-typing buffers for the custom inputs, synced from persisted values
  const [lengthInput, setLengthInput] = useState(String(length));
  const [countInput, setCountInput] = useState(String(count));
  useEffect(() => setLengthInput(String(length)), [length]);
  useEffect(() => setCountInput(String(count)), [count]);

  // ── Analyzer state ──
  const [candidate, setCandidate] = useState("");
  const [showCandidate, setShowCandidate] = useState(false);
  const analysis = useMemo(() => analyzePassword(candidate), [candidate]);

  const isUuid = mode === "uuid";
  const bits = entropyOf(mode, length);

  // Slider thumb sits at the nearest preset stop (custom values keep the input highlighted)
  const sliderIdx = useMemo(() => {
    let best = 0;
    for (let i = 1; i < LENGTHS.length; i++) {
      if (Math.abs(LENGTHS[i] - length) < Math.abs(LENGTHS[best] - length)) best = i;
    }
    return best;
  }, [length]);
  const poolSize = isUuid ? 16 : [...CHARSETS[mode]].length;
  const configCrack = useMemo(
    () => Math.pow(2, bits - 1) / 1e12,
    [bits]
  );

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
      const value = generateValue(mode, safeLength);
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

  function crackLabel(seconds: number): string {
    const { bucket, value } = bucketCrackTime(seconds);
    if (bucket === "instant") return t("time.instant");
    if (bucket === "heatdeath") return t("time.heatdeath");
    return `${value.toLocaleString()} ${t(`time.${bucket}` as Parameters<typeof t>[0])}`;
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Mode */}
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                <ShieldCheck className="w-3 h-3" />{t("gen.mode")}
              </p>
              <div className="flex gap-0.5 glass !rounded-lg p-0.5 flex-wrap" role="group" aria-label={t("gen.mode")}>
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMode(m.key)}
                    aria-pressed={mode === m.key}
                    className={`flex-1 min-w-[3.5rem] py-2 text-[10px] font-medium rounded-md chip-select cursor-pointer ${
                      mode === m.key ? "bg-[var(--primary)] text-[var(--btn-text)]" : "theme-muted hover:theme-text"
                    }`}
                  >
                    {t(m.labelKey as Parameters<typeof t>[0])}
                  </button>
                ))}
              </div>
            </div>

            {/* Count: presets + custom (max 100) */}
            <div>
              <label htmlFor="gen-count" className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                <Layers className="w-3 h-3" />{t("gen.count")}
              </label>
              <div className="flex gap-1" role="group" aria-label={t("gen.count")}>
                {COUNTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCount(c)}
                    aria-pressed={count === c}
                    className={`flex-1 py-2 rounded-md text-[11px] font-mono font-medium chip-select cursor-pointer border ${
                      count === c ? "bg-[var(--primary)] text-[var(--btn-text)] border-transparent" : "glass theme-muted hover:theme-text"
                    }`}
                  >
                    {c}
                  </button>
                ))}
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
                  className={`w-16 shrink-0 !py-2 !px-2 text-center !rounded-md text-[11px] font-mono font-medium ${
                    !COUNTS.includes(count) ? "theme-primary-border text-primary" : ""
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Length: slider over the preset stops + manual input (max 2048) */}
          {!isUuid && (
            <div className="mb-4">
              <label htmlFor="gen-length-slider" className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                <Hash className="w-3 h-3" />{t("keygen.length")}
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <input
                    id="gen-length-slider"
                    type="range"
                    min={0}
                    max={LENGTHS.length - 1}
                    step={1}
                    value={sliderIdx}
                    onChange={(e) => setLength(LENGTHS[Number(e.target.value)])}
                    aria-label={t("keygen.length")}
                    aria-valuetext={`${LENGTHS[sliderIdx]}`}
                    className="range-slider"
                  />
                  {/* Stop dots + values (clickable) */}
                  <div className="flex justify-between px-[7px] -mt-1.5">
                    {LENGTHS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLength(l)}
                        aria-pressed={length === l}
                        aria-label={`${t("keygen.length")}: ${l}`}
                        className="flex flex-col items-center gap-1 cursor-pointer group min-w-0 py-1"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            length === l ? "bg-primary" : "bg-[var(--glass-border)] group-hover:bg-[var(--muted)]"
                          }`}
                          aria-hidden="true"
                        />
                        <span
                          className={`text-[9px] font-mono leading-none transition-colors ${
                            length === l ? "text-primary font-semibold" : "theme-faint group-hover:theme-muted"
                          }`}
                        >
                          {l}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
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
                  className={`w-[4.5rem] shrink-0 self-start !py-2 !px-2 text-center !rounded-md text-[11px] font-mono font-medium ${
                    !LENGTHS.includes(length) ? "theme-primary-border text-primary" : ""
                  }`}
                />
              </div>
            </div>
          )}

          {/* Analysis of the current configuration */}
          <div className="glass !rounded-xl p-4 mb-4">
            <p className="flex items-center gap-1.5 text-xs font-medium theme-heading mb-1">
              <Gauge className="w-3 h-3" />{t("gen.config.title")}
            </p>
            <p className="text-[11px] theme-muted mb-3">{t("gen.config.desc")}</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5">{t("gen.metric.pool")}</p>
                <p className="text-sm font-mono theme-heading">{poolSize.toLocaleString()} <span className="text-[10px] theme-muted">{t("gen.metric.symbols")}</span></p>
              </div>
              <div>
                <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5">{t("gen.metric.entropy")}</p>
                <p className="text-sm font-mono theme-heading">~{bits.toLocaleString()} <span className="text-[10px] theme-muted">{t("gen.metric.bits")}</span></p>
              </div>
              <div>
                <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5">{t("gen.crack.offline")}</p>
                <p className="text-sm font-mono text-primary">{crackLabel(configCrack)}</p>
              </div>
            </div>
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
                {[
                  { label: t("gen.metric.length"), value: `${analysis.length}`, unit: t("gen.metric.chars") },
                  { label: t("gen.metric.pool"), value: `${analysis.poolSize}`, unit: t("gen.metric.symbols") },
                  { label: t("gen.metric.entropy"), value: `${analysis.entropyBits}`, unit: t("gen.metric.bits") },
                  { label: t("gen.metric.effective"), value: `${analysis.effectiveBits}`, unit: t("gen.metric.bits") },
                ].map((m) => (
                  <div key={m.label} className="glass !rounded-lg px-3 py-2.5">
                    <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5">{m.label}</p>
                    <p className="text-sm font-mono theme-heading">{m.value} <span className="text-[10px] theme-muted">{m.unit}</span></p>
                  </div>
                ))}
              </div>

              {/* Crack times */}
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
                  <Gauge className="w-3 h-3" />{t("gen.crack.title")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="glass !rounded-lg px-3 py-2.5">
                    <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5">{t("gen.crack.online")}</p>
                    <p className="text-sm font-mono text-primary">{crackLabel(analysis.crackSeconds.online)}</p>
                  </div>
                  <div className="glass !rounded-lg px-3 py-2.5">
                    <p className="text-[9px] theme-faint uppercase tracking-wider mb-0.5">{t("gen.crack.offline")}</p>
                    <p className="text-sm font-mono text-primary">{crackLabel(analysis.crackSeconds.offline)}</p>
                  </div>
                </div>
              </div>

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

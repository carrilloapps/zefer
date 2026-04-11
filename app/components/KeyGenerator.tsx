"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Copy, Check, RefreshCw, Hash } from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { notifySuccess } from "@/app/lib/notify";

type Mode = "unicode" | "secure" | "alpha" | "hex" | "uuid";

// ─── Character pools ───

const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const SYMBOLS = "!@#$%^&*-_=+<>?{}[]|~`()/:;,.\\\"'";

const ACCENTED =
  "áàâãäåæçèéêëìíîïðñòóôõöùúûüýþÿ" +
  "ÁÀÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝÞ" +
  "ąćęłńóśźżĄĆĘŁŃÓŚŹŻ" +
  "ščřžťďňěůŠČŘŽŤĎŇĚŮ";

// Arabic: common letters
const ARABIC = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي";

// Japanese: Hiragana + Katakana ranges
const HIRAGANA = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
const KATAKANA = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

// Chinese: common CJK characters (high frequency)
const CHINESE = "的一是不了人我在有他这中大来上个国到说们为子和你地出会也时要就以下对生能过么当然学着没对好看起发成事只作把多那些头让";

// Korean: common Hangul syllables
const KOREAN = "가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호";

// Greek
const GREEK = "αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ";

// Cyrillic
const CYRILLIC = "абвгдежзийклмнопрстуфхцчшщъыьэюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

// Math & misc symbols
const MATH_SYMBOLS = "±×÷√∞≠≤≥≈∑∏∫∂∇∈∉⊂⊃∪∩∧∨¬∀∃∅⊕⊗";

// Currency
const CURRENCY = "€£¥₹₽₿¢₩₪₺₴";

// Emoji (common)
const EMOJI = "🔐🛡️🔑🔒🔓💀⚡🌍🎲🧬🚀✨🔥💎🌀⚙️🧩📡🏴‍☠️";

const CHARSETS: Record<Exclude<Mode, "uuid">, string> = {
  unicode: LATIN + SYMBOLS + ACCENTED + ARABIC + HIRAGANA + KATAKANA + CHINESE + KOREAN + GREEK + CYRILLIC + MATH_SYMBOLS + CURRENCY + EMOJI,
  secure: LATIN + SYMBOLS + ACCENTED,
  alpha: LATIN,
  hex: "0123456789abcdef",
};

const LENGTHS = [64, 128, 256, 512, 1024];

interface Props {
  onSelect: (value: string) => void;
  savedMode?: Mode;
  savedLength?: number;
  onModeChange?: (mode: Mode) => void;
  onLengthChange?: (length: number) => void;
}

function generateValue(mode: Mode, length: number): string {
  if (mode === "uuid") {
    const now = Date.now();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[0] = (now / 2 ** 40) & 0xff;
    bytes[1] = (now / 2 ** 32) & 0xff;
    bytes[2] = (now / 2 ** 24) & 0xff;
    bytes[3] = (now / 2 ** 16) & 0xff;
    bytes[4] = (now / 2 ** 8) & 0xff;
    bytes[5] = now & 0xff;
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // Rejection sampling: eliminates modulo bias for perfectly uniform distribution
  const charset = [...CHARSETS[mode]];
  const pool = charset.length;
  const limit = Math.floor(0x100000000 / pool) * pool; // largest multiple of pool that fits in uint32
  const result: string[] = [];
  while (result.length < length) {
    const batch = crypto.getRandomValues(new Uint32Array(Math.min(length - result.length + 16, 256)));
    for (let i = 0; i < batch.length && result.length < length; i++) {
      if (batch[i] < limit) {
        result.push(charset[batch[i] % pool]);
      }
    }
  }
  return result.join("");
}

const MODES: { key: Mode; labelKey: string }[] = [
  { key: "unicode", labelKey: "keygen.unicode" },
  { key: "secure", labelKey: "keygen.secure" },
  { key: "alpha", labelKey: "keygen.alpha" },
  { key: "hex", labelKey: "keygen.hex" },
  { key: "uuid", labelKey: "keygen.uuid" },
];

export default function KeyGenerator({ onSelect, savedMode, savedLength, onModeChange, onLengthChange }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [mode, setModeLocal] = useState<Mode>(savedMode ?? "secure");
  const [length, setLengthLocal] = useState(savedLength ?? 64);
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [regenKey, setRegenKey] = useState(0);

  const setMode = (v: Mode) => { setModeLocal(v); onModeChange?.(v); };
  const setLength = (v: number) => { setLengthLocal(v); onLengthChange?.(v); };
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function regen() {
    setValue(generateValue(mode, length));
    setCopied(false);
    setRegenKey((k) => k + 1);
  }

  useEffect(() => {
    if (open) regen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, length]);

  function handleOpen() {
    setOpen(true);
    setValue(generateValue(mode, length));
  }

  function handleUse() {
    onSelect(value);
    setOpen(false);
    notifySuccess(t("toast.keygen.applied"));
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    notifySuccess(t("toast.keygen.copied"));
    setTimeout(() => setCopied(false), 1500);
  }

  const isUuid = mode === "uuid";
  const poolSize = isUuid ? 0 : [...CHARSETS[mode]].length;
  const entropy = isUuid ? 122 : Math.floor(Math.log2(poolSize) * length);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center justify-center w-[2.625rem] h-[2.625rem] rounded-lg theme-primary-faint theme-primary-border border text-primary hover:opacity-80 transition-opacity cursor-pointer shrink-0"
        aria-label={t("keygen.title")}
        title={t("keygen.title")}
      >
        <Sparkles className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:right-0 bottom-4 sm:bottom-auto sm:top-full sm:mt-2 w-auto sm:w-80 keygen-popover !rounded-xl shadow-2xl z-50 p-4 animate-in-down">
          <p className="text-xs font-medium theme-heading mb-3">{t("keygen.title")}</p>

          {/* Mode selector */}
          <div className="flex gap-0.5 mb-3 keygen-popover-inner !rounded-lg p-0.5">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className={`flex-1 py-1.5 text-[9px] font-medium rounded-md chip-select cursor-pointer ${
                  mode === m.key ? "bg-[var(--primary)] text-[var(--btn-text)]" : "theme-muted hover:theme-text"
                }`}
              >
                {t(m.labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>

          {/* Length selector */}
          {!isUuid && (
            <div className="mb-3">
              <label className="flex items-center gap-1.5 text-[10px] font-medium theme-muted mb-1.5">
                <Hash className="w-3 h-3" />{t("keygen.length")}
              </label>
              <div className="flex gap-1">
                {LENGTHS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLength(l)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-mono font-medium chip-select cursor-pointer border ${
                      length === l
                        ? "bg-[var(--primary)] text-[var(--btn-text)] border-transparent"
                        : "keygen-popover-inner theme-muted hover:theme-text"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generated value */}
          <div key={regenKey} className="keygen-popover-inner !rounded-lg p-3 mb-3 animate-scale-in">
            <div className="flex items-start gap-2">
              <p className={`text-[10px] font-mono theme-text break-all flex-1 select-all leading-relaxed ${
                value.length > 100 ? "max-h-28 overflow-y-auto" : ""
              }`}>
                {value}
              </p>
              <button type="button" onClick={handleCopy} className="w-8 h-8 flex items-center justify-center rounded-md theme-faint hover:theme-muted transition-colors cursor-pointer shrink-0" aria-label="Copy generated value" title="Copy">
                {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[9px] theme-faint font-mono">
                {isUuid ? "UUID v7 (RFC 9562)" : `${value.length} ${t("keygen.chars")}`}
              </p>
              <p className="text-[9px] text-primary font-mono">
                ~{entropy} bits
              </p>
            </div>
          </div>

          {/* Pool info for unicode mode */}
          {mode === "unicode" && (
            <p className="text-[9px] theme-faint mb-3 leading-relaxed">
              {t("keygen.unicode.desc")}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={regen}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium keygen-popover-inner theme-muted hover:theme-text transition-colors cursor-pointer"
            >
              <RefreshCw key={regenKey} className="w-3 h-3 spin-once" />{t("keygen.regenerate")}
            </button>
            <button
              type="button"
              onClick={handleUse}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium bg-[var(--primary)] text-[var(--btn-text)] cursor-pointer hover:opacity-90 transition-opacity"
            >
              {t("keygen.use")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

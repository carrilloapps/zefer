// ─── Password generation & analysis (100% client-side, no DOM) ───

export type KeygenMode = "unicode" | "secure" | "alpha" | "hex" | "base58" | "pin" | "uuid";

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

export const CHARSETS: Record<Exclude<KeygenMode, "uuid">, string> = {
  unicode: LATIN + SYMBOLS + ACCENTED + ARABIC + HIRAGANA + KATAKANA + CHINESE + KOREAN + GREEK + CYRILLIC + MATH_SYMBOLS + CURRENCY + EMOJI,
  secure: LATIN + SYMBOLS + ACCENTED,
  alpha: LATIN,
  hex: "0123456789abcdef",
  // Base58 (Bitcoin alphabet): no 0/O/1/l/I — safe to read aloud or hand-copy
  base58: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
  // Numeric PIN: devices, cards, safes
  pin: "0123456789",
};

/** Canonical mode list shared by the home popover and the /generator page */
export const MODES: { key: KeygenMode; labelKey: string }[] = [
  { key: "unicode", labelKey: "keygen.unicode" },
  { key: "secure", labelKey: "keygen.secure" },
  { key: "alpha", labelKey: "keygen.alpha" },
  { key: "hex", labelKey: "keygen.hex" },
  { key: "base58", labelKey: "keygen.base58" },
  { key: "pin", labelKey: "keygen.pin" },
  { key: "uuid", labelKey: "keygen.uuid" },
];

// ─── Generation (rejection sampling: no modulo bias) ───

export function generateValue(mode: KeygenMode, length: number): string {
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

export function entropyOf(mode: KeygenMode, length: number): number {
  if (mode === "uuid") return 122;
  return Math.floor(Math.log2([...CHARSETS[mode]].length) * length);
}

// ─── Advanced generation options ───

export interface GenerateOptions {
  /** Drop visually ambiguous characters: 0 O 1 l I */
  excludeAmbiguous?: boolean;
  /** Additional characters to exclude */
  excludeChars?: string;
  /** Resample until every class available in the charset appears at least once */
  requireAllClasses?: boolean;
  /** Never emit the same character twice in a row */
  noRepeats?: boolean;
  /** Insert a dash every N characters (0 = off). Purely cosmetic grouping. */
  groupSize?: number;
}

export const DEFAULT_GENERATE_OPTIONS: Required<GenerateOptions> = {
  excludeAmbiguous: false,
  excludeChars: "",
  requireAllClasses: false,
  noRepeats: false,
  groupSize: 0,
};

const AMBIGUOUS = new Set([..."0O1lI"]);

/** Charset for a mode after applying exclusions */
export function charsetFor(mode: KeygenMode, opts?: GenerateOptions): string[] {
  if (mode === "uuid") return [];
  let chars = [...CHARSETS[mode]];
  if (opts?.excludeAmbiguous) chars = chars.filter((c) => !AMBIGUOUS.has(c));
  if (opts?.excludeChars) {
    const ex = new Set([...opts.excludeChars]);
    chars = chars.filter((c) => !ex.has(c));
  }
  return chars;
}

function sampleFrom(charset: string[], length: number, noRepeats: boolean): string {
  const pool = charset.length;
  const limit = Math.floor(0x100000000 / pool) * pool;
  const out: string[] = [];
  while (out.length < length) {
    const batch = crypto.getRandomValues(new Uint32Array(Math.min(length - out.length + 16, 256)));
    for (let i = 0; i < batch.length && out.length < length; i++) {
      if (batch[i] >= limit) continue;
      const c = charset[batch[i] % pool];
      if (noRepeats && out.length > 0 && out[out.length - 1] === c) continue;
      out.push(c);
    }
  }
  return out.join("");
}

const CLASS_TESTS: [keyof PasswordAnalysis["classes"], RegExp][] = [
  ["lower", /[a-z]/],
  ["upper", /[A-Z]/],
  ["digits", /[0-9]/],
  ["symbols", /[!-/:-@[-`{-~]/],
];

/** Generation with advanced options. Falls back to plain generation when the
 *  exclusions would leave fewer than 2 characters in the pool. */
export function generateWithOptions(mode: KeygenMode, length: number, opts: GenerateOptions = {}): string {
  if (mode === "uuid") return generateValue("uuid", length);
  const charset = charsetFor(mode, opts);
  if (charset.length < 2) return generateValue(mode, length);

  // Which classes can the filtered charset actually produce?
  const producible = CLASS_TESTS.filter(([, re]) => charset.some((c) => re.test(c)));

  let value = sampleFrom(charset, length, !!opts.noRepeats);
  if (opts.requireAllClasses && producible.length > 1 && length >= producible.length) {
    for (let attempt = 0; attempt < 64; attempt++) {
      const ok = producible.every(([, re]) => re.test(value));
      if (ok) break;
      value = sampleFrom(charset, length, !!opts.noRepeats);
    }
  }

  if (opts.groupSize && opts.groupSize > 0) {
    const chars = [...value];
    const parts: string[] = [];
    for (let i = 0; i < chars.length; i += opts.groupSize) {
      parts.push(chars.slice(i, i + opts.groupSize).join(""));
    }
    value = parts.join("-");
  }
  return value;
}

// ─── Analysis ───

export type CrackSpeed = "online" | "offline";

export interface PasswordAnalysis {
  length: number;
  /** Estimated charset pool size based on character classes present */
  poolSize: number;
  /** Shannon-style upper-bound entropy: log2(pool) * length */
  entropyBits: number;
  /** Effective entropy after pattern penalties */
  effectiveBits: number;
  classes: {
    lower: boolean;
    upper: boolean;
    digits: boolean;
    symbols: boolean;
    extended: boolean; // beyond printable ASCII
  };
  classCount: number;
  /** 0–4: very weak, weak, fair, good, strong */
  score: 0 | 1 | 2 | 3 | 4;
  warnings: PasswordWarning[];
  /** Seconds to exhaust half the keyspace at each attacker speed */
  crackSeconds: Record<CrackSpeed, number>;
}

export type PasswordWarning =
  | "tooShort"
  | "common"
  | "onlyDigits"
  | "onlyLetters"
  | "repeats"
  | "sequence"
  | "keyboard"
  | "datelike"
  | "lowVariety";

// Top common passwords (lowercase) — checked as exact or base of the input
const COMMON = new Set([
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234",
  "111111", "1234567", "dragon", "123123", "abc123", "monkey", "letmein",
  "iloveyou", "trustno1", "sunshine", "master", "welcome", "shadow", "ashley",
  "football", "jesus", "michael", "ninja", "mustang", "password1", "admin",
  "000000", "654321", "superman", "qazwsx", "starwars", "contraseña", "secreto",
  "hola123", "querty", "asdfgh", "zxcvbn", "pokemon", "soccer", "princess",
  "batman", "freedom", "whatever", "qwerty123", "zaq12wsx", "passw0rd",
]);

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

/** Attacker guesses per second */
const SPEEDS: Record<CrackSpeed, number> = {
  online: 1e4,     // throttled online attack
  offline: 1e12,   // offline GPU cluster vs fast hash
};

function detectSequence(s: string): boolean {
  if (s.length < 4) return false;
  let run = 1;
  for (let i = 1; i < s.length; i++) {
    const d = s.codePointAt(i)! - s.codePointAt(i - 1)!;
    run = d === 1 || d === -1 ? run + 1 : 1;
    if (run >= 4) return true;
  }
  return false;
}

function detectRepeats(s: string): boolean {
  return /(.)\1{2,}/u.test(s) || (s.length >= 6 && /^(.{1,3})\1+$/u.test(s));
}

function detectKeyboard(s: string): boolean {
  const low = s.toLowerCase();
  return KEYBOARD_ROWS.some((row) => {
    for (let i = 0; i + 4 <= row.length; i++) {
      const slice = row.slice(i, i + 4);
      if (low.includes(slice) || low.includes([...slice].reverse().join(""))) return true;
    }
    return false;
  });
}

export function analyzePassword(password: string): PasswordAnalysis {
  const chars = [...password];
  const length = chars.length;

  const classes = {
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digits: /[0-9]/.test(password),
    symbols: /[!-/:-@[-`{-~]/.test(password),
    extended: chars.some((c) => c.codePointAt(0)! > 0x7e),
  };
  const classCount = Object.values(classes).filter(Boolean).length;

  let poolSize = 0;
  if (classes.lower) poolSize += 26;
  if (classes.upper) poolSize += 26;
  if (classes.digits) poolSize += 10;
  if (classes.symbols) poolSize += 33;
  if (classes.extended) poolSize += 256; // conservative estimate for non-ASCII variety

  const entropyBits = length === 0 ? 0 : Math.round(Math.log2(Math.max(poolSize, 1)) * length);

  const warnings: PasswordWarning[] = [];
  const low = password.toLowerCase();

  if (length > 0 && length < 8) warnings.push("tooShort");
  if (COMMON.has(low) || COMMON.has(low.replace(/[0-9!@#$%.]+$/u, ""))) warnings.push("common");
  if (length > 0 && /^[0-9]+$/.test(password)) warnings.push("onlyDigits");
  else if (length > 0 && /^[a-zA-Z]+$/.test(password) && classCount === 1) warnings.push("onlyLetters");
  if (detectRepeats(password)) warnings.push("repeats");
  if (detectSequence(password)) warnings.push("sequence");
  if (detectKeyboard(password)) warnings.push("keyboard");
  if (/^(19|20)\d{2}/.test(password) || /(19|20)\d{2}$/.test(password)) warnings.push("datelike");
  if (length >= 8 && classCount === 1 && !classes.extended) warnings.push("lowVariety");

  // Effective entropy: penalize structural weaknesses
  let effectiveBits = entropyBits;
  if (warnings.includes("common")) effectiveBits = Math.min(effectiveBits, 12);
  if (warnings.includes("repeats")) effectiveBits = Math.round(effectiveBits * 0.6);
  if (warnings.includes("sequence") || warnings.includes("keyboard")) effectiveBits = Math.round(effectiveBits * 0.7);
  if (warnings.includes("datelike")) effectiveBits = Math.max(0, effectiveBits - 10);

  const crackSeconds = {
    online: length === 0 ? 0 : Math.pow(2, effectiveBits - 1) / SPEEDS.online,
    offline: length === 0 ? 0 : Math.pow(2, effectiveBits - 1) / SPEEDS.offline,
  };

  let score: PasswordAnalysis["score"];
  if (length === 0 || effectiveBits < 28) score = 0;
  else if (effectiveBits < 40) score = 1;
  else if (effectiveBits < 60) score = 2;
  else if (effectiveBits < 80) score = 3;
  else score = 4;

  return { length, poolSize, entropyBits, effectiveBits, classes, classCount, score, warnings, crackSeconds };
}

// ─── Crack-time bucketing (component maps bucket → i18n string) ───

export type CrackBucket =
  | "instant"      // < 1 s
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "months"
  | "years"
  | "centuries"
  | "heatdeath";   // > 10^12 years

export function bucketCrackTime(seconds: number): { bucket: CrackBucket; value: number } {
  if (seconds < 1) return { bucket: "instant", value: 0 };
  if (seconds < 60) return { bucket: "seconds", value: Math.round(seconds) };
  if (seconds < 3600) return { bucket: "minutes", value: Math.round(seconds / 60) };
  if (seconds < 86400) return { bucket: "hours", value: Math.round(seconds / 3600) };
  if (seconds < 86400 * 60) return { bucket: "days", value: Math.round(seconds / 86400) };
  if (seconds < 86400 * 365 * 2) return { bucket: "months", value: Math.round(seconds / (86400 * 30)) };
  if (seconds < 86400 * 365 * 1000) return { bucket: "years", value: Math.round(seconds / (86400 * 365)) };
  if (seconds < 86400 * 365 * 1e12) return { bucket: "centuries", value: Math.round(seconds / (86400 * 365 * 100)) };
  return { bucket: "heatdeath", value: 0 };
}

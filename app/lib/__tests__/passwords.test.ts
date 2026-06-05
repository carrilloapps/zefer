import { describe, it, expect, vi } from "vitest";
import {
  CHARSETS,
  MODES,
  generateValue,
  generateWithOptions,
  charsetFor,
  entropyOf,
  analyzePassword,
  bucketCrackTime,
  crackBucketFor,
  toSuperscript,
  complianceOf,
  keyspaceExponent,
  ATTACK_SCENARIOS,
  AVERAGE_HUMAN_BITS,
} from "../passwords";

const AMBIGUOUS = [..."0O1lI"];

describe("MODES & CHARSETS", () => {
  it("exposes 7 modes including base58 and pin", () => {
    expect(MODES).toHaveLength(7);
    const keys = MODES.map((m) => m.key);
    expect(keys).toContain("base58");
    expect(keys).toContain("pin");
    expect(keys).toContain("uuid");
  });

  it("base58 charset is the standard Bitcoin alphabet (no 0 O I l)", () => {
    for (const c of [..."0OIl"]) {
      expect(CHARSETS.base58.includes(c)).toBe(false);
    }
    expect(CHARSETS.base58.includes("1")).toBe(true); // standard Base58 keeps '1'
    expect([...CHARSETS.base58]).toHaveLength(58);
  });

  it("pin charset is exactly the 10 digits", () => {
    expect(CHARSETS.pin).toBe("0123456789");
  });
});

describe("generateValue", () => {
  it("produces the requested length from the mode charset", () => {
    for (const mode of ["secure", "alpha", "hex", "base58", "pin"] as const) {
      const value = generateValue(mode, 40);
      const chars = [...value];
      expect(chars).toHaveLength(40);
      const pool = new Set([...CHARSETS[mode]]);
      for (const c of chars) expect(pool.has(c)).toBe(true);
    }
  });

  it("unicode mode respects code-point length", () => {
    const value = generateValue("unicode", 32);
    expect([...value]).toHaveLength(32);
  });

  it("uuid mode produces a valid UUID v7", () => {
    const value = generateValue("uuid", 0);
    expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});

describe("generateWithOptions", () => {
  it("excludeAmbiguous removes 0 O 1 l I", () => {
    const value = generateWithOptions("secure", 600, { excludeAmbiguous: true });
    for (const c of AMBIGUOUS) expect(value.includes(c)).toBe(false);
  });

  it("excludeChars removes the requested characters", () => {
    const value = generateWithOptions("alpha", 600, { excludeChars: "abcXYZ" });
    for (const c of [..."abcXYZ"]) expect(value.includes(c)).toBe(false);
  });

  it("falls back to plain generation when exclusions empty the pool", () => {
    const value = generateWithOptions("pin", 20, { excludeChars: "0123456789" });
    expect([...value]).toHaveLength(20);
    expect(value).toMatch(/^[0-9]+$/);
  });

  it("noRepeats never emits the same character twice in a row", () => {
    const value = generateWithOptions("pin", 2000, { noRepeats: true });
    const chars = [...value];
    for (let i = 1; i < chars.length; i++) {
      expect(chars[i]).not.toBe(chars[i - 1]);
    }
  });

  it("groupSize inserts a dash every N characters", () => {
    const value = generateWithOptions("hex", 16, { groupSize: 4 });
    expect(value).toMatch(/^[0-9a-f]{4}(-[0-9a-f]{4}){3}$/);
  });

  it("requireAllClasses guarantees lower, upper, digit and symbol", () => {
    for (let i = 0; i < 5; i++) {
      const value = generateWithOptions("secure", 12, { requireAllClasses: true, excludeAmbiguous: true });
      expect(value).toMatch(/[a-z]/);
      expect(value).toMatch(/[A-Z]/);
      expect(value).toMatch(/[0-9]/);
      expect(value).toMatch(/[!-/:-@[-`{-~]/);
    }
  });
});

describe("charsetFor / entropyOf", () => {
  it("charsetFor applies exclusions", () => {
    const base = charsetFor("secure").length;
    const filtered = charsetFor("secure", { excludeAmbiguous: true }).length;
    expect(filtered).toBe(base - 5);
  });

  it("entropyOf matches log2(pool) * length", () => {
    const pool = [...CHARSETS.hex].length;
    expect(entropyOf("hex", 32)).toBe(Math.floor(Math.log2(pool) * 32));
    expect(entropyOf("uuid", 999)).toBe(122);
  });
});

describe("analyzePassword", () => {
  it("flags common passwords and floors their effective entropy", () => {
    const a = analyzePassword("123456");
    expect(a.warnings).toContain("common");
    expect(a.warnings).toContain("onlyDigits");
    expect(a.score).toBe(0);
    expect(a.effectiveBits).toBeLessThanOrEqual(12);
  });

  it("detects keyboard patterns and embedded years", () => {
    const a = analyzePassword("qwerty2024");
    expect(a.warnings).toContain("keyboard");
    expect(a.warnings).toContain("datelike");
  });

  it("detects sequences and repeats", () => {
    expect(analyzePassword("abcdefgh").warnings).toContain("sequence");
    expect(analyzePassword("aaabbbcccddd").warnings).toContain("repeats");
  });

  it("scores a generated key as strong with full class coverage", () => {
    const a = analyzePassword("kV9#mQ2$xR7!nW4@");
    expect(a.score).toBeGreaterThanOrEqual(3);
    expect(a.classes.lower).toBe(true);
    expect(a.classes.upper).toBe(true);
    expect(a.classes.digits).toBe(true);
    expect(a.classes.symbols).toBe(true);
    expect(a.classCount).toBe(4);
  });

  it("handles the empty string", () => {
    const a = analyzePassword("");
    expect(a.length).toBe(0);
    expect(a.score).toBe(0);
    expect(a.entropyBits).toBe(0);
  });
});

describe("crack-time buckets", () => {
  it("buckets seconds, minutes, hours, days, months and years", () => {
    expect(bucketCrackTime(0.5).bucket).toBe("instant");
    expect(bucketCrackTime(30).bucket).toBe("seconds");
    expect(bucketCrackTime(120).bucket).toBe("minutes");
    expect(bucketCrackTime(7200).bucket).toBe("hours");
    expect(bucketCrackTime(86400 * 3).bucket).toBe("days");
    expect(bucketCrackTime(86400 * 90).bucket).toBe("months");
    expect(bucketCrackTime(86400 * 365 * 10).bucket).toBe("years");
  });

  it("switches to scientific notation beyond a million years", () => {
    const r = bucketCrackTime(86400 * 365 * 1e9);
    expect(r.bucket).toBe("yearsExp");
    expect(r.value).toBe(9);
  });

  it("crackBucketFor never returns Infinity, even for huge bit counts", () => {
    const r = crackBucketFor(18_000, 1e15);
    expect(r.bucket).toBe("yearsExp");
    expect(Number.isFinite(r.value)).toBe(true);
    expect(r.value).toBeGreaterThan(5000);
  });

  it("crackBucketFor matches direct math for small bit counts", () => {
    // 28 bits at 100/s → 2^27 / 100 ≈ 15.5 days
    const r = crackBucketFor(28, 100);
    expect(r.bucket).toBe("days");
    expect(r.value).toBeGreaterThanOrEqual(15);
    expect(r.value).toBeLessThanOrEqual(16);
  });
});

describe("toSuperscript", () => {
  it("converts digits to Unicode superscripts", () => {
    expect(toSuperscript(5648)).toBe("⁵⁶⁴⁸");
    expect(toSuperscript(0)).toBe("⁰");
  });

  it("guards non-finite input", () => {
    expect(toSuperscript(Infinity)).toBe("⁹⁹⁹⁺");
  });
});

describe("compliance & keyspace", () => {
  it("evaluates each threshold independently", () => {
    const mid = Object.fromEntries(complianceOf(90, 12).map((c) => [c.key, c.pass]));
    expect(mid).toEqual({ nist: true, owasp: true, longterm: false, aes128: false, quantum: false });

    const strong = Object.fromEntries(complianceOf(300, 64).map((c) => [c.key, c.pass]));
    expect(strong).toEqual({ nist: true, owasp: true, longterm: true, aes128: true, quantum: true });
  });

  it("keyspaceExponent converts bits to a decimal exponent", () => {
    expect(keyspaceExponent(128)).toBe(38);
    expect(keyspaceExponent(0)).toBe(0);
  });

  it("attack scenarios are ordered by increasing speed", () => {
    expect(ATTACK_SCENARIOS).toHaveLength(4);
    for (let i = 1; i < ATTACK_SCENARIOS.length; i++) {
      expect(ATTACK_SCENARIOS[i].gps).toBeGreaterThan(ATTACK_SCENARIOS[i - 1].gps);
    }
  });

  it("average human baseline is 40 bits", () => {
    expect(AVERAGE_HUMAN_BITS).toBe(40);
  });
});

describe("branch coverage details", () => {
  it("charsetFor returns an empty pool for uuid", () => {
    expect(charsetFor("uuid")).toEqual([]);
  });

  it("generateWithOptions delegates uuid mode to plain generation", () => {
    const value = generateWithOptions("uuid", 0, { excludeAmbiguous: true });
    expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("rejection sampling discards out-of-range random values", () => {
    // Force the first random batch to be all-rejected (>= limit), then restore
    const original = crypto.getRandomValues.bind(crypto);
    let first = true;
    const spy = vi.spyOn(crypto, "getRandomValues").mockImplementation(((arr: ArrayBufferView) => {
      if (first && arr instanceof Uint32Array) {
        first = false;
        arr.fill(0xffffffff); // rejected for any pool that does not divide 2^32
        return arr;
      }
      return original(arr as never);
    }) as typeof crypto.getRandomValues);

    const a = generateValue("secure", 8);
    first = true;
    const b = generateWithOptions("secure", 8, { excludeAmbiguous: true });
    spy.mockRestore();

    expect([...a]).toHaveLength(8);
    expect([...b]).toHaveLength(8);
  });

  it("detects extended (non-ASCII) characters and widens the pool", () => {
    const a = analyzePassword("clave-Ünicode-🎲-segura");
    expect(a.classes.extended).toBe(true);
    expect(a.poolSize).toBeGreaterThanOrEqual(256);
  });

  it("assigns fair and good scores in the middle entropy bands", () => {
    const fair = analyzePassword("xkQ9mTr2p"); // ~54 bits → score 2
    expect(fair.score).toBe(2);
    const good = analyzePassword("xkQ9mTr2pLw4"); // ~71 bits → score 3
    expect(good.score).toBe(3);
  });

  it("toSuperscript passes through non-digit characters", () => {
    expect(toSuperscript(-2)).toBe("-²");
  });

  it("crackBucketFor returns numeric years between 31 and a million years", () => {
    const r = crackBucketFor(45, 1); // ≈ 5.6 × 10⁵ years
    expect(r.bucket).toBe("years");
    expect(r.value).toBeGreaterThan(100_000);
    expect(r.value).toBeLessThan(1_000_000);
  });
});

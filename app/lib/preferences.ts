import { useState, useEffect, useCallback } from "react";
import type { CompressionMethod } from "./compression";

const STORAGE_KEY = "zefer-prefs";

type InputMode = "text" | "file";
type Tab = "encrypt" | "decrypt";

type KeygenMode = "unicode" | "secure" | "alpha" | "hex" | "uuid";

interface Preferences {
  ttl: number;
  iterations: number;
  compression: CompressionMethod;
  inputMode: InputMode;
  tab: Tab;
  keygenMode: KeygenMode;
  keygenLength: number;
}

const DEFAULTS: Preferences = {
  ttl: 1440,
  iterations: 600_000,
  compression: "none",
  inputMode: "text",
  tab: "encrypt",
  keygenMode: "secure",
  keygenLength: 64,
};

function load(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function save(prefs: Preferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);

  useEffect(() => {
    setPrefs(load());
  }, []);

  const update = useCallback((partial: Partial<Preferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      save(next);
      return next;
    });
  }, []);

  return {
    ttl: prefs.ttl,
    iterations: prefs.iterations,
    compression: prefs.compression,
    inputMode: prefs.inputMode,
    tab: prefs.tab,
    setTtl: (v: number) => update({ ttl: v }),
    setIterations: (v: number) => update({ iterations: v }),
    setCompression: (v: CompressionMethod) => update({ compression: v }),
    setInputMode: (v: InputMode) => update({ inputMode: v }),
    setTab: (v: Tab) => update({ tab: v }),
    keygenMode: prefs.keygenMode,
    keygenLength: prefs.keygenLength,
    setKeygenMode: (v: KeygenMode) => update({ keygenMode: v }),
    setKeygenLength: (v: number) => update({ keygenLength: v }),
  };
}

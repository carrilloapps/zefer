import { useSyncExternalStore } from "react";
import type { CompressionMethod } from "./compression";
import type { KeygenMode, GenerateOptions } from "./passwords";

const STORAGE_KEY = "zefer-prefs";

type InputMode = "text" | "file";
type Tab = "encrypt" | "decrypt";

interface Preferences {
  ttl: number;
  iterations: number;
  compression: CompressionMethod;
  inputMode: InputMode;
  tab: Tab;
  keygenMode: KeygenMode;
  keygenLength: number;
  keygenCount: number;
  keygenAdvanced: GenerateOptions;
}

const DEFAULTS: Preferences = {
  ttl: 30,
  iterations: 600_000,
  compression: "none",
  inputMode: "text",
  tab: "encrypt",
  keygenMode: "secure",
  keygenLength: 64,
  keygenCount: 1,
  keygenAdvanced: {
    excludeAmbiguous: false,
    excludeChars: "",
    requireAllClasses: false,
    noRepeats: false,
    groupSize: 0,
  },
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

// ─── External store ───
//
// localStorage IS an external system, so preferences live in a module-level
// store read through useSyncExternalStore instead of being copied into state
// by an effect. That keeps hydration safe — the server and the hydration
// render both see DEFAULTS, the client swaps in the stored values right
// afterwards — without the extra cascading render a setState-in-effect costs,
// and every component sharing the hook now sees the same values.

let snapshot: Preferences | null = null;
const listeners = new Set<() => void>();

/** Stable reference per state: useSyncExternalStore loops if it changes on every call. */
function getSnapshot(): Preferences {
  snapshot ??= load();
  return snapshot;
}

/** Server and hydration render: defaults only, never localStorage. */
function getServerSnapshot(): Preferences {
  return DEFAULTS;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function update(partial: Partial<Preferences>) {
  snapshot = { ...getSnapshot(), ...partial };
  save(snapshot);
  for (const listener of listeners) listener();
}

export function usePreferences() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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
    keygenCount: prefs.keygenCount,
    keygenAdvanced: prefs.keygenAdvanced,
    setKeygenMode: (v: KeygenMode) => update({ keygenMode: v }),
    setKeygenLength: (v: number) => update({ keygenLength: v }),
    setKeygenCount: (v: number) => update({ keygenCount: v }),
    setKeygenAdvanced: (v: Partial<GenerateOptions>) =>
      update({ keygenAdvanced: { ...prefs.keygenAdvanced, ...v } }),
  };
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { type Locale, type TranslationKey, t } from "@/app/lib/i18n";

const STORAGE_KEY = "zefer-lang";
const DEFAULT_LOCALE: Locale = "en";
const LOCALES = new Set<Locale>(["es", "en", "pt"]);

// ─── External store ───
//
// The active locale comes from localStorage or, failing that, from
// `navigator.language` — both external systems. Reading them through
// useSyncExternalStore keeps the server render and the hydration render on
// DEFAULT_LOCALE, which is what the hardcoded `<html lang="en">` ships, so
// hydration stays safe without a setState-in-effect and its extra render pass.

interface LanguageState {
  locale: Locale;
  ready: boolean;
}

const SERVER_STATE: LanguageState = { locale: DEFAULT_LOCALE, ready: false };

let snapshot: LanguageState | null = null;
const listeners = new Set<() => void>();

function readStored(): Locale | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    return saved && LOCALES.has(saved) ? saved : null;
  } catch {
    return null;
  }
}

function detectLocale(): Locale {
  const stored = readStored();
  if (stored) return stored;
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("es")) return "es";
  if (browserLang.startsWith("pt")) return "pt";
  return DEFAULT_LOCALE;
}

/** Stable reference per state: useSyncExternalStore loops if it changes on every call. */
function getSnapshot(): LanguageState {
  snapshot ??= { locale: detectLocale(), ready: true };
  return snapshot;
}

/** Server and hydration render: the document default, never localStorage. */
function getServerSnapshot(): LanguageState {
  return SERVER_STATE;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setLocale(locale: Locale) {
  snapshot = { locale, ready: true };
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* storage unavailable (private mode, blocked cookies) — the locale still applies */
  }
  for (const listener of listeners) listener();
}

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
  ready: false,
});

export function LanguageProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { locale, ready } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep <html lang> in sync with the active locale (WCAG 3.1.1). A DOM write,
  // never state, so it stays an effect.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // `setLocale` is module-level and therefore stable, so the context value only
  // changes when the locale actually does.
  const value = useMemo(
    () => ({ locale, ready, setLocale, t: (key: TranslationKey) => t(key, locale) }),
    [locale, ready]
  );

  // Always render children so the page is server-rendered for crawlers (incl.
  // non-JS AI bots) and indexable.
  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

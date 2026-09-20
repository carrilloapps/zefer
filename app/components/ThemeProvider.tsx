"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "zefer-theme";
const DEFAULT_THEME: Theme = "dark";

// ─── External store ───
//
// The active theme lives in localStorage plus the OS colour-scheme preference,
// and both are external systems. Reading them through useSyncExternalStore
// keeps the server render and the hydration render on DEFAULT_THEME — which is
// exactly what `<html data-theme="dark">` ships — while the inline script in
// the document head has already applied the stored theme before paint. React
// then picks up the real value without the extra cascading render a
// setState-in-effect costs.

let snapshot: Theme | null = null;
const listeners = new Set<() => void>();

function readStored(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

/** Same resolution order as the pre-paint script in the document head. */
function resolveTheme(): Theme {
  const stored = readStored();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/** Stable reference per state: useSyncExternalStore loops if it changes on every call. */
function getSnapshot(): Theme {
  snapshot ??= resolveTheme();
  return snapshot;
}

/** Server and hydration render: the document default, never localStorage. */
function getServerSnapshot(): Theme {
  return DEFAULT_THEME;
}

function notify() {
  for (const listener of listeners) listener();
}

/** Follow the OS preference for as long as the user has not pinned a theme. */
function handleSystemThemeChange(e: MediaQueryListEvent) {
  if (readStored()) return;
  snapshot = e.matches ? "dark" : "light";
  document.documentElement.dataset.theme = snapshot;
  notify();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", handleSystemThemeChange);
  return () => {
    listeners.delete(listener);
    mq.removeEventListener("change", handleSystemThemeChange);
  };
}

/** Pin a theme: persist it, paint it, and publish it to every subscriber. */
function setTheme(theme: Theme) {
  snapshot = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable (private mode, blocked cookies) — the theme still applies */
  }
  document.documentElement.dataset.theme = theme;
  notify();
}

function toggleTheme() {
  setTheme(getSnapshot() === "dark" ? "light" : "dark");
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // `toggleTheme` is module-level and therefore stable, so the context value
  // only changes when the theme actually does.
  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  // Always render children so content is server-rendered and indexable.
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

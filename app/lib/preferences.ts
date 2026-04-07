import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "zefer-prefs";

interface Preferences {
  ttl: number;
}

const DEFAULTS: Preferences = {
  ttl: 1440, // 24 hours
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

/**
 * Hook for persisted user preferences.
 * Starts with defaults on server, hydrates from localStorage after mount.
 */
export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);

  useEffect(() => {
    setPrefs(load());
  }, []);

  const setTtl = useCallback((ttl: number) => {
    setPrefs((prev) => {
      const next = { ...prev, ttl };
      save(next);
      return next;
    });
  }, []);

  return { ttl: prefs.ttl, setTtl };
}

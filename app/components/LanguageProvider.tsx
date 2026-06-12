"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { type Locale, type TranslationKey, t } from "@/app/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
  ready: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("zefer-lang") as Locale | null;
    if (saved && ["es", "en", "pt"].includes(saved)) {
      setLocaleState(saved);
    } else {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("es")) setLocaleState("es");
      else if (browserLang.startsWith("pt")) setLocaleState("pt");
    }
    setReady(true);
  }, []);

  // Keep <html lang> in sync with the active locale (WCAG 3.1.1)
  useEffect(() => {
    if (ready) document.documentElement.lang = locale;
  }, [locale, ready]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("zefer-lang", l);
  }, []);

  const translate = useCallback(
    (key: TranslationKey) => t(key, locale),
    [locale]
  );

  // Always render children so the page is server-rendered for crawlers (incl.
  // non-JS AI bots) and indexable. The server renders the default locale ("en"),
  // which matches the hardcoded <html lang="en"> and the initial client render,
  // keeping hydration safe; the saved/browser locale is applied after mount.
  return (
    <LanguageContext value={{ locale, setLocale, t: translate, ready }}>
      {children}
    </LanguageContext>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

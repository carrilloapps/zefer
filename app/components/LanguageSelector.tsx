"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { LOCALES, type Locale } from "@/app/lib/i18n";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = LOCALES.find((l) => l.code === locale)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-8 h-8 justify-center rounded-lg text-xs font-medium theme-muted hover:theme-heading hover:bg-[var(--glass-bg-hover)] transition-colors duration-200 cursor-pointer"
        aria-label="Select language"
      >
        <Globe className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 glass shadow-2xl overflow-hidden z-50 !rounded-xl">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLocale(l.code as Locale);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors duration-150 cursor-pointer ${
                l.code === locale
                  ? "text-primary bg-[var(--glass-bg-hover)]"
                  : "theme-muted hover:theme-heading hover:bg-[var(--glass-bg)]"
              }`}
            >
              <span className="text-xs font-mono w-5">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

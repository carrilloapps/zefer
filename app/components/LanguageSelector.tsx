"use client";

import { useState, useRef, useEffect } from "react";
import { LOCALES, type Locale } from "@/app/lib/i18n";
import { useLanguage } from "@/app/components/LanguageProvider";

const FLAGS: Record<string, React.ReactNode> = {
  es: (
    <svg viewBox="0 0 640 480" className="w-4 h-3 rounded-[2px]" aria-hidden="true">
      <rect width="640" height="480" fill="#c60b1e" />
      <rect width="640" height="240" y="120" fill="#ffc400" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 640 480" className="w-4 h-3 rounded-[2px]" aria-hidden="true">
      <rect width="640" height="480" fill="#002868" />
      <g fill="#fff">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={`s${i}`} width="640" height={480 / 13} y={(i * 2 * 480) / 13} />
        ))}
      </g>
      <g fill="#bf0a30">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={`r${i}`} width="640" height={480 / 13} y={((i * 2 + 1) * 480) / 13} />
        ))}
      </g>
      <rect width="256" height={Math.ceil((7 * 480) / 13)} fill="#002868" />
    </svg>
  ),
  pt: (
    <svg viewBox="0 0 640 480" className="w-4 h-3 rounded-[2px]" aria-hidden="true">
      <rect width="640" height="480" fill="#009b3a" />
      <polygon points="320,48 608,240 320,432 32,240" fill="#fedf00" />
      <circle cx="320" cy="240" r="80" fill="#002776" />
    </svg>
  ),
};

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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-9 h-9 justify-center rounded-lg text-xs font-medium theme-muted hover:theme-heading hover:bg-[var(--glass-bg-hover)] transition-colors duration-200 cursor-pointer"
        aria-label="Select language"
      >
        {FLAGS[locale]}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 shadow-2xl overflow-hidden z-50 !rounded-xl animate-in border border-[var(--glass-border)]" style={{ background: "var(--glass-solid)" }}>
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
              <span className="shrink-0">{FLAGS[l.code]}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

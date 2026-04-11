"use client";

import { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";

const STORAGE_KEY = "zefer-legal-accepted";

export default function LegalBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in" role="dialog" aria-live="polite" aria-label="Legal notice">
      <div className="max-w-3xl mx-auto glass-banner px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1">
          <p className="text-xs theme-text leading-relaxed mb-1 font-medium">{t("banner.title")}</p>
          <p className="text-[11px] theme-muted leading-relaxed">
            {t("banner.desc")}{" "}
            <a href="/privacy" className="text-primary hover:opacity-80 transition-opacity cursor-pointer">{t("footer.privacy")}</a>
            {" · "}
            <a href="/terms" className="text-primary hover:opacity-80 transition-opacity cursor-pointer">{t("footer.terms")}</a>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={accept}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-[var(--primary)] text-[var(--btn-text)] cursor-pointer hover:opacity-90 transition-opacity chip-select"
          >
            {t("banner.accept")}
          </button>
          <button
            onClick={accept}
            className="w-9 h-9 flex items-center justify-center rounded-lg theme-faint hover:theme-muted transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

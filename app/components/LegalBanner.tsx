"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Shield, X } from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";

const STORAGE_KEY = "zefer-legal-accepted";

// ─── External store ───
//
// Whether the notice was accepted lives in localStorage, an external system.
// Reading it through useSyncExternalStore keeps the server render and the
// hydration render on "hidden" — so the markup matches — and lets the banner
// appear right afterwards without a setState-in-effect.

let accepted: boolean | null = null;
const listeners = new Set<() => void>();

function isAccepted(): boolean {
  accepted ??= (() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return true; // storage blocked: stay out of the way
    }
  })();
  return accepted;
}

function getServerSnapshot(): boolean {
  return true;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function accept() {
  accepted = true;
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* storage unavailable — dismissing still works for this session */
  }
  for (const listener of listeners) listener();
}

export default function LegalBanner() {
  const { t } = useLanguage();
  const hidden = useSyncExternalStore(subscribe, isAccepted, getServerSnapshot);

  if (hidden) return null;

  // A complementary landmark, not a dialog: it never traps focus and the page
  // stays fully usable behind it.
  return (
    <aside className="fixed bottom-4 left-4 right-4 z-50 animate-in" aria-live="polite" aria-label={t("banner.title")}>
      <div className="max-w-3xl mx-auto glass-banner px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1">
          <p className="text-xs theme-text leading-relaxed mb-1 font-medium">{t("banner.title")}</p>
          <p className="text-[11px] theme-muted leading-relaxed">
            {t("banner.desc")}{" "}
            <Link href="/privacy" className="text-primary hover:opacity-80 transition-opacity cursor-pointer">{t("footer.privacy")}</Link>
            {" · "}
            <Link href="/terms" className="text-primary hover:opacity-80 transition-opacity cursor-pointer">{t("footer.terms")}</Link>
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
            aria-label={t("aria.close")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

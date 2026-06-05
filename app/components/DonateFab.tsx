"use client";

import { useEffect, useRef, useState } from "react";
import { Coffee, X } from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";

const BMC_URL = "https://www.buymeacoffee.com/carrilloapps";
const DISMISS_KEY = "zefer-fab-bubble-dismissed";
const FIRST_DELAY = 25_000; // first bubble after 25 s
const REPEAT_EVERY = 180_000; // then every 3 min
const VISIBLE_FOR = 9_000; // auto-hide after 9 s

/** Floating action button for Buy Me a Coffee donations.
 *  Periodically shows a small invitation bubble; closing it with the X
 *  silences the bubble for the rest of the session. */
export default function DonateFab() {
  const { t, ready } = useLanguage();
  const [bubble, setBubble] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const show = () => {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
      setBubble(true);
      hideTimer.current = setTimeout(() => setBubble(false), VISIBLE_FOR);
    };

    const first = setTimeout(show, FIRST_DELAY);
    const repeat = setInterval(show, REPEAT_EVERY);
    return () => {
      clearTimeout(first);
      clearInterval(repeat);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!ready) return null;

  function dismiss() {
    setBubble(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }

  return (
    <div className="donate-fab-wrap fixed z-40">
      {bubble && (
        <div role="status" className="absolute bottom-full right-0 mb-3 w-64 animate-in-down">
          <div className="donate-bubble rounded-2xl px-4 py-3.5" style={{ background: "var(--glass-solid)" }}>
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-xl theme-primary-faint theme-primary-border border flex items-center justify-center shrink-0 success-icon">
                <Coffee className="w-4 h-4 text-primary" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold theme-heading">{t("fab.bubble.title")}</p>
                <a
                  href={BMC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setBubble(false)}
                  className="inline-block mt-1.5 text-[11px] font-medium text-primary underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {t("fab.bubble.cta")}
                </a>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label={t("aria.close")}
                className="relative w-4 h-4 flex items-center justify-center rounded-full theme-faint hover:theme-text transition-colors cursor-pointer shrink-0 before:content-[''] before:absolute before:-inset-2"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          </div>
          {/* bubble tail */}
          <div
            className="donate-bubble-tail absolute -bottom-1 right-5 w-2.5 h-2.5 rotate-45"
            style={{ background: "var(--glass-solid)" }}
            aria-hidden="true"
          />
        </div>
      )}

      <a
        href={BMC_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("nav.donate")}
        title={t("nav.donate")}
        className="donate-fab flex items-center justify-center w-12 h-12 rounded-full bg-[var(--primary)] text-[var(--btn-text)] cursor-pointer"
      >
        <Coffee className="w-5 h-5" aria-hidden="true" />
      </a>
    </div>
  );
}

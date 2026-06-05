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
        <div role="status" className="absolute bottom-full right-0 mb-3 w-56 animate-in-down">
          <div
            className="rounded-xl border border-[var(--glass-border)] shadow-2xl px-3.5 py-3 flex items-start gap-2.5"
            style={{ background: "var(--glass-solid)" }}
          >
            <a
              href={BMC_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setBubble(false)}
              className="text-[11px] theme-text leading-relaxed flex-1 cursor-pointer hover:text-primary transition-colors"
            >
              {t("fab.bubble")}
            </a>
            <button
              type="button"
              onClick={dismiss}
              aria-label={t("aria.close")}
              className="relative w-4 h-4 flex items-center justify-center rounded-full theme-faint hover:theme-text transition-colors cursor-pointer shrink-0 before:content-[''] before:absolute before:-inset-2"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
          {/* bubble tail */}
          <div
            className="absolute -bottom-1 right-5 w-2.5 h-2.5 rotate-45 border-r border-b border-[var(--glass-border)]"
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

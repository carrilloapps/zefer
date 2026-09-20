"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/components/ThemeProvider";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [transitioning, setTransitioning] = useState(false);

  // The button is `disabled` while a transition runs, so this never re-enters.
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    root.style.setProperty("--toggle-x", `${e.clientX}px`);
    root.style.setProperty("--toggle-y", `${e.clientY}px`);

    // The theme store owns persistence and the `data-theme` attribute, so the
    // whole switch happens inside the view transition through this one call.
    const apply = toggleTheme;

    if (
      "startViewTransition" in document &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTransitioning(true);
      const transition = (document as unknown as { startViewTransition: (cb: () => void) => { finished: Promise<void> } }).startViewTransition(apply);
      transition.finished.then(() => setTransitioning(false)).catch(() => setTransitioning(false));
    } else {
      apply();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={transitioning}
      className={`flex items-center justify-center w-9 h-9 rounded-lg theme-muted hover:theme-heading transition-colors duration-200 cursor-pointer hover:bg-[var(--glass-bg-hover)] ${transitioning ? "pointer-events-none" : ""}`}
      aria-label={theme === "dark" ? t("aria.theme.light") : t("aria.theme.dark")}
    >
      {theme === "dark" ? (
        <Sun className="w-3.5 h-3.5" />
      ) : (
        <Moon className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

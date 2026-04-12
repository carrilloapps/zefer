"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [transitioning, setTransitioning] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (transitioning) return;

    const root = document.documentElement;
    root.style.setProperty("--toggle-x", `${e.clientX}px`);
    root.style.setProperty("--toggle-y", `${e.clientY}px`);

    const newTheme = theme === "dark" ? "light" : "dark";

    const apply = () => {
      root.setAttribute("data-theme", newTheme);
      localStorage.setItem("zefer-theme", newTheme);
      toggleTheme();
    };

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
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="w-3.5 h-3.5" />
      ) : (
        <Moon className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

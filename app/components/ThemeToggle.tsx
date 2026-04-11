"use client";

import { useRef } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const x = e.clientX;
    const y = e.clientY;

    root.style.setProperty("--toggle-x", `${x}px`);
    root.style.setProperty("--toggle-y", `${y}px`);

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
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(apply);
    } else {
      apply();
    }
  };

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      className="flex items-center justify-center w-9 h-9 rounded-lg theme-muted hover:theme-heading transition-colors duration-200 cursor-pointer hover:bg-[var(--glass-bg-hover)]"
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

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import PageSkeleton from "@/app/components/Skeleton";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("zefer-theme") as Theme | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("zefer-theme", theme);
  }, [theme, ready]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange(e: MediaQueryListEvent) {
      const saved = localStorage.getItem("zefer-theme");
      if (!saved) {
        setTheme(e.matches ? "dark" : "light");
      }
    }
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext value={{ theme, toggleTheme }}>
      {ready ? children : <PageSkeleton />}
    </ThemeContext>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

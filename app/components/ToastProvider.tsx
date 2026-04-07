"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/app/components/ThemeProvider";

export default function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      toastOptions={{
        className: "glass-nav !rounded-xl !text-xs !theme-text !border-[var(--glass-border)]",
        style: {
          background: "var(--nav-bg)",
          backdropFilter: "blur(40px) saturate(200%)",
          border: "1px solid var(--glass-border)",
          color: "var(--text)",
        },
      }}
      closeButton
      richColors
    />
  );
}

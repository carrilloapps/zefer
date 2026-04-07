"use client";

import { Shield, Lock, Unlock } from "lucide-react";
import type { ProgressState } from "@/app/lib/progress";
import { useLanguage } from "@/app/components/LanguageProvider";

interface Props {
  state: ProgressState;
  mode: "encrypt" | "decrypt";
}

export default function CryptoProgress({ state, mode }: Props) {
  const { t } = useLanguage();
  const percent = Math.round(state.percent);
  const isDone = state.stage === "done";

  const label = (() => {
    const key = state.label as Parameters<typeof t>[0];
    try { return t(key); } catch { return state.label; }
  })();

  return (
    <div role="status" aria-live="polite" aria-label={`${label} ${percent}%`} className={`glass p-6 sm:p-8 animate-in ${isDone ? "glow-green" : "glow-pulse"}`}>
      {/* Icon */}
      <div className="flex items-center justify-center mb-6">
        <div className={`w-14 h-14 rounded-2xl theme-primary-faint theme-primary-border border flex items-center justify-center ${isDone ? "success-icon" : "animate-pulse-slow"}`}>
          {isDone ? (
            <Shield className="w-6 h-6 text-primary" />
          ) : mode === "encrypt" ? (
            <Lock className="w-6 h-6 text-primary" />
          ) : (
            <Unlock className="w-6 h-6 text-primary" />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2.5 rounded-full bg-[var(--glass-bg)] overflow-hidden relative" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
          <div
            className={`h-full rounded-full ${isDone ? "bg-[var(--primary)]" : "progress-bar-animated"}`}
            style={{
              width: `${percent}%`,
              transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
      </div>

      {/* Stage label + percentage */}
      <div className="flex items-center justify-between">
        <p className="text-xs theme-muted" key={state.stage}>
          <span className="reveal-content inline-block">{label}</span>
        </p>
        <p className="text-sm font-mono text-primary font-semibold tabular-nums">{percent}%</p>
      </div>
    </div>
  );
}

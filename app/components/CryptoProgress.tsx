"use client";

import { Shield, Lock, Unlock } from "lucide-react";
import type { ProgressState } from "@/app/lib/progress";
import { useLanguage } from "@/app/components/LanguageProvider";

interface Props {
  state: ProgressState;
  mode: "encrypt" | "decrypt";
}

const MODE_ICON = { encrypt: Lock, decrypt: Unlock } as const;

export default function CryptoProgress({ state, mode }: Readonly<Props>) {
  const { t } = useLanguage();
  const percent = Math.round(state.percent);
  const isDone = state.stage === "done";
  const StageIcon = isDone ? Shield : MODE_ICON[mode];

  // `t` echoes unknown keys back, so a raw (non-key) label passes through.
  const label = t(state.label as Parameters<typeof t>[0]);

  return (
    <div role="status" aria-live="polite" aria-label={`${label} ${percent}%`} className={`glass p-6 sm:p-8 animate-in ${isDone ? "glow-green" : "glow-pulse"}`}>
      {/* Icon */}
      <div className="flex items-center justify-center mb-6">
        <div className={`w-14 h-14 rounded-2xl theme-primary-faint theme-primary-border border flex items-center justify-center ${isDone ? "success-icon" : "animate-pulse-slow"}`}>
          <StageIcon className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Progress bar — the native element, so assistive tech gets the value
          without a hand-rolled "progressbar" role. */}
      <div className="mb-4">
        <progress
          className={`crypto-progress ${isDone ? "crypto-progress-done" : ""}`}
          value={percent}
          max={100}
          aria-label={label}
        >
          {percent}%
        </progress>
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

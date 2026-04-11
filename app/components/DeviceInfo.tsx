"use client";

import { useState } from "react";
import { Cpu, ChevronDown, ChevronUp, Monitor, Smartphone, ExternalLink } from "lucide-react";
import { formatBytes, type DeviceLimits } from "@/app/lib/device";
import { useLanguage } from "@/app/components/LanguageProvider";

interface Props {
  limits: DeviceLimits;
}

export default function DeviceInfo({ limits }: Props) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const { profile } = limits;

  const rows: { label: string; value: string | null }[] = [
    { label: "CPU", value: `${profile.cores} cores${profile.cpuArch ? ` (${profile.cpuArch})` : ""}` },
    { label: "RAM", value: profile.ram > 0 ? `${profile.ram} GB` : null },
    { label: "GPU", value: profile.gpu },
    { label: "GPU Vendor", value: profile.gpuVendor },
    { label: "JS Heap Limit", value: profile.heapLimit ? formatBytes(profile.heapLimit) : null },
    { label: "JS Heap (used)", value: profile.heapUsed ? formatBytes(profile.heapUsed) : null },
    { label: t("device.type"), value: profile.mobile ? "Mobile" : "Desktop" },
    { label: "Platform", value: profile.platform },
  ];

  return (
    <div className="glass !rounded-xl overflow-hidden animate-in">
      {/* Summary */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors duration-200"
        aria-label={expanded ? "Hide device details" : "Show device details"}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 theme-faint" />
          <span className="text-[11px] theme-muted">{t("device.limit")}</span>
          <span className="text-[11px] font-mono font-semibold text-primary">{limits.maxFileSizeLabel}</span>
        </div>
        {expanded ? <ChevronUp className="w-3 h-3 theme-faint" /> : <ChevronDown className="w-3 h-3 theme-faint" />}
      </button>

      {/* Full details */}
      {expanded && (
        <div className="border-t border-[var(--glass-border)] animate-in-down">
          <table className="w-full">
            <tbody className="divide-y divide-[var(--glass-border)]">
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="text-[10px] theme-faint px-4 py-2 whitespace-nowrap align-top">{row.label}</td>
                  <td className="text-[10px] font-mono theme-muted px-4 py-2 text-right break-all">
                    {row.value || <span className="theme-warning">N/A</span>}
                  </td>
                </tr>
              ))}
              <tr className="bg-[var(--glass-bg)]">
                <td className="text-[10px] font-medium text-primary px-4 py-2">{t("device.limit")}</td>
                <td className="text-[11px] font-mono font-bold text-primary px-4 py-2 text-right">{limits.maxFileSizeLabel}</td>
              </tr>
            </tbody>
          </table>
          <div className="px-4 pb-3 pt-2">
            <p className="text-[9px] theme-faint leading-relaxed mb-2">{t("device.disclaimer")}</p>
            <a href="/device" className="inline-flex items-center gap-1 text-[10px] text-primary hover:opacity-80 transition-opacity cursor-pointer">
              {t("device.learnmore")} <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { ShieldAlert, ExternalLink, Clock, Target, ShieldOff } from "lucide-react";
import { PageLayout, PageHeader, GlassCard } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";

const GITHUB_URL = "https://github.com/carrilloapps/zefer/blob/main/SECURITY.md";

const IN_SCOPE = [
  "secpol.scope.in.1",
  "secpol.scope.in.2",
  "secpol.scope.in.3",
  "secpol.scope.in.4",
  "secpol.scope.in.5",
  "secpol.scope.in.6",
] as const;

const OUT_SCOPE = [
  "secpol.scope.out.1",
  "secpol.scope.out.2",
  "secpol.scope.out.3",
  "secpol.scope.out.4",
] as const;

const CRYPTO_TABLE = [
  { primitive: "secpol.crypto.symmetric" as const, algorithm: "AES-256-GCM", params: "256-bit key, 96-bit IV, 128-bit auth tag" },
  { primitive: "secpol.crypto.kdf" as const, algorithm: "PBKDF2-SHA256", params: "300k/600k/1M iterations, 256-bit salt" },
  { primitive: "secpol.crypto.answer" as const, algorithm: "PBKDF2-SHA256", params: "100,000 iterations" },
  { primitive: "secpol.crypto.random" as const, algorithm: "crypto.getRandomValues", params: "OS-level CSPRNG" },
];

export default function SecurityPolicyContent() {
  const { t } = useLanguage();

  return (
    <PageLayout>
      <PageHeader icon={ShieldAlert} badge={t("secpol.title")} title={t("secpol.title")} subtitle={t("secpol.subtitle")} />

      {/* GitHub link */}
      <GlassCard className="mb-6">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
          <ExternalLink className="w-4 h-4" />{t("secpol.viewOnGithub")}
        </a>
      </GlassCard>

      {/* Reporting */}
      <GlassCard className="mb-6">
        <h2 className="text-sm font-semibold theme-heading mb-3">{t("secpol.reporting.title")}</h2>
        <p className="text-[13px] theme-muted leading-relaxed mb-3">{t("secpol.reporting.desc")}</p>
        <ul className="space-y-1.5 text-[13px] theme-muted">
          <li>GitHub Security Advisory: <a href="https://github.com/carrilloapps/zefer/security/advisories/new" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline cursor-pointer">{t("secpol.reporting.advisory")}</a></li>
          <li>Telegram: <a href="https://t.me/carrilloapps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline cursor-pointer">@carrilloapps</a></li>
        </ul>
      </GlassCard>

      {/* What to include */}
      <GlassCard className="mb-6">
        <h2 className="text-sm font-semibold theme-heading mb-3">{t("secpol.include.title")}</h2>
        <ul className="space-y-1.5 text-[13px] theme-muted list-disc list-inside">
          <li>{t("secpol.include.1")}</li>
          <li>{t("secpol.include.2")}</li>
          <li>{t("secpol.include.3")}</li>
          <li>{t("secpol.include.4")}</li>
          <li>{t("secpol.include.5")}</li>
        </ul>
      </GlassCard>

      {/* Timeline */}
      <GlassCard className="mb-6">
        <h2 className="text-sm font-semibold theme-heading mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />{t("secpol.timeline.title")}
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between glass !rounded-lg p-3">
            <span className="text-[13px] theme-muted">{t("secpol.timeline.ack")}</span>
            <span className="text-xs font-mono text-primary">48h</span>
          </div>
          <div className="flex items-center justify-between glass !rounded-lg p-3">
            <span className="text-[13px] theme-muted">{t("secpol.timeline.assess")}</span>
            <span className="text-xs font-mono text-primary">7 days</span>
          </div>
          <div className="flex items-center justify-between glass !rounded-lg p-3">
            <span className="text-[13px] theme-muted">{t("secpol.timeline.fix")}</span>
            <span className="text-xs font-mono text-primary">ASAP</span>
          </div>
        </div>
      </GlassCard>

      {/* Scope */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <GlassCard>
          <h2 className="text-sm font-semibold theme-heading mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />{t("secpol.scope.in.title")}
          </h2>
          <ul className="space-y-2">
            {IN_SCOPE.map((k) => (
              <li key={k} className="text-[13px] theme-muted leading-relaxed flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">+</span>{t(k)}
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm font-semibold theme-heading mb-3 flex items-center gap-2">
            <ShieldOff className="w-4 h-4 theme-muted" />{t("secpol.scope.out.title")}
          </h2>
          <ul className="space-y-2">
            {OUT_SCOPE.map((k) => (
              <li key={k} className="text-[13px] theme-muted leading-relaxed flex items-start gap-2">
                <span className="theme-faint mt-0.5 shrink-0">-</span>{t(k)}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* Security architecture */}
      <GlassCard>
        <h2 className="text-sm font-semibold theme-heading mb-4">{t("secpol.architecture.title")}</h2>
        <p className="text-[13px] theme-muted leading-relaxed mb-4">{t("secpol.architecture.desc")}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2 pr-4 theme-muted font-medium">{t("secpol.crypto.primitive")}</th>
                <th className="text-left py-2 pr-4 theme-muted font-medium">{t("secpol.crypto.algorithm")}</th>
                <th className="text-left py-2 theme-muted font-medium">{t("secpol.crypto.params")}</th>
              </tr>
            </thead>
            <tbody>
              {CRYPTO_TABLE.map((row) => (
                <tr key={row.primitive} className="border-b border-[var(--border-subtle)]">
                  <td className="py-2 pr-4 theme-muted">{t(row.primitive)}</td>
                  <td className="py-2 pr-4 font-mono text-primary">{row.algorithm}</td>
                  <td className="py-2 theme-faint">{row.params}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageLayout>
  );
}

"use client";

import { Users, ExternalLink, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { PageLayout, PageHeader, GlassCard } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";

const GITHUB_URL = "https://github.com/carrilloapps/zefer/blob/main/CODE_OF_CONDUCT.md";

const POSITIVE = [
  "conduct.positive.1",
  "conduct.positive.2",
  "conduct.positive.3",
  "conduct.positive.4",
  "conduct.positive.5",
] as const;

const NEGATIVE = [
  "conduct.negative.1",
  "conduct.negative.2",
  "conduct.negative.3",
  "conduct.negative.4",
  "conduct.negative.5",
] as const;

const LEVELS = [
  { titleKey: "conduct.level.1.title" as const, impactKey: "conduct.level.1.impact" as const, consequenceKey: "conduct.level.1.consequence" as const },
  { titleKey: "conduct.level.2.title" as const, impactKey: "conduct.level.2.impact" as const, consequenceKey: "conduct.level.2.consequence" as const },
  { titleKey: "conduct.level.3.title" as const, impactKey: "conduct.level.3.impact" as const, consequenceKey: "conduct.level.3.consequence" as const },
  { titleKey: "conduct.level.4.title" as const, impactKey: "conduct.level.4.impact" as const, consequenceKey: "conduct.level.4.consequence" as const },
];

export default function ConductContent() {
  const { t } = useLanguage();

  return (
    <PageLayout>
      <PageHeader icon={Users} badge={t("conduct.title")} title={t("conduct.title")} subtitle={t("conduct.subtitle")} />

      {/* GitHub link */}
      <GlassCard className="mb-6">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
          <ExternalLink className="w-4 h-4" />{t("conduct.viewOnGithub")}
        </a>
      </GlassCard>

      {/* Pledge */}
      <GlassCard className="mb-6">
        <h2 className="text-sm font-semibold theme-heading mb-3">{t("conduct.pledge.title")}</h2>
        <p className="text-[13px] theme-muted leading-relaxed">{t("conduct.pledge.desc")}</p>
      </GlassCard>

      {/* Standards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <GlassCard>
          <h2 className="text-sm font-semibold theme-heading mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />{t("conduct.positive.title")}
          </h2>
          <ul className="space-y-2">
            {POSITIVE.map((k) => (
              <li key={k} className="text-[13px] theme-muted leading-relaxed flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">+</span>{t(k)}
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm font-semibold theme-heading mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-[var(--danger)]" />{t("conduct.negative.title")}
          </h2>
          <ul className="space-y-2">
            {NEGATIVE.map((k) => (
              <li key={k} className="text-[13px] theme-muted leading-relaxed flex items-start gap-2">
                <span className="text-[var(--danger)] mt-0.5 shrink-0">-</span>{t(k)}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* Enforcement */}
      <GlassCard className="mb-6">
        <h2 className="text-sm font-semibold theme-heading mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" />{t("conduct.enforcement.title")}
        </h2>
        <div className="space-y-4">
          {LEVELS.map((level, i) => (
            <div key={level.titleKey} className="glass !rounded-xl p-4">
              <h3 className="text-xs font-semibold theme-heading mb-1">{i + 1}. {t(level.titleKey)}</h3>
              <p className="text-[11px] theme-muted leading-relaxed"><span className="font-medium theme-text">{t("conduct.impact")}:</span> {t(level.impactKey)}</p>
              <p className="text-[11px] theme-muted leading-relaxed"><span className="font-medium theme-text">{t("conduct.consequence")}:</span> {t(level.consequenceKey)}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Reporting */}
      <GlassCard className="mb-6">
        <h2 className="text-sm font-semibold theme-heading mb-3">{t("conduct.reporting.title")}</h2>
        <p className="text-[13px] theme-muted leading-relaxed mb-3">{t("conduct.reporting.desc")}</p>
        <ul className="space-y-1.5 text-[13px] theme-muted">
          <li>GitHub: <a href="https://github.com/carrilloapps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline cursor-pointer">@carrilloapps</a></li>
          <li>Telegram: <a href="https://t.me/carrilloapps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline cursor-pointer">@carrilloapps</a></li>
        </ul>
      </GlassCard>

      {/* Attribution */}
      <GlassCard>
        <p className="text-[11px] theme-faint leading-relaxed">
          {t("conduct.attribution")}
        </p>
      </GlassCard>
    </PageLayout>
  );
}

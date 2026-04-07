"use client";

import { Monitor, Smartphone, Download, Bell, Globe, ArrowRight } from "lucide-react";
import { PageLayout, PageHeader, GlassCard, IconBox } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";

const PLATFORMS = [
  { icon: Monitor, name: "Windows" },
  { icon: Monitor, name: "macOS" },
  { icon: Monitor, name: "Linux" },
  { icon: Smartphone, name: "iOS" },
  { icon: Smartphone, name: "Android" },
];

export default function InstallContent() {
  const { t } = useLanguage();

  return (
    <PageLayout>
      <PageHeader icon={Download} badge={t("install.coming")} title={t("install.title")} subtitle={t("install.desc")} />

      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
        {PLATFORMS.map((p) => (
          <div key={p.name} className="glass glass-lift p-5 text-center animate-in">
            <p.icon className="w-7 h-7 theme-muted mx-auto mb-3" />
            <p className="text-xs font-semibold theme-heading mb-1.5">{p.name}</p>
            <span className="text-[9px] font-mono theme-warning uppercase tracking-wider theme-warning-faint px-2 py-0.5 rounded-full inline-block">
              {t("install.coming")}
            </span>
          </div>
        ))}
      </div>

      <GlassCard glow className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <IconBox icon={Globe} />
          <div className="text-left">
            <h2 className="text-sm font-semibold theme-heading">{t("install.web.title")}</h2>
            <p className="text-xs theme-muted">{t("install.web.desc")}</p>
          </div>
        </div>
        <a href="/" className="btn-primary">{t("install.web.cta")} <ArrowRight className="w-4 h-4" /></a>
      </GlassCard>

      <div className="glass p-5 flex items-start gap-3">
        <Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs theme-text mb-1 font-medium">{t("install.notify")}</p>
          <a href="https://github.com/carrilloapps/zefer" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:opacity-80 transition-opacity cursor-pointer">
            github.com/carrilloapps/zefer
          </a>
        </div>
      </div>
    </PageLayout>
  );
}

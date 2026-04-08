"use client";

import {
  Monitor, Smartphone, Download, Bell, Globe, ArrowRight,
  BookOpen, Server, Link2,
} from "lucide-react";
import Link from "next/link";
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

      {/* ─── Install as PWA ─── */}
      <GlassCard glow className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <IconBox icon={Monitor} />
          <div className="text-left">
            <h2 className="text-sm font-semibold theme-heading">{t("install.usage.pwa.title")}</h2>
            <p className="text-xs theme-muted leading-relaxed">{t("install.usage.pwa.desc")}</p>
          </div>
        </div>
      </GlassCard>

      {/* ─── Native Apps (Coming Soon) ─── */}
      <div className="mb-8">
        <h2 className="text-base font-semibold theme-heading mb-4 text-center">{t("install.native.title")}</h2>
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-5 gap-3">
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
      </div>

      {/* ─── Web CTA ─── */}
      <GlassCard glow className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <IconBox icon={Globe} />
          <div className="text-left">
            <h2 className="text-sm font-semibold theme-heading">{t("install.web.title")}</h2>
            <p className="text-xs theme-muted">{t("install.web.desc")}</p>
          </div>
        </div>
        <a href="/" className="btn-primary">{t("install.web.cta")} <ArrowRight className="w-4 h-4" /></a>
      </GlassCard>

      {/* ─── Guide links ─── */}
      <div className="mb-8">
        <h2 className="text-base font-semibold theme-heading mb-4 text-center">{t("install.guides.title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/install/guide" className="glass glass-hover glass-lift p-5 text-center animate-in cursor-pointer block">
            <BookOpen className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-xs font-semibold theme-heading mb-1">{t("install.guides.usage")}</p>
            <p className="text-[10px] theme-muted">{t("install.guides.usage.desc")}</p>
          </Link>
          <Link href="/install/guide#selfhost" className="glass glass-hover glass-lift p-5 text-center animate-in cursor-pointer block">
            <Server className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-xs font-semibold theme-heading mb-1">{t("install.usage.selfhost.title")}</p>
            <p className="text-[10px] theme-muted">{t("install.guides.selfhost.desc")}</p>
          </Link>
          <Link href="/install/guide#url" className="glass glass-hover glass-lift p-5 text-center animate-in cursor-pointer block">
            <Link2 className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-xs font-semibold theme-heading mb-1">{t("install.usage.url.title")}</p>
            <p className="text-[10px] theme-muted">{t("install.guides.url.desc")}</p>
          </Link>
        </div>
      </div>

      {/* ─── GitHub notification ─── */}
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

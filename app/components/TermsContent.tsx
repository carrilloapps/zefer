"use client";

import {
  FileText, Shield, AlertTriangle, Scale, ArrowLeft,
  Globe, Award, BookOpen,
} from "lucide-react";
import { PageLayout, PageHeader, SectionCard } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function TermsContent() {
  const { t } = useLanguage();

  const sections = [
    { icon: FileText, titleKey: "terms.service.title" as const, descKey: "terms.service.desc" as const },
    { icon: Shield, titleKey: "terms.security.title" as const, descKey: "terms.security.desc" as const },
    { icon: AlertTriangle, titleKey: "terms.liability.title" as const, descKey: "terms.liability.desc" as const },
    { icon: Scale, titleKey: "terms.use.title" as const, descKey: "terms.use.desc" as const },
    { icon: Globe, titleKey: "terms.gdpr.title" as const, descKey: "terms.gdpr.desc" as const },
    { icon: Globe, titleKey: "terms.ccpa.title" as const, descKey: "terms.ccpa.desc" as const },
    { icon: Globe, titleKey: "terms.lgpd.title" as const, descKey: "terms.lgpd.desc" as const },
    { icon: Globe, titleKey: "terms.colombia.title" as const, descKey: "terms.colombia.desc" as const },
    { icon: BookOpen, titleKey: "terms.ip.title" as const, descKey: "terms.ip.desc" as const },
    { icon: Award, titleKey: "terms.license.title" as const, descKey: "terms.license.desc" as const },
    { icon: FileText, titleKey: "terms.creator.title" as const, descKey: "terms.creator.desc" as const },
    { icon: AlertTriangle, titleKey: "terms.changes.title" as const, descKey: "terms.changes.desc" as const },
  ];

  return (
    <PageLayout>
      <PageHeader icon={Scale} badge={t("terms.badge")} title={t("terms.title")} subtitle={t("terms.subtitle")} />

      <div className="glass p-6 sm:p-8 mb-6">
        <p className="text-sm theme-text leading-relaxed">{t("terms.intro")}</p>
      </div>

      <div className="space-y-3 mb-8">
        {sections.map((s) => (
          <SectionCard key={s.titleKey} icon={s.icon} title={t(s.titleKey)} description={t(s.descKey)} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <a href="/privacy" className="text-xs text-primary hover:opacity-80 transition-opacity cursor-pointer">{t("footer.privacy")}</a>
        <span className="text-xs theme-faint">|</span>
        <a href="/" className="inline-flex items-center gap-2 text-xs theme-faint hover:theme-muted transition-colors duration-200 cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />{t("privacy.back")}
        </a>
      </div>
    </PageLayout>
  );
}

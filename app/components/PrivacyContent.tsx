"use client";

import {
  Lock,
  Shield,
  Clock,
  Database,
  Monitor,
  Key,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Globe,
  Scale,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function PrivacyContent() {
  const { t } = useLanguage();

  const sections = [
    { icon: Lock, titleKey: "privacy.encryption.title" as const, descKey: "privacy.encryption.desc" as const },
    { icon: Key, titleKey: "privacy.pbkdf2.title" as const, descKey: "privacy.pbkdf2.desc" as const },
    { icon: Shield, titleKey: "privacy.zeroknowledge.title" as const, descKey: "privacy.zeroknowledge.desc" as const },
    { icon: FileText, titleKey: "privacy.fileformat.title" as const, descKey: "privacy.fileformat.desc" as const },
    { icon: Clock, titleKey: "privacy.expiration.title" as const, descKey: "privacy.expiration.desc" as const },
    { icon: Globe, titleKey: "privacy.ip.title" as const, descKey: "privacy.ip.desc" as const },
    { icon: Database, titleKey: "privacy.metadata.title" as const, descKey: "privacy.metadata.desc" as const },
    { icon: Monitor, titleKey: "privacy.clientside.title" as const, descKey: "privacy.clientside.desc" as const },
    { icon: Scale, titleKey: "privacy.gdpr.title" as const, descKey: "privacy.gdpr.desc" as const },
  ];

  const storedNo = t("privacy.store.no.items").split("|");

  return (
    <main className="flex-1 flex flex-col">
      <Navbar />

      <section className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 mb-6 !rounded-full">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-[11px] font-medium text-primary font-mono tracking-wider">
                {t("privacy.title").toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold theme-heading mb-4 tracking-tight">
              {t("privacy.title")}
            </h1>
            <p className="text-base theme-muted max-w-2xl mx-auto leading-relaxed">
              {t("privacy.subtitle")}
            </p>
          </div>

          {/* Intro */}
          <div className="glass p-6 sm:p-8 mb-6">
            <p className="text-sm theme-text leading-relaxed">{t("privacy.intro")}</p>
          </div>

          {/* Sections */}
          <div className="space-y-3 mb-8">
            {sections.map((section) => (
              <div key={section.titleKey} className="glass glass-hover p-5 sm:p-7 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl theme-primary-faint theme-primary-border border flex items-center justify-center shrink-0 mt-0.5">
                    <section.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold theme-heading mb-2">{t(section.titleKey)}</h2>
                    <p className="text-[13px] theme-muted leading-relaxed">{t(section.descKey)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* What we store */}
          <div className="glass p-6 sm:p-8 mb-8">
            <h2 className="text-sm font-semibold theme-heading mb-6">{t("privacy.whatwestore.title")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="glass !rounded-xl p-5">
                <h3 className="text-[10px] font-mono text-primary/80 uppercase tracking-wider mb-4">{t("privacy.store.yes")}</h3>
                <p className="flex items-start gap-2 text-[13px] theme-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary/50 shrink-0 mt-0.5" />
                  {t("privacy.store.yes.items")}
                </p>
              </div>
              <div className="glass !rounded-xl p-5">
                <h3 className="text-[10px] font-mono theme-danger uppercase tracking-wider mb-4">{t("privacy.store.no")}</h3>
                <ul className="space-y-2.5">
                  {storedNo.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] theme-muted">
                      <XCircle className="w-3.5 h-3.5 theme-danger opacity-60 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Legal links */}
          <div className="glass p-6 sm:p-8 mb-8">
            <h2 className="text-sm font-semibold theme-heading mb-4">{t("privacy.legal.title")}</h2>
            <p className="text-[13px] theme-muted leading-relaxed mb-4">{t("privacy.legal.desc")}</p>
            <a href="/terms" className="inline-flex items-center gap-1.5 text-xs text-primary hover:opacity-80 transition-opacity cursor-pointer">
              {t("privacy.legal.terms")}
              <ArrowLeft className="w-3 h-3 rotate-180" />
            </a>
          </div>

          {/* Back */}
          <div className="text-center">
            <a href="/" className="inline-flex items-center gap-2 text-xs theme-faint hover:theme-muted transition-colors duration-200 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
              {t("privacy.back")}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Unlock, BookOpen, Bot, Download } from "lucide-react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import EncryptForm from "@/app/components/EncryptForm";
import DecryptForm from "@/app/components/DecryptForm";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePreferences } from "@/app/lib/preferences";

export default function HomeContent() {
  const { t } = useLanguage();
  const { tab, setTab } = usePreferences();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlTab = searchParams.get("tab") || searchParams.get("t");
    if (urlTab === "encrypt" || urlTab === "decrypt") setTab(urlTab);
  }, [searchParams, setTab]);

  return (
    <main className="flex-1 flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-6 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 mb-6 !rounded-full">
            <Lock className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-medium text-primary font-mono tracking-wider">
              {t("hero.badge")}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold theme-heading mb-4 tracking-tight leading-[1.1]">
            {t("hero.title")}{" "}
            <span className="theme-gradient-text">
              {t("hero.title.highlight")}
            </span>
          </h1>
          <p className="text-base sm:text-lg theme-muted max-w-lg mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 mb-6">
          <div className="glass !rounded-xl p-1 flex">
            <button
              onClick={() => setTab("encrypt")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium chip-select cursor-pointer ${
                tab === "encrypt"
                  ? "bg-[var(--primary)] text-[var(--btn-text)] shadow-sm"
                  : "theme-muted hover:theme-text"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              {t("tab.encrypt")}
            </button>
            <button
              onClick={() => setTab("decrypt")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium chip-select cursor-pointer ${
                tab === "decrypt"
                  ? "bg-[var(--primary)] text-[var(--btn-text)] shadow-sm"
                  : "theme-muted hover:theme-text"
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              {t("tab.decrypt")}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto px-4">
          {tab === "encrypt" ? <EncryptForm /> : <DecryptForm />}
        </div>
      </section>

      {/* Quick steps */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-3">
            {[
              { num: "01", title: t("steps.1.title") },
              { num: "02", title: t("steps.2.title") },
              { num: "03", title: t("steps.3.title") },
            ].map((s) => (
              <div key={s.num} className="glass glass-lift p-4 text-center">
                <span className="text-lg font-bold theme-faint font-mono">{s.num}</span>
                <p className="text-xs theme-muted mt-1">{s.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="pb-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2">
          <Link href="/install/guide" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
            <BookOpen className="w-3 h-3" />{t("home.guide")}
          </Link>
          <Link href="/install" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
            <Download className="w-3 h-3" />{t("home.install")}
          </Link>
          <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
            <Bot className="w-3 h-3" />llms.txt
          </a>
          <a href="/agents.md" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
            <Bot className="w-3 h-3" />agents.md
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}

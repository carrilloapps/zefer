"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Unlock, BookOpen, Bot, Download, Shield, Code, Cpu } from "lucide-react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import EncryptForm from "@/app/components/EncryptForm";
import DecryptForm from "@/app/components/DecryptForm";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePreferences } from "@/app/lib/preferences";
import type { TranslationKey } from "@/app/lib/i18n";

const ROTATE_KEYS: TranslationKey[] = [
  "hero.rotate.1",
  "hero.rotate.2",
  "hero.rotate.3",
  "hero.rotate.4",
  "hero.rotate.5",
];

function useTypewriter(phrases: string[], enabled: boolean) {
  const [display, setDisplay] = useState(phrases[0] ?? "");
  const [showCursor, setShowCursor] = useState(true);
  const phrasesRef = useRef(phrases);
  phrasesRef.current = phrases;

  useEffect(() => {
    if (!enabled || phrasesRef.current.length === 0) {
      setDisplay(phrasesRef.current[0] ?? "");
      setShowCursor(false);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let phraseIdx = 0;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(() => { if (!cancelled) resolve(); }, ms);
      });

    async function run() {
      setDisplay(phrasesRef.current[0] ?? "");
      await wait(3000);

      while (!cancelled) {
        const list = phrasesRef.current;
        const current = list[phraseIdx % list.length];
        const next = list[(phraseIdx + 1) % list.length];

        // Delete
        for (let i = current.length; i >= 0 && !cancelled; i--) {
          setDisplay(current.slice(0, i));
          await wait(30 + Math.random() * 20);
        }

        if (cancelled) break;
        await wait(400);

        // Type
        for (let i = 0; i <= next.length && !cancelled; i++) {
          setDisplay(next.slice(0, i));
          await wait(50 + Math.random() * 40);
        }

        if (cancelled) break;
        phraseIdx++;
        await wait(3000);
      }
    }

    run();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [enabled]);

  // Cursor blink
  useEffect(() => {
    if (!enabled) { setShowCursor(false); return; }
    const id = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(id);
  }, [enabled]);

  return { display, showCursor };
}

export default function HomeContent() {
  const { t } = useLanguage();
  const { tab, setTab } = usePreferences();
  const searchParams = useSearchParams();
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const phrases = ROTATE_KEYS.map((k) => t(k));
  const { display, showCursor } = useTypewriter(phrases, !reduceMotion);

  useEffect(() => {
    const urlTab = searchParams.get("tab") || searchParams.get("t");
    if (urlTab === "encrypt" || urlTab === "decrypt") setTab(urlTab);
  }, [searchParams, setTab]);

  return (
    <main className="flex-1 flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-6 px-4 sm:px-6 hero-glow">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 mb-6 !rounded-full">
            <Lock className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-medium text-primary font-mono tracking-wider">
              {t("hero.badge")}
            </span>
          </div>
          <h1 className="font-bold theme-heading mb-4 tracking-tight">
            <span className="sr-only">Zefer: {t("hero.title")} {t("hero.title.highlight")}</span>
            <span className="block text-[clamp(2.75rem,8vw,4.5rem)] leading-none hero-brand-text" aria-hidden="true">
              Zefer
            </span>
            <span className="block text-[clamp(1.375rem,3.5vw,2rem)] leading-snug mt-2" aria-hidden="true">
              {t("hero.title")}{" "}
              <span className="theme-gradient-text">{display}</span>
              <span className={`inline-block w-[2px] h-[1.1em] bg-[var(--gradient-from)] align-middle ml-0.5 ${showCursor ? "opacity-100" : "opacity-0"}`} />
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
          <h2 className="text-sm font-semibold theme-heading text-center mb-4">{t("steps.title")}</h2>
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
        <div className="max-w-2xl mx-auto">
          <h2 className="text-sm font-semibold theme-heading text-center mb-4">{t("home.resources")}</h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href="/how" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
              <Shield className="w-3 h-3" />{t("home.how")}
            </Link>
            <Link href="/install/guide" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
              <BookOpen className="w-3 h-3" />{t("home.guide")}
            </Link>
            <Link href="/install" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
              <Download className="w-3 h-3" />{t("home.install")}
            </Link>
            <Link href="/project" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
              <Code className="w-3 h-3" />{t("home.project")}
            </Link>
            <Link href="/device" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
              <Cpu className="w-3 h-3" />{t("home.device")}
            </Link>
            <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
              <Bot className="w-3 h-3" />llms.txt
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

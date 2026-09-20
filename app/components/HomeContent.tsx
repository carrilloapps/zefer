"use client";

import { useEffect, useState, useRef, useMemo, useSyncExternalStore } from "react";
import { useUrlParams } from "@/app/lib/useUrlParams";
import { Lock, Unlock, BookOpen, Bot, Download, Shield, Code, Cpu, KeyRound, FileSearch, Terminal, Library } from "lucide-react";
import Link from "next/link";
import { Tabs } from "radix-ui";
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

// ─── Reduced-motion store ───
//
// The OS motion preference is an external system, so it is read through
// useSyncExternalStore: the server render and the hydration render both see
// `true` (no animation, matching the static markup), and the real preference
// arrives right after without a setState-in-effect.
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function getReduceMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION).matches;
}

/** Server and hydration render: assume reduced motion, the safe default. */
function getServerReduceMotion(): boolean {
  return true;
}

function subscribeReduceMotion(listener: () => void): () => void {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", listener);
  return () => mq.removeEventListener("change", listener);
}

/** Deterministic per-character jitter: keeps the typing rhythm human without
 *  a pseudorandom generator. */
function jitter(step: number, base: number, spread: number): number {
  return base + ((step * 7) % spread);
}

function useTypewriter(phrases: string[], enabled: boolean) {
  const langKey = phrases[0];
  const [display, setDisplay] = useState(langKey);
  const [showCursor, setShowCursor] = useState(true);
  const phrasesRef = useRef(phrases);
  phrasesRef.current = phrases;

  useEffect(() => {
    if (!enabled) {
      setDisplay(phrasesRef.current[0]);
      setShowCursor(false);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let phraseIdx = 0;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        // The cleanup below clears the pending timer, so a cancelled wait
        // simply never resolves and the loop stops where it stands.
        timer = setTimeout(resolve, ms);
      });

    async function run() {
      setDisplay(phrasesRef.current[0]);
      await wait(3000);

      while (!cancelled) {
        const list = phrasesRef.current;
        const current = list[phraseIdx % list.length];
        const next = list[(phraseIdx + 1) % list.length];

        // Delete
        for (let i = current.length; i >= 0 && !cancelled; i--) {
          setDisplay(current.slice(0, i));
          await wait(jitter(i, 30, 20));
        }

        if (cancelled) break;
        await wait(400);

        // Type
        for (let i = 0; i <= next.length && !cancelled; i++) {
          setDisplay(next.slice(0, i));
          await wait(jitter(i, 50, 40));
        }

        if (cancelled) break;
        phraseIdx++;
        await wait(3000);
      }
    }

    run();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [enabled, langKey]);

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
  const searchParams = useUrlParams();
  const reduceMotion = useSyncExternalStore(
    subscribeReduceMotion,
    getReduceMotion,
    getServerReduceMotion
  );

  const phrases = useMemo(() => ROTATE_KEYS.map((k) => t(k)), [t]);
  const { display, showCursor } = useTypewriter(phrases, !reduceMotion);

  // Apply the ?t= URL param to the initial tab EXACTLY ONCE. Re-running this
  // (e.g. with `tab` in deps) would keep re-asserting the URL value and revert
  // any later user switch; running it unconditionally every render would loop
  // infinitely, since usePreferences returns a fresh setTab each render.
  const urlTabApplied = useRef(false);
  useEffect(() => {
    if (!searchParams || urlTabApplied.current) return;
    urlTabApplied.current = true;
    const urlTab = searchParams.get("tab") || searchParams.get("t");
    if (urlTab === "encrypt" || urlTab === "decrypt") setTab(urlTab);
  }, [searchParams, setTab]);

  // useUrlParams only reads on mount, so the keyboard shortcuts (E/D) switch the
  // tab in-place via this event when the home page is already mounted.
  useEffect(() => {
    function onSetTab(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === "encrypt" || detail === "decrypt") setTab(detail);
    }
    window.addEventListener("zefer:set-tab", onSetTab);
    return () => window.removeEventListener("zefer:set-tab", onSetTab);
  }, [setTab]);

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
          <p className="text-base sm:text-lg theme-muted max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Tabs — Radix supplies the tablist/tab/tabpanel wiring and arrow-key
            navigation the plain buttons never had; `tab` stays the single
            source of truth, so `?t=` and the persisted preference still win. */}
        <Tabs.Root value={tab} onValueChange={(v) => setTab(v as "encrypt" | "decrypt")}>
          <div className="max-w-3xl mx-auto px-4 mb-6">
            <Tabs.List className="glass !rounded-xl p-1 flex" aria-label={t("hero.badge")}>
              <Tabs.Trigger
                value="encrypt"
                className="tab-trigger flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium chip-select cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                {t("tab.encrypt")}
              </Tabs.Trigger>
              <Tabs.Trigger
                value="decrypt"
                className="tab-trigger flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium chip-select cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                {t("tab.decrypt")}
              </Tabs.Trigger>
            </Tabs.List>
          </div>

          {/* Form */}
          <div className="max-w-3xl mx-auto px-4">
            <Tabs.Content value="encrypt"><EncryptForm /></Tabs.Content>
            <Tabs.Content value="decrypt"><DecryptForm /></Tabs.Content>
          </div>
        </Tabs.Root>
      </section>

      {/* Quick steps */}
      <section className="py-12 px-4 sm:px-6 below-fold">
        <div className="max-w-3xl mx-auto">
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
      <section className="pb-12 px-4 sm:px-6 below-fold">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-sm font-semibold theme-heading text-center mb-4">{t("home.resources")}</h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href="/how" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
              <Shield className="w-3 h-3" />{t("home.how")}
            </Link>
            <Link href="/generator" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
              <KeyRound className="w-3 h-3" />{t("nav.generator")}
            </Link>
            <Link href="/analyzer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
              <FileSearch className="w-3 h-3" />{t("nav.analyzer")}
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
            <Link href="/mcp" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
              <Bot className="w-3 h-3" />{t("nav.mcp")}
            </Link>
            <Link href="/install" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
              <Terminal className="w-3 h-3" />{t("nav.cli")}
            </Link>
            <Link href="/library" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] theme-muted hover:text-primary hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer border border-[var(--glass-border)]">
              <Library className="w-3 h-3" />{t("nav.library")}
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

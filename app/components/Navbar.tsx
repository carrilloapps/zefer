"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Shield, User, Code, Download, BookOpen, Cpu,
  Lock, Scale, Users, ShieldAlert, ChevronRight, ExternalLink,
  KeyRound, FileSearch, ChevronDown, Plug,
} from "lucide-react";
import LanguageSelector from "@/app/components/LanguageSelector";
import ThemeToggle from "@/app/components/ThemeToggle";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function Navbar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [projOpen, setProjOpen] = useState(false);

  const close = useCallback(() => { setOpen(false); setProjOpen(false); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarW}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => { document.body.style.overflow = ""; document.body.style.paddingRight = ""; };
  }, [open]);

  return (
    <>
      {/* ─── Mobile header (persistent, scroll-aware liquid glass) ─── */}
      <nav className={`sm:hidden fixed top-0 left-0 right-0 z-[80] nav-mobile-header ${scrolled || open ? "nav-elevated" : ""}`}>
        <div className="nav-mobile-safe-top" />
        <div className="flex items-center justify-between px-4 h-12">
          <Link href="/" onClick={close} className="flex items-center gap-2.5 cursor-pointer">
            <span className="w-7 h-7 rounded-lg theme-primary-faint theme-primary-border border flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-primary" />
            </span>
            <span className="font-semibold theme-heading tracking-tight text-[15px]">Zefer</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full theme-primary-faint theme-primary-border border" aria-hidden="true">
              <span className="inline-block w-1 h-1 rounded-full bg-primary animate-pulse" />
              <span className="text-[8px] text-primary font-mono tracking-widest">E2E</span>
            </span>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="nav-burger flex items-center justify-center w-10 h-10 -mr-1.5 rounded-full theme-text active:bg-[var(--glass-bg)] transition-colors duration-100 cursor-pointer"
            aria-label={open ? t("nav.close") : t("nav.menu")}
            aria-expanded={open}
            aria-controls="mobile-drawer"
          >
            <span className="nav-burger-line" aria-hidden="true" />
            <span className="nav-burger-line" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* ─── Desktop header (floating glass pill) ─── */}
      <nav className="hidden sm:block fixed top-4 left-4 right-4 z-50">
        <div className="max-w-5xl mx-auto glass-nav px-4 lg:px-5 py-2.5 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 cursor-pointer group shrink-0">
            <div className="w-7 h-7 rounded-lg theme-primary-faint theme-primary-border border flex items-center justify-center group-hover:opacity-80 transition-opacity duration-200">
              <Shield className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-semibold theme-heading tracking-tight text-sm">Zefer</span>
          </Link>

          <div className="flex items-center gap-0.5 lg:gap-1 min-w-0">
            <Link href="/how" className="px-2 lg:px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] whitespace-nowrap">
              {t("steps.title")}
            </Link>
            <Link href="/generator" className="px-2 lg:px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] flex items-center gap-1 whitespace-nowrap">
              <KeyRound className="w-3 h-3 shrink-0" />{t("nav.generator")}
            </Link>
            <Link href="/analyzer" className="px-2 lg:px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] flex items-center gap-1 whitespace-nowrap">
              <FileSearch className="w-3 h-3 shrink-0" />{t("nav.analyzer")}
            </Link>
            <Link href="/mcp" className="px-2 lg:px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] flex items-center gap-1 whitespace-nowrap">
              <Plug className="w-3 h-3 shrink-0" />{t("nav.mcp")}
            </Link>
            <ProjectMenu />
            <Link href="/install" className="px-2 lg:px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] flex items-center gap-1 whitespace-nowrap">
              <Download className="w-3 h-3 shrink-0" />{t("nav.install")}
            </Link>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full theme-primary-faint theme-primary-border border">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] text-primary font-mono tracking-wide">{t("nav.encrypted")}</span>
            </div>
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>
      </nav>

      {/* ─── Mobile drawer (full-screen, native feel) ─── */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 sm:hidden ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={close}
        aria-hidden="true"
      />

      <div
        id="mobile-drawer"
        className={`fixed inset-0 z-[70] drawer-bg flex flex-col transition-transform duration-300 ease-out sm:hidden ${open ? "translate-y-0 drawer-open" : "translate-y-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.menu")}
      >
        {/* Clearance for the persistent header */}
        <div className="nav-mobile-safe-top" />
        <div className="h-12 shrink-0" />

        {/* Scrollable links — groups reveal with stagger */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
          <Link
            href="/?t=encrypt"
            onClick={close}
            className="drawer-stagger btn-primary mb-4 !h-12"
            style={{ "--stagger": "0.03s" } as React.CSSProperties}
          >
            <Lock className="w-4 h-4" />{t("encrypt.title")}
          </Link>

          <div className="drawer-group drawer-stagger mb-3" style={{ "--stagger": "0.07s" } as React.CSSProperties}>
            <DrawerLink href="/" icon={Shield} label={t("nav.home")} onClick={close} />
            <DrawerLink href="/how" icon={Lock} label={t("nav.how")} onClick={close} />
            <DrawerLink href="/device" icon={Cpu} label={t("nav.device")} onClick={close} />
            {/* Proyecto accordion: project + donate + author */}
            <button
              type="button"
              onClick={() => setProjOpen(!projOpen)}
              aria-expanded={projOpen}
              aria-controls="drawer-project-group"
              className="drawer-row w-full flex items-center gap-3 px-4 h-12 text-[15px] theme-text cursor-pointer active:bg-[var(--glass-bg-hover)] transition-colors duration-100"
            >
              <Code className="w-[18px] h-[18px] text-primary shrink-0" />
              <span className="flex-1 text-left leading-tight">{t("nav.dev")}</span>
              <ChevronDown className={`w-3.5 h-3.5 theme-faint shrink-0 transition-transform duration-200 ${projOpen ? "rotate-180" : ""}`} />
            </button>
            {projOpen && (
              <div id="drawer-project-group" className="animate-in">
                <Link href="/project" onClick={close} className="drawer-row flex items-center gap-3 pl-12 pr-4 h-11 text-sm theme-muted cursor-pointer active:bg-[var(--glass-bg-hover)] transition-colors duration-100">
                  <Code className="w-4 h-4 text-primary shrink-0" />
                  <span className="flex-1">{t("nav.projectinfo")}</span>
                  <ChevronRight className="w-3.5 h-3.5 theme-faint shrink-0" />
                </Link>
                <a href="https://github.com/carrilloapps" target="_blank" rel="noopener noreferrer" onClick={close} className="drawer-row flex items-center gap-3 pl-12 pr-4 h-11 text-sm theme-muted cursor-pointer active:bg-[var(--glass-bg-hover)] transition-colors duration-100">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <span className="flex-1">{t("nav.author")}</span>
                  <ExternalLink className="w-3.5 h-3.5 theme-faint shrink-0" />
                </a>
              </div>
            )}
          </div>

          <p className="drawer-stagger text-[10px] font-mono theme-muted uppercase tracking-wider px-4 mb-1.5 mt-1" style={{ "--stagger": "0.11s" } as React.CSSProperties}>{t("nav.tools")}</p>
          <div className="drawer-group drawer-stagger mb-3" style={{ "--stagger": "0.13s" } as React.CSSProperties}>
            <DrawerLink href="/generator" icon={KeyRound} label={t("nav.generator")} onClick={close} />
            <DrawerLink href="/analyzer" icon={FileSearch} label={t("nav.analyzer")} onClick={close} />
            <DrawerLink href="/mcp" icon={Plug} label={t("nav.mcp")} onClick={close} />
          </div>

          <div className="drawer-group drawer-stagger mb-3" style={{ "--stagger": "0.17s" } as React.CSSProperties}>
            <DrawerLink href="/install" icon={Download} label={t("nav.install")} badge={t("install.coming")} onClick={close} />
            <DrawerLink href="/install/guide" icon={BookOpen} label={t("nav.guide")} onClick={close} />
          </div>

          <p className="drawer-stagger text-[10px] font-mono theme-muted uppercase tracking-wider px-4 mb-1.5 mt-1" style={{ "--stagger": "0.21s" } as React.CSSProperties}>{t("footer.legal")}</p>
          <div className="drawer-group drawer-stagger mb-3" style={{ "--stagger": "0.23s" } as React.CSSProperties}>
            <DrawerLink href="/privacy" icon={Scale} label={t("nav.privacy")} onClick={close} />
            <DrawerLink href="/security" icon={ShieldAlert} label={t("footer.securitypolicy")} onClick={close} />
            <DrawerLink href="/conduct" icon={Users} label={t("nav.conduct")} onClick={close} />
          </div>

        </div>

        {/* Bottom bar */}
        <div className="drawer-stagger px-4 py-2.5 border-t border-[var(--glass-border)] flex items-center justify-between gap-3" style={{ "--stagger": "0.31s" } as React.CSSProperties}>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <LanguageSelector />
          </div>
          <p className="text-[10px] theme-faint truncate">
            &copy; {new Date().getFullYear()} José Carrillo
          </p>
        </div>
        <div className="nav-mobile-safe-bottom" />
      </div>
    </>
  );
}

/** Desktop "Proyecto" dropdown grouping project, donate and author links */
function ProjectMenu() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const itemCls = "w-full flex items-center gap-2.5 px-3 py-2.5 text-xs theme-muted hover:theme-heading hover:bg-[var(--glass-bg)] transition-colors duration-150 cursor-pointer whitespace-nowrap";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("nav.dev")}
        className="px-2 lg:px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] flex items-center gap-1 whitespace-nowrap"
      >
        <Code className="w-3 h-3 shrink-0" />{t("nav.dev")}
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="menu" className="absolute left-0 top-full mt-2 w-52 shadow-2xl z-50 !rounded-xl overflow-hidden animate-in border border-[var(--glass-border)]" style={{ background: "var(--glass-solid)" }}>
          <Link href="/project" role="menuitem" onClick={() => setOpen(false)} className={itemCls}>
            <Code className="w-3.5 h-3.5 text-primary shrink-0" />{t("nav.projectinfo")}
          </Link>
          <a href="https://github.com/carrilloapps" target="_blank" rel="noopener noreferrer" role="menuitem" onClick={() => setOpen(false)} className={itemCls}>
            <User className="w-3.5 h-3.5 text-primary shrink-0" />{t("nav.author")}
            <ExternalLink className="w-3 h-3 theme-faint ml-auto" />
          </a>
        </div>
      )}
    </div>
  );
}

function DrawerLink({
  href,
  icon: Icon,
  label,
  badge,
  external,
  onClick,
}: {
  href: string;
  icon: typeof Shield;
  label: string;
  badge?: string;
  external?: boolean;
  onClick: () => void;
}) {
  const className =
    "drawer-row flex items-center gap-3 px-4 h-12 text-[15px] theme-text cursor-pointer active:bg-[var(--glass-bg-hover)] transition-colors duration-100";
  const inner = (
    <>
      <Icon className="w-[18px] h-[18px] text-primary shrink-0" />
      <span className="flex-1 leading-tight">{label}</span>
      {badge && (
        <span className="text-[9px] font-mono font-bold theme-warning px-1.5 py-0.5 rounded-md theme-warning-faint leading-none">{badge}</span>
      )}
      {external ? (
        <ExternalLink className="w-3.5 h-3.5 theme-faint shrink-0" />
      ) : (
        <ChevronRight className="w-3.5 h-3.5 theme-faint shrink-0" />
      )}
    </>
  );

  // Internal routes use next/link for instant client-side navigation
  // (no full reload, no language/theme flash); external links stay as <a>.
  return external ? (
    <a href={href} onClick={onClick} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={href} onClick={onClick} className={className}>
      {inner}
    </Link>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield, Heart, User, Code, Download, Menu, X, BookOpen, Cpu,
  Lock, Scale, Users, ShieldAlert, ChevronRight, ExternalLink,
} from "lucide-react";
import LanguageSelector from "@/app/components/LanguageSelector";
import ThemeToggle from "@/app/components/ThemeToggle";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function Navbar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

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
      {/* ─── Mobile header (native app bar) ─── */}
      <nav className="sm:hidden fixed top-0 left-0 right-0 z-50 nav-mobile-header">
        <div className="nav-mobile-safe-top" />
        <div className="flex items-center justify-between px-4 h-12">
          <a href="/" className="flex items-center gap-2.5 cursor-pointer">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold theme-heading tracking-tight text-[15px]">Zefer</span>
          </a>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center w-10 h-10 -mr-1.5 rounded-full theme-muted active:bg-[var(--glass-bg)] transition-colors duration-100 cursor-pointer"
            aria-label={t("nav.menu")}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* ─── Desktop header (floating glass pill) ─── */}
      <nav className="hidden sm:block fixed top-4 left-4 right-4 z-50">
        <div className="max-w-5xl mx-auto glass-nav px-4 lg:px-5 py-2.5 flex items-center justify-between gap-2 overflow-hidden">
          <a href="/" className="flex items-center gap-2 cursor-pointer group shrink-0">
            <div className="w-7 h-7 rounded-lg theme-primary-faint theme-primary-border border flex items-center justify-center group-hover:opacity-80 transition-opacity duration-200">
              <Shield className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-semibold theme-heading tracking-tight text-sm">Zefer</span>
          </a>

          <div className="flex items-center gap-0.5 lg:gap-1 min-w-0">
            <a href="/how" className="px-2 lg:px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] whitespace-nowrap">
              {t("steps.title")}
            </a>
            <a href="/project" className="px-2 lg:px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] flex items-center gap-1 whitespace-nowrap">
              <Code className="w-3 h-3 shrink-0" />{t("nav.project")}
            </a>
            <a href="https://www.buymeacoffee.com/carrilloapps" target="_blank" rel="noopener noreferrer" className="hidden lg:flex px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] items-center gap-1 whitespace-nowrap">
              <Heart className="w-3 h-3 shrink-0" />{t("nav.donate")}
            </a>
            <a href="https://github.com/carrilloapps" target="_blank" rel="noopener noreferrer" className="hidden lg:flex px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] items-center gap-1 whitespace-nowrap">
              <User className="w-3 h-3 shrink-0" />{t("nav.author")}
            </a>
            <a href="/install" className="px-2 lg:px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] flex items-center gap-1 whitespace-nowrap">
              <Download className="w-3 h-3 shrink-0" />{t("nav.install")}
            </a>
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
        className={`fixed inset-0 z-[70] drawer-bg flex flex-col transition-transform duration-300 ease-out sm:hidden ${open ? "translate-y-0" : "translate-y-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.menu")}
      >
        {/* Handle + header */}
        <div className="nav-mobile-safe-top" />
        <div className="flex flex-col items-center pt-2 pb-1 px-4">
          <div className="w-9 h-1 rounded-full bg-[var(--glass-border)] mb-3" />
          <div className="w-full flex items-center justify-between h-12">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <span className="font-semibold theme-heading text-[15px] block leading-tight">Zefer</span>
                <span className="text-[10px] text-primary font-mono">{t("nav.encrypted")}</span>
              </div>
            </div>
            <button
              onClick={close}
              className="flex items-center justify-center w-10 h-10 -mr-1.5 rounded-full bg-[var(--glass-bg)] theme-muted active:bg-[var(--glass-bg-hover)] transition-colors duration-100 cursor-pointer"
              aria-label={t("nav.close")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable links */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="drawer-group mb-3">
            <DrawerLink href="/" icon={Shield} label={t("nav.home")} onClick={close} />
            <DrawerLink href="/how" icon={Lock} label={t("nav.how")} onClick={close} />
            <DrawerLink href="/device" icon={Cpu} label={t("nav.device")} onClick={close} />
            <DrawerLink href="/project" icon={Code} label={t("nav.project")} onClick={close} />
          </div>

          <div className="drawer-group mb-3">
            <DrawerLink href="/install" icon={Download} label={t("nav.install")} badge={t("install.coming")} onClick={close} />
            <DrawerLink href="/install/guide" icon={BookOpen} label={t("nav.guide")} onClick={close} />
          </div>

          <p className="text-[10px] font-mono theme-muted uppercase tracking-wider px-4 mb-1.5 mt-1">{t("footer.legal")}</p>
          <div className="drawer-group mb-3">
            <DrawerLink href="/privacy" icon={Scale} label={t("nav.privacy")} onClick={close} />
            <DrawerLink href="/security" icon={ShieldAlert} label={t("footer.securitypolicy")} onClick={close} />
            <DrawerLink href="/conduct" icon={Users} label={t("nav.conduct")} onClick={close} />
          </div>

          <div className="drawer-group">
            <DrawerLink href="https://www.buymeacoffee.com/carrilloapps" icon={Heart} label={t("nav.donate")} external onClick={close} />
            <DrawerLink href="https://github.com/carrilloapps" icon={User} label={t("nav.author")} external onClick={close} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-4 py-2.5 border-t border-[var(--glass-border)] flex items-center justify-between gap-3">
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
  return (
    <a
      href={href}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="drawer-row flex items-center gap-3 px-4 h-12 text-[15px] theme-text cursor-pointer active:bg-[var(--glass-bg-hover)] transition-colors duration-100"
    >
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
    </a>
  );
}

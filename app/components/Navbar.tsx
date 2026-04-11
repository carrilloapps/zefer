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
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      <div className="max-w-5xl mx-auto glass-nav px-4 sm:px-5 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-lg theme-primary-faint theme-primary-border border flex items-center justify-center group-hover:opacity-80 transition-opacity duration-200">
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-semibold theme-heading tracking-tight text-sm">Zefer</span>
        </a>

        {/* Center: Desktop nav links */}
        <div className="hidden sm:flex items-center gap-1">
          <a href="/how" className="px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)]">
            {t("steps.title")}
          </a>
          <a href="/project" className="px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] flex items-center gap-1">
            <Code className="w-3 h-3" />{t("nav.project")}
          </a>
          <a href="https://www.buymeacoffee.com/carrilloapps" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] flex items-center gap-1">
            <Heart className="w-3 h-3" />{t("nav.donate")}
          </a>
          <a href="https://github.com/carrilloapps" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] flex items-center gap-1">
            <User className="w-3 h-3" />{t("nav.author")}
          </a>
          <a href="/install" className="px-3 py-1.5 text-xs theme-muted hover:theme-text transition-colors duration-200 cursor-pointer rounded-lg hover:bg-[var(--glass-bg)] flex items-center gap-1.5">
            <Download className="w-3 h-3" />{t("nav.install")}
            <span className="text-[8px] font-mono font-bold theme-warning px-1 py-0.5 rounded theme-warning-faint leading-none">{t("install.coming")}</span>
          </a>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full theme-primary-faint theme-primary-border border">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-primary/70 font-mono tracking-wide">{t("nav.encrypted")}</span>
          </div>
          {/* Desktop only controls */}
          <div className="hidden sm:flex items-center gap-1.5">
            <ThemeToggle />
            <LanguageSelector />
          </div>
          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="flex sm:hidden items-center justify-center w-9 h-9 rounded-lg theme-muted hover:theme-heading transition-colors duration-200 cursor-pointer hover:bg-[var(--glass-bg-hover)]"
            aria-label={t("nav.menu")}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Mobile full-screen drawer ── */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 sm:hidden ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={close}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-0 z-[70] drawer-bg flex flex-col transition-transform duration-300 sm:hidden ${open ? "translate-y-0" : "translate-y-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.menu")}
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Native-style handle + header */}
        <div className="flex flex-col items-center pt-3 pb-2 px-5">
          <div className="w-10 h-1 rounded-full bg-[var(--glass-border)] mb-4" />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl theme-primary-faint theme-primary-border border flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="font-semibold theme-heading text-base block leading-tight">Zefer</span>
                <span className="text-[10px] text-primary/60 font-mono">{t("nav.encrypted")}</span>
              </div>
            </div>
            <button
              onClick={close}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--glass-bg)] theme-muted hover:theme-heading transition-colors duration-200 cursor-pointer"
              aria-label={t("nav.close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable links */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
          {/* Product group */}
          <div className="drawer-group mb-3">
            <DrawerLink href="/" icon={Shield} label={t("nav.home")} onClick={close} />
            <DrawerLink href="/how" icon={Lock} label={t("nav.how")} onClick={close} />
            <DrawerLink href="/device" icon={Cpu} label={t("nav.device")} onClick={close} />
            <DrawerLink href="/project" icon={Code} label={t("nav.project")} onClick={close} />
          </div>

          {/* Install group */}
          <div className="drawer-group mb-3">
            <DrawerLink href="/install" icon={Download} label={t("nav.install")} badge={t("install.coming")} onClick={close} />
            <DrawerLink href="/install/guide" icon={BookOpen} label={t("nav.guide")} onClick={close} />
          </div>

          {/* Legal & Security group */}
          <p className="text-[10px] font-mono theme-faint uppercase tracking-wider px-4 mb-1.5 mt-2">{t("footer.legal")}</p>
          <div className="drawer-group mb-3">
            <DrawerLink href="/privacy" icon={Scale} label={t("nav.privacy")} onClick={close} />
            <DrawerLink href="/security" icon={ShieldAlert} label={t("footer.securitypolicy")} onClick={close} />
            <DrawerLink href="/conduct" icon={Users} label={t("nav.conduct")} onClick={close} />
          </div>

          {/* External group */}
          <div className="drawer-group">
            <DrawerLink href="https://www.buymeacoffee.com/carrilloapps" icon={Heart} label={t("nav.donate")} external onClick={close} />
            <DrawerLink href="https://github.com/carrilloapps" icon={User} label={t("nav.author")} external onClick={close} />
          </div>
        </div>

        {/* Bottom bar — native style */}
        <div className="px-5 py-4 border-t border-[var(--glass-border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />
          </div>
          <p className="text-[10px] theme-faint truncate">
            &copy; {new Date().getFullYear()} José Carrillo
          </p>
        </div>
      </div>
    </nav>
  );
}

/* ── Drawer link (iOS-style grouped row) ── */
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
      className="drawer-row flex items-center gap-3 px-4 py-3 text-[14px] theme-text cursor-pointer active:bg-[var(--glass-bg-hover)] transition-colors duration-100"
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

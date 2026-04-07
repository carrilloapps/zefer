"use client";

import { Shield, Heart, User, Code } from "lucide-react";
import LanguageSelector from "@/app/components/LanguageSelector";
import ThemeToggle from "@/app/components/ThemeToggle";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function Navbar() {
  const { t } = useLanguage();

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

        {/* Center: Nav links */}
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
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full theme-primary-faint theme-primary-border border">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-primary/70 font-mono tracking-wide">{t("nav.encrypted")}</span>
          </div>
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>
    </nav>
  );
}

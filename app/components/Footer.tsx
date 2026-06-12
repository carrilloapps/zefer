"use client";

import Link from "next/link";
import { Shield, Lock, Eye } from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t theme-border mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Desktop footer — hidden on mobile */}
        <div className="hidden sm:grid py-12 grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 cursor-pointer">
              <div className="w-7 h-7 rounded-lg theme-primary-faint theme-primary-border border flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-semibold theme-heading text-sm">Zefer</span>
            </Link>
            <p className="text-xs theme-faint leading-relaxed max-w-[200px]">
              {t("footer.desc")}
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-[11px] font-mono theme-muted uppercase tracking-wider mb-4">
              {t("footer.product")}
            </p>
            <ul className="space-y-2.5">
              <li><Link href="/generator" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer">{t("nav.generator")}</Link></li>
              <li><Link href="/analyzer" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer">{t("nav.analyzer")}</Link></li>
              <li><Link href="/mcp" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer">{t("nav.mcp")}</Link></li>
              <li><Link href="/device" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer">{t("footer.product.device")}</Link></li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <p className="text-[11px] font-mono theme-muted uppercase tracking-wider mb-4">
              {t("footer.security")}
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/how" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />{t("footer.security.encryption")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />{t("footer.security.zeroknowledge")}
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />{t("footer.securitypolicy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[11px] font-mono theme-muted uppercase tracking-wider mb-4">
              {t("footer.legal")}
            </p>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer">{t("footer.privacy")}</Link></li>
              <li><Link href="/terms" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer">{t("footer.terms")}</Link></li>
              <li><Link href="/conduct" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer">{t("footer.conduct")}</Link></li>
            </ul>
          </div>
        </div>

        {/* Mobile footer — compact, app-like */}
        <div className="sm:hidden py-6">
          <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
            <Link href="/privacy" className="text-[11px] theme-faint hover:theme-muted transition-colors cursor-pointer">{t("footer.privacy")}</Link>
            <span className="text-[10px] theme-faint">·</span>
            <Link href="/terms" className="text-[11px] theme-faint hover:theme-muted transition-colors cursor-pointer">{t("footer.terms")}</Link>
            <span className="text-[10px] theme-faint">·</span>
            <Link href="/security" className="text-[11px] theme-faint hover:theme-muted transition-colors cursor-pointer">{t("footer.securitypolicy")}</Link>
          </div>
          <div className="text-center">
            <p className="text-[10px] theme-faint">
              &copy; {new Date().getFullYear()} Zefer · MIT ·{" "}
              <a href="https://carrillo.app" target="_blank" rel="noopener noreferrer" className="theme-muted hover:text-primary transition-colors cursor-pointer">
                José Carrillo
              </a>
            </p>
          </div>
        </div>

        {/* Bottom bar — desktop only */}
        <div className="hidden sm:flex border-t theme-border py-5 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-[11px] theme-faint">
              &copy; {new Date().getFullYear()} Zefer. {t("footer.rights")}
            </p>
            <span className="text-[10px] theme-faint">·</span>
            <Link href="/terms" className="text-[10px] theme-faint hover:theme-muted transition-colors cursor-pointer">MIT License</Link>
          </div>
          <p className="text-[10px] theme-faint">
            {t("footer.developer")}{" "}
            <a
              href="https://carrillo.app"
              target="_blank"
              rel="noopener noreferrer"
              className="theme-muted hover:text-primary transition-colors duration-200 cursor-pointer font-medium"
            >
              José Carrillo
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

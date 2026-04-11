"use client";

import { Shield, Lock, Eye } from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t theme-border mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Main footer */}
        <div className="py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4 cursor-pointer">
              <div className="w-7 h-7 rounded-lg theme-primary-faint theme-primary-border border flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-semibold theme-heading text-sm">Zefer</span>
            </a>
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
              <li>
                <a href="/" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer">
                  {t("footer.product.home")}
                </a>
              </li>
              <li>
                <a href="/how" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer">
                  {t("footer.product.how")}
                </a>
              </li>
              <li>
                <a href="/device" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer">
                  {t("footer.product.device")}
                </a>
              </li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <p className="text-[11px] font-mono theme-muted uppercase tracking-wider mb-4">
              {t("footer.security")}
            </p>
            <ul className="space-y-2.5">
              <li>
                <a href="/how" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  {t("footer.security.encryption")}
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />
                  {t("footer.security.zeroknowledge")}
                </a>
              </li>
              <li>
                <a href="/security" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  {t("footer.securitypolicy")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Open Source */}
          <div>
            <p className="text-[11px] font-mono theme-muted uppercase tracking-wider mb-4">
              {t("footer.legal")}
            </p>
            <ul className="space-y-2.5">
              <li>
                <a href="/privacy" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer">
                  {t("footer.privacy")}
                </a>
              </li>
              <li>
                <a href="/terms" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer">
                  {t("footer.terms")}
                </a>
              </li>
              <li>
                <a href="/conduct" className="text-xs theme-faint hover:theme-text transition-colors duration-200 cursor-pointer">
                  {t("footer.conduct")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t theme-border py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-[11px] theme-faint">
              &copy; {new Date().getFullYear()} Zefer. {t("footer.rights")}
            </p>
            <span className="text-[10px] theme-faint">·</span>
            <a href="/terms" className="text-[10px] theme-faint hover:theme-muted transition-colors cursor-pointer">MIT License</a>
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

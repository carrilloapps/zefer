"use client";

import { Coffee } from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";

/** Floating action button for Buy Me a Coffee donations.
 *  Sits above page content but below the mobile drawer and legal banner. */
export default function DonateFab() {
  const { t, ready } = useLanguage();
  if (!ready) return null;

  return (
    <a
      href="https://www.buymeacoffee.com/carrilloapps"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("nav.donate")}
      title={t("nav.donate")}
      className="donate-fab fixed z-40 flex items-center justify-center w-12 h-12 rounded-full bg-[var(--primary)] text-[var(--btn-text)] cursor-pointer"
    >
      <Coffee className="w-5 h-5" aria-hidden="true" />
    </a>
  );
}

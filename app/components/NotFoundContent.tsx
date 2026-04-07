"use client";

import { Shield, ArrowLeft } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { IconBox } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function NotFoundContent() {
  const { t } = useLanguage();

  return (
    <main className="flex-1 flex flex-col">
      <Navbar />
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="text-center animate-in">
          <div className="flex justify-center mb-6">
            <IconBox icon={Shield} size="lg" />
          </div>
          <p className="text-6xl font-bold theme-heading font-mono mb-2">404</p>
          <h1 className="text-lg font-semibold theme-heading mb-2">{t("notfound.title")}</h1>
          <p className="text-sm theme-muted mb-8 max-w-sm mx-auto">{t("notfound.desc")}</p>
          <a href="/" className="btn-primary !w-auto inline-flex px-8">
            <ArrowLeft className="w-4 h-4" /> {t("privacy.back")}
          </a>
        </div>
      </section>
      <Footer />
    </main>
  );
}

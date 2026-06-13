"use client";

import Link from "next/link";
import {
  FileText,
  KeyRound,
  Lock,
  Send,
  FileDown,
  Unlock,
  Eye,
  Shield,
  ArrowRight,
  Settings,
  Cpu,
  Globe,
  Terminal,
  Plug,
  Library,
  Boxes,
} from "lucide-react";
import { PageLayout, PageHeader, IconBox, SectionCard, GlassCard } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";

const SPECS = [
  { key: "how.tech.algorithm" as const, value: "AES-256-GCM" },
  { key: "how.tech.keyderiv" as const, value: "PBKDF2-SHA256" },
  { key: "how.tech.iterations" as const, value: "300k / 600k / 1M" },
  { key: "how.tech.saltsize" as const, value: "32 bytes (256 bits)" },
  { key: "how.tech.ivsize" as const, value: "12 bytes (96 bits)" },
  { key: "how.tech.keysize" as const, value: "256 bits" },
  { key: "how.tech.api" as const, value: "Web Crypto API (SubtleCrypto)" },
  { key: "how.tech.maxttl" as const, value: "2 weeks / No expiration" },
  { key: "how.tech.compression" as const, value: "None / Gzip / Deflate" },
  { key: "how.tech.filetypes" as const, value: "Text (.txt, .env) + Any file" },
  { key: "how.tech.format" as const, value: "ZEFER3" },
  { key: "how.tech.server" as const, value: "None (100% client-side)" },
];

export default function HowContent() {
  const { t } = useLanguage();

  const steps = [
    { icon: FileText, titleKey: "how.step1.title" as const, descKey: "how.step1.desc" as const, num: "01" },
    { icon: KeyRound, titleKey: "how.step2.title" as const, descKey: "how.step2.desc" as const, num: "02" },
    { icon: Lock, titleKey: "how.step3.title" as const, descKey: "how.step3.desc" as const, num: "03" },
    { icon: FileDown, titleKey: "how.step4.title" as const, descKey: "how.step4.desc" as const, num: "04" },
    { icon: Send, titleKey: "how.step5.title" as const, descKey: "how.step5.desc" as const, num: "05" },
    { icon: Unlock, titleKey: "how.step6.title" as const, descKey: "how.step6.desc" as const, num: "06" },
    { icon: Eye, titleKey: "how.step7.title" as const, descKey: "how.step7.desc" as const, num: "07" },
  ];

  const features = [
    { icon: Settings, titleKey: "how.feat.advanced.title" as const, descKey: "how.feat.advanced.desc" as const },
    { icon: KeyRound, titleKey: "how.feat.reveal.title" as const, descKey: "how.feat.reveal.desc" as const },
    { icon: Globe, titleKey: "how.feat.ip.title" as const, descKey: "how.feat.ip.desc" as const },
    { icon: Cpu, titleKey: "how.feat.device.title" as const, descKey: "how.feat.device.desc" as const },
    { icon: Shield, titleKey: "how.feat.keygen.title" as const, descKey: "how.feat.keygen.desc" as const },
  ];

  const channels = [
    { icon: Globe, titleKey: "how.channels.web.title" as const, descKey: "how.channels.web.desc" as const, href: "/" },
    { icon: Terminal, titleKey: "how.channels.cli.title" as const, descKey: "how.channels.cli.desc" as const, href: "/install" },
    { icon: Plug, titleKey: "how.channels.mcp.title" as const, descKey: "how.channels.mcp.desc" as const, href: "/mcp" },
    { icon: Library, titleKey: "how.channels.lib.title" as const, descKey: "how.channels.lib.desc" as const, href: "/library" },
  ];

  return (
    <PageLayout>
      <PageHeader icon={Shield} badge={t("steps.title")} title={t("steps.title")} subtitle={t("how.subtitle")} />

      {/* Overview */}
      <GlassCard className="mb-8">
        <h2 className="text-sm font-semibold theme-heading mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />{t("how.overview.title")}
        </h2>
        <p className="text-[13px] theme-muted leading-relaxed">{t("how.overview.desc")}</p>
      </GlassCard>

      {/* Steps */}
      <div className="space-y-3 mb-8">
        {steps.map((step, i) => (
          <div key={step.num} className="glass glass-hover p-5 sm:p-7 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <IconBox icon={step.icon} />
                <span className="absolute -top-2 -right-2 text-[10px] font-mono font-bold text-primary/50 bg-[var(--background)] px-1 rounded">{step.num}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold theme-heading mb-2">{t(step.titleKey)}</h3>
                <p className="text-[13px] theme-muted leading-relaxed">{t(step.descKey)}</p>
              </div>
            </div>
            {i < steps.length - 1 && <div className="ml-5 mt-4 h-4 border-l border-dashed border-[var(--glass-border)]" />}
          </div>
        ))}
      </div>

      {/* Features */}
      <GlassCard className="mb-8">
        <h2 className="text-sm font-semibold theme-heading mb-5 flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />{t("how.features.title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((feat) => (
            <div key={feat.titleKey} className="glass glass-hover !rounded-xl p-4 transition-all duration-300">
              <div className="flex items-start gap-3">
                <IconBox icon={feat.icon} size="sm" />
                <div>
                  <h3 className="text-xs font-semibold theme-heading mb-1">{t(feat.titleKey)}</h3>
                  <p className="text-[11px] theme-muted leading-relaxed">{t(feat.descKey)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Specs */}
      <GlassCard className="mb-8">
        <h2 className="text-sm font-semibold theme-heading mb-5 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />{t("how.technical.title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {SPECS.map((spec) => (
            <div key={spec.key} className="flex items-start justify-between gap-3 py-2 border-b border-[var(--border-subtle)]">
              <span className="text-xs theme-muted shrink-0">{t(spec.key)}</span>
              <span className="text-xs font-mono theme-heading text-right">{spec.value}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Password generation engine */}
      <GlassCard className="mb-8">
        <h2 className="text-sm font-semibold theme-heading mb-2 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" />{t("how.gen.title")}
        </h2>
        <p className="text-xs theme-muted mb-5 leading-relaxed">{t("how.gen.intro")}</p>
        <div className="space-y-4">
          {([
            ["how.gen.csprng.title", "how.gen.csprng.desc"],
            ["how.gen.rejection.title", "how.gen.rejection.desc"],
            ["how.gen.modes.title", "how.gen.modes.desc"],
            ["how.gen.analysis.title", "how.gen.analysis.desc"],
            ["how.gen.options.title", "how.gen.options.desc"],
            ["how.gen.mcp.title", "how.gen.mcp.desc"],
          ] as const).map(([titleKey, descKey], i) => (
            <div key={titleKey} className="flex items-start gap-3">
              <span className="text-[10px] font-mono text-primary theme-primary-faint theme-primary-border border rounded-md px-1.5 py-0.5 shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xs font-medium theme-heading mb-0.5">{t(titleKey)}</h3>
                <p className="text-[11px] theme-muted leading-relaxed">{t(descKey)}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/generator" className="inline-flex items-center gap-1.5 mt-5 text-xs text-primary hover:opacity-80 transition-opacity cursor-pointer">
          {t("gen.title")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </GlassCard>

      {/* Channels — the same engine and .zefer format everywhere */}
      <GlassCard className="mb-8">
        <h2 className="text-sm font-semibold theme-heading mb-2 flex items-center gap-2">
          <Boxes className="w-4 h-4 text-primary" />{t("how.channels.title")}
        </h2>
        <p className="text-xs theme-muted mb-5 leading-relaxed">{t("how.channels.desc")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {channels.map((c) => (
            <Link key={c.href} href={c.href} className="glass glass-hover !rounded-xl p-4 transition-all duration-300 block cursor-pointer">
              <div className="flex items-start gap-3">
                <IconBox icon={c.icon} size="sm" />
                <div>
                  <h3 className="text-xs font-semibold theme-heading mb-1 flex items-center gap-1.5">
                    {t(c.titleKey)} <ArrowRight className="w-3 h-3 text-primary" />
                  </h3>
                  <p className="text-[11px] theme-muted leading-relaxed">{t(c.descKey)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </GlassCard>

      {/* CTA */}
      <GlassCard glow className="text-center">
        <h2 className="text-lg font-semibold theme-heading mb-2">{t("how.cta")}</h2>
        <p className="text-sm theme-muted mb-5">{t("how.cta.desc")}</p>
        <Link href="/" className="btn-primary !w-auto inline-flex px-8">{t("how.cta")} <ArrowRight className="w-4 h-4" /></Link>
      </GlassCard>
    </PageLayout>
  );
}

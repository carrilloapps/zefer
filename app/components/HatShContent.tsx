"use client";

import {
  Shield, Lock, Clock, Globe, Key, KeyRound, Eye, FileText, Zap,
  CheckCircle2, XCircle, ArrowRight, ExternalLink, HelpCircle, Cpu,
} from "lucide-react";
import { PageLayout, PageHeader, GlassCard } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";

const FEATURES: {
  key: string;
  icon: typeof Shield;
  zefer: "yes" | "no" | "partial";
  hatsh: "yes" | "no" | "partial";
}[] = [
  { key: "vs.feat.encryption", icon: Lock, zefer: "yes", hatsh: "yes" },
  { key: "vs.feat.browseronly", icon: Globe, zefer: "yes", hatsh: "yes" },
  { key: "vs.feat.opensource", icon: FileText, zefer: "yes", hatsh: "yes" },
  { key: "vs.feat.chunked", icon: Cpu, zefer: "yes", hatsh: "yes" },
  { key: "vs.feat.expiration", icon: Clock, zefer: "yes", hatsh: "no" },
  { key: "vs.feat.dualkey", icon: KeyRound, zefer: "yes", hatsh: "no" },
  { key: "vs.feat.revealkey", icon: Eye, zefer: "yes", hatsh: "no" },
  { key: "vs.feat.question", icon: HelpCircle, zefer: "yes", hatsh: "no" },
  { key: "vs.feat.iprestrict", icon: Globe, zefer: "yes", hatsh: "no" },
  { key: "vs.feat.maxattempts", icon: Shield, zefer: "yes", hatsh: "no" },
  { key: "vs.feat.compression", icon: Zap, zefer: "yes", hatsh: "no" },
  { key: "vs.feat.pubkey", icon: Key, zefer: "no", hatsh: "yes" },
  { key: "vs.feat.i18n", icon: Globe, zefer: "partial", hatsh: "yes" },
];

function StatusIcon({ status }: { status: "yes" | "no" | "partial" }) {
  if (status === "yes") return <CheckCircle2 className="w-4 h-4 text-primary" />;
  if (status === "no") return <XCircle className="w-4 h-4 theme-faint" />;
  return <CheckCircle2 className="w-4 h-4 text-[var(--warning-text)]" />;
}

export default function HatShContent() {
  const { t } = useLanguage();

  return (
    <PageLayout>
      <PageHeader
        icon={Shield}
        badge={t("vs.badge")}
        title={t("vs.hatsh.title")}
        subtitle={t("vs.hatsh.subtitle")}
      />

      {/* TL;DR */}
      <GlassCard glow className="mb-6">
        <h2 className="text-sm font-semibold theme-heading mb-3">{t("vs.tldr")}</h2>
        <p className="text-[13px] theme-muted leading-relaxed">{t("vs.hatsh.tldr")}</p>
      </GlassCard>

      {/* At-a-glance specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg theme-primary-faint theme-primary-border border flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold theme-heading">Zefer</h2>
          </div>
          <ul className="space-y-2 text-[12px] theme-muted">
            <li><span className="font-mono text-primary">AES-256-GCM</span> + PBKDF2-SHA256</li>
            <li>{t("vs.hatsh.zefer.iterations")}</li>
            <li>{t("vs.hatsh.zefer.features")}</li>
            <li>{t("vs.hatsh.zefer.langs")}</li>
            <li>{t("vs.hatsh.zefer.a11y")}</li>
          </ul>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center">
              <Lock className="w-4 h-4 theme-muted" />
            </div>
            <h2 className="text-sm font-semibold theme-heading">Hat.sh</h2>
          </div>
          <ul className="space-y-2 text-[12px] theme-muted">
            <li><span className="font-mono text-primary">XChaCha20-Poly1305</span> + Argon2id</li>
            <li>{t("vs.hatsh.hatsh.pubkey")}</li>
            <li>{t("vs.hatsh.hatsh.lib")}</li>
            <li>{t("vs.hatsh.hatsh.langs")}</li>
            <li>{t("vs.hatsh.hatsh.focus")}</li>
          </ul>
        </GlassCard>
      </div>

      {/* Feature comparison table */}
      <GlassCard className="mb-6">
        <h2 className="text-sm font-semibold theme-heading mb-4">{t("vs.features")}</h2>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-[12px] min-w-[400px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2.5 px-2 theme-muted font-medium">{t("vs.feature")}</th>
                <th className="text-center py-2.5 px-2 theme-heading font-semibold w-20">Zefer</th>
                <th className="text-center py-2.5 px-2 theme-muted font-medium w-20">Hat.sh</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f) => (
                <tr key={f.key} className="border-b border-[var(--border-subtle)]">
                  <td className="py-2.5 px-2 theme-muted flex items-center gap-2">
                    <f.icon className="w-3.5 h-3.5 shrink-0" />{t(f.key as Parameters<typeof t>[0])}
                  </td>
                  <td className="text-center py-2.5 px-2"><StatusIcon status={f.zefer} /></td>
                  <td className="text-center py-2.5 px-2"><StatusIcon status={f.hatsh} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Detailed comparisons */}
      <div className="space-y-3 mb-6">
        <GlassCard>
          <h2 className="text-sm font-semibold theme-heading mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />{t("vs.section.encryption")}
          </h2>
          <p className="text-[13px] theme-muted leading-relaxed">{t("vs.hatsh.encryption.desc")}</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold theme-heading mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />{t("vs.section.access")}
          </h2>
          <p className="text-[13px] theme-muted leading-relaxed">{t("vs.hatsh.access.desc")}</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold theme-heading mb-2 flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />{t("vs.section.pubkey")}
          </h2>
          <p className="text-[13px] theme-muted leading-relaxed">{t("vs.hatsh.pubkey.desc")}</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold theme-heading mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />{t("vs.section.ux")}
          </h2>
          <p className="text-[13px] theme-muted leading-relaxed">{t("vs.hatsh.ux.desc")}</p>
        </GlassCard>
      </div>

      {/* Who should use what */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <GlassCard>
          <h2 className="text-sm font-semibold text-primary mb-3">{t("vs.choose.zefer")}</h2>
          <ul className="space-y-2">
            {(["vs.zefer.for.1", "vs.zefer.for.2", "vs.zefer.for.3", "vs.zefer.for.4"] as const).map((k) => (
              <li key={k} className="text-[13px] theme-muted leading-relaxed flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />{t(k)}
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm font-semibold theme-heading mb-3">{t("vs.choose.hatsh")}</h2>
          <ul className="space-y-2">
            {(["vs.hatsh.for.1", "vs.hatsh.for.2", "vs.hatsh.for.3"] as const).map((k) => (
              <li key={k} className="text-[13px] theme-muted leading-relaxed flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 theme-muted shrink-0 mt-0.5" />{t(k)}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* Links */}
      <GlassCard className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <a href="https://hat.sh" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm theme-muted hover:theme-text transition-colors cursor-pointer">
            <ExternalLink className="w-4 h-4" />hat.sh
          </a>
          <a href="https://github.com/sh-dv/hat.sh" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm theme-muted hover:theme-text transition-colors cursor-pointer">
            <ExternalLink className="w-4 h-4" />{t("vs.hatsh.repo")}
          </a>
        </div>
      </GlassCard>

      {/* CTA */}
      <GlassCard glow className="text-center">
        <h2 className="text-lg font-semibold theme-heading mb-2">{t("vs.cta.title")}</h2>
        <p className="text-sm theme-muted mb-5">{t("vs.cta.desc")}</p>
        <a href="/" className="btn-primary !w-auto inline-flex px-8">
          {t("vs.cta.button")} <ArrowRight className="w-4 h-4" />
        </a>
      </GlassCard>
    </PageLayout>
  );
}

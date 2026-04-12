"use client";

import {
  Shield, Lock, Clock, Globe, Key, KeyRound, Eye, FileText, Zap, Cpu,
  CheckCircle2, XCircle, ArrowRight, ExternalLink, HelpCircle, Monitor,
  HardDrive, Cloud, Users,
} from "lucide-react";
import { PageLayout, PageHeader, GlassCard } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";
import type { TranslationKey } from "@/app/lib/i18n";

type Status = "yes" | "no" | "partial";
type Feature = { key: TranslationKey; icon: typeof Shield; zefer: Status; other: Status };

interface CompetitorData {
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  tldrKey: TranslationKey;
  icon: typeof Shield;
  specs: TranslationKey[];
  features: Feature[];
  sections: { icon: typeof Shield; titleKey: TranslationKey; descKey: TranslationKey }[];
  zeferForKeys: TranslationKey[];
  otherForKeys: TranslationKey[];
  otherChooseKey: TranslationKey;
  links: { url: string; labelKey: TranslationKey }[];
}

const SHARED_ZEFER_FOR: TranslationKey[] = ["vs.zefer.for.1", "vs.zefer.for.2", "vs.zefer.for.3", "vs.zefer.for.4"];

const BASE_FEATURES: Feature[] = [
  { key: "vs.feat.encryption", icon: Lock, zefer: "yes", other: "yes" },
  { key: "vs.feat.opensource", icon: FileText, zefer: "yes", other: "yes" },
  { key: "vs.feat.expiration", icon: Clock, zefer: "yes", other: "no" },
  { key: "vs.feat.dualkey", icon: KeyRound, zefer: "yes", other: "no" },
  { key: "vs.feat.revealkey", icon: Eye, zefer: "yes", other: "no" },
  { key: "vs.feat.question", icon: HelpCircle, zefer: "yes", other: "no" },
  { key: "vs.feat.iprestrict", icon: Globe, zefer: "yes", other: "no" },
  { key: "vs.feat.maxattempts", icon: Shield, zefer: "yes", other: "no" },
  { key: "vs.feat.compression", icon: Zap, zefer: "yes", other: "no" },
];

const COMPETITORS: Record<string, CompetitorData> = {
  picocrypt: {
    titleKey: "vs.pico.title", subtitleKey: "vs.pico.subtitle", tldrKey: "vs.pico.tldr", icon: Monitor,
    specs: ["vs.pico.spec.1", "vs.pico.spec.2", "vs.pico.spec.3", "vs.pico.spec.4"],
    features: [
      ...BASE_FEATURES,
      { key: "vs.feat.browseronly", icon: Globe, zefer: "yes", other: "no" },
      { key: "vs.feat.cli", icon: Monitor, zefer: "no", other: "yes" },
      { key: "vs.feat.offline", icon: HardDrive, zefer: "partial", other: "yes" },
    ],
    sections: [
      { icon: Lock, titleKey: "vs.section.encryption", descKey: "vs.pico.encryption.desc" },
      { icon: Globe, titleKey: "vs.pico.section.platform", descKey: "vs.pico.platform.desc" },
      { icon: Shield, titleKey: "vs.section.access", descKey: "vs.pico.access.desc" },
    ],
    zeferForKeys: SHARED_ZEFER_FOR,
    otherForKeys: ["vs.pico.for.1", "vs.pico.for.2", "vs.pico.for.3"],
    otherChooseKey: "vs.pico.choose",
    links: [
      { url: "https://github.com/Picocrypt/Picocrypt", labelKey: "vs.pico.link" },
    ],
  },
  bitwarden: {
    titleKey: "vs.bw.title", subtitleKey: "vs.bw.subtitle", tldrKey: "vs.bw.tldr", icon: Key,
    specs: ["vs.bw.spec.1", "vs.bw.spec.2", "vs.bw.spec.3", "vs.bw.spec.4"],
    features: [
      { key: "vs.feat.encryption", icon: Lock, zefer: "yes", other: "yes" },
      { key: "vs.feat.browseronly", icon: Globe, zefer: "yes", other: "yes" },
      { key: "vs.feat.expiration", icon: Clock, zefer: "yes", other: "yes" },
      { key: "vs.feat.noaccount", icon: Users, zefer: "yes", other: "no" },
      { key: "vs.feat.free", icon: Zap, zefer: "yes", other: "partial" },
      { key: "vs.feat.dualkey", icon: KeyRound, zefer: "yes", other: "no" },
      { key: "vs.feat.revealkey", icon: Eye, zefer: "yes", other: "no" },
      { key: "vs.feat.question", icon: HelpCircle, zefer: "yes", other: "no" },
      { key: "vs.feat.iprestrict", icon: Globe, zefer: "yes", other: "no" },
      { key: "vs.feat.vaultintegration", icon: Key, zefer: "no", other: "yes" },
      { key: "vs.feat.auditlog", icon: FileText, zefer: "no", other: "yes" },
    ],
    sections: [
      { icon: Users, titleKey: "vs.bw.section.account", descKey: "vs.bw.account.desc" },
      { icon: Shield, titleKey: "vs.section.access", descKey: "vs.bw.access.desc" },
      { icon: Zap, titleKey: "vs.bw.section.pricing", descKey: "vs.bw.pricing.desc" },
    ],
    zeferForKeys: SHARED_ZEFER_FOR,
    otherForKeys: ["vs.bw.for.1", "vs.bw.for.2", "vs.bw.for.3"],
    otherChooseKey: "vs.bw.choose",
    links: [
      { url: "https://bitwarden.com/products/send/", labelKey: "vs.bw.link" },
    ],
  },
  cryptomator: {
    titleKey: "vs.cm.title", subtitleKey: "vs.cm.subtitle", tldrKey: "vs.cm.tldr", icon: Cloud,
    specs: ["vs.cm.spec.1", "vs.cm.spec.2", "vs.cm.spec.3", "vs.cm.spec.4"],
    features: [
      { key: "vs.feat.encryption", icon: Lock, zefer: "yes", other: "yes" },
      { key: "vs.feat.opensource", icon: FileText, zefer: "yes", other: "yes" },
      { key: "vs.feat.browseronly", icon: Globe, zefer: "yes", other: "no" },
      { key: "vs.feat.expiration", icon: Clock, zefer: "yes", other: "no" },
      { key: "vs.feat.dualkey", icon: KeyRound, zefer: "yes", other: "no" },
      { key: "vs.feat.revealkey", icon: Eye, zefer: "yes", other: "no" },
      { key: "vs.feat.question", icon: HelpCircle, zefer: "yes", other: "no" },
      { key: "vs.feat.cloudintegration", icon: Cloud, zefer: "no", other: "yes" },
      { key: "vs.feat.desktopapp", icon: Monitor, zefer: "no", other: "yes" },
      { key: "vs.feat.transparentvault", icon: HardDrive, zefer: "no", other: "yes" },
    ],
    sections: [
      { icon: Shield, titleKey: "vs.cm.section.model", descKey: "vs.cm.model.desc" },
      { icon: Cloud, titleKey: "vs.cm.section.cloud", descKey: "vs.cm.cloud.desc" },
      { icon: Globe, titleKey: "vs.section.ux", descKey: "vs.cm.ux.desc" },
    ],
    zeferForKeys: SHARED_ZEFER_FOR,
    otherForKeys: ["vs.cm.for.1", "vs.cm.for.2", "vs.cm.for.3"],
    otherChooseKey: "vs.cm.choose",
    links: [
      { url: "https://cryptomator.org", labelKey: "vs.cm.link.site" },
      { url: "https://github.com/cryptomator/cryptomator", labelKey: "vs.cm.link.repo" },
    ],
  },
  veracrypt: {
    titleKey: "vs.vc.title", subtitleKey: "vs.vc.subtitle", tldrKey: "vs.vc.tldr", icon: HardDrive,
    specs: ["vs.vc.spec.1", "vs.vc.spec.2", "vs.vc.spec.3", "vs.vc.spec.4"],
    features: [
      { key: "vs.feat.encryption", icon: Lock, zefer: "yes", other: "yes" },
      { key: "vs.feat.opensource", icon: FileText, zefer: "yes", other: "yes" },
      { key: "vs.feat.browseronly", icon: Globe, zefer: "yes", other: "no" },
      { key: "vs.feat.expiration", icon: Clock, zefer: "yes", other: "no" },
      { key: "vs.feat.dualkey", icon: KeyRound, zefer: "yes", other: "no" },
      { key: "vs.feat.revealkey", icon: Eye, zefer: "yes", other: "no" },
      { key: "vs.feat.fulldisk", icon: HardDrive, zefer: "no", other: "yes" },
      { key: "vs.feat.hiddenvolume", icon: Eye, zefer: "no", other: "yes" },
      { key: "vs.feat.desktopapp", icon: Monitor, zefer: "no", other: "yes" },
    ],
    sections: [
      { icon: Shield, titleKey: "vs.vc.section.scope", descKey: "vs.vc.scope.desc" },
      { icon: HardDrive, titleKey: "vs.vc.section.threat", descKey: "vs.vc.threat.desc" },
      { icon: Globe, titleKey: "vs.section.ux", descKey: "vs.vc.ux.desc" },
    ],
    zeferForKeys: SHARED_ZEFER_FOR,
    otherForKeys: ["vs.vc.for.1", "vs.vc.for.2", "vs.vc.for.3"],
    otherChooseKey: "vs.vc.choose",
    links: [
      { url: "https://veracrypt.fr", labelKey: "vs.vc.link.site" },
      { url: "https://github.com/veracrypt/VeraCrypt", labelKey: "vs.vc.link.repo" },
    ],
  },
};

function StatusIcon({ status }: { status: Status }) {
  if (status === "yes") return <CheckCircle2 className="w-4 h-4 text-primary" />;
  if (status === "no") return <XCircle className="w-4 h-4 theme-faint" />;
  return <CheckCircle2 className="w-4 h-4 text-[var(--warning-text)]" />;
}

export default function VsContent({ competitor }: { competitor: keyof typeof COMPETITORS }) {
  const { t } = useLanguage();
  const data = COMPETITORS[competitor];

  return (
    <PageLayout>
      <PageHeader icon={data.icon} badge={t("vs.badge")} title={t(data.titleKey)} subtitle={t(data.subtitleKey)} />

      {/* TL;DR */}
      <GlassCard glow className="mb-6">
        <h2 className="text-sm font-semibold theme-heading mb-3">{t("vs.tldr")}</h2>
        <p className="text-[13px] theme-muted leading-relaxed">{t(data.tldrKey)}</p>
      </GlassCard>

      {/* Specs */}
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
            <li>{t("vs.hatsh.zefer.a11y")}</li>
          </ul>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center">
              <data.icon className="w-4 h-4 theme-muted" />
            </div>
            <h2 className="text-sm font-semibold theme-heading">{t(data.titleKey).split(" vs ")[1]}</h2>
          </div>
          <ul className="space-y-2 text-[12px] theme-muted">
            {data.specs.map((k) => <li key={k}>{t(k)}</li>)}
          </ul>
        </GlassCard>
      </div>

      {/* Feature table */}
      <GlassCard className="mb-6">
        <h2 className="text-sm font-semibold theme-heading mb-4">{t("vs.features")}</h2>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-[12px] min-w-[400px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2.5 px-2 theme-muted font-medium">{t("vs.feature")}</th>
                <th className="text-center py-2.5 px-2 theme-heading font-semibold w-20">Zefer</th>
                <th className="text-center py-2.5 px-2 theme-muted font-medium w-20">{t(data.titleKey).split(" vs ")[1]}</th>
              </tr>
            </thead>
            <tbody>
              {data.features.map((f) => (
                <tr key={f.key} className="border-b border-[var(--border-subtle)]">
                  <td className="py-2.5 px-2 theme-muted flex items-center gap-2">
                    <f.icon className="w-3.5 h-3.5 shrink-0" />{t(f.key)}
                  </td>
                  <td className="text-center py-2.5 px-2"><StatusIcon status={f.zefer} /></td>
                  <td className="text-center py-2.5 px-2"><StatusIcon status={f.other} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Detailed sections */}
      <div className="space-y-3 mb-6">
        {data.sections.map((s) => (
          <GlassCard key={s.titleKey}>
            <h2 className="text-sm font-semibold theme-heading mb-2 flex items-center gap-2">
              <s.icon className="w-4 h-4 text-primary" />{t(s.titleKey)}
            </h2>
            <p className="text-[13px] theme-muted leading-relaxed">{t(s.descKey)}</p>
          </GlassCard>
        ))}
      </div>

      {/* Who should use what */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <GlassCard>
          <h2 className="text-sm font-semibold text-primary mb-3">{t("vs.choose.zefer")}</h2>
          <ul className="space-y-2">
            {data.zeferForKeys.map((k) => (
              <li key={k} className="text-[13px] theme-muted leading-relaxed flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />{t(k)}
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm font-semibold theme-heading mb-3">{t(data.otherChooseKey)}</h2>
          <ul className="space-y-2">
            {data.otherForKeys.map((k) => (
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
          {data.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm theme-muted hover:theme-text transition-colors cursor-pointer">
              <ExternalLink className="w-4 h-4" />{t(l.labelKey)}
            </a>
          ))}
        </div>
      </GlassCard>

      {/* CTA */}
      <GlassCard glow className="text-center">
        <h2 className="text-lg font-semibold theme-heading mb-2">{t("vs.cta.title")}</h2>
        <p className="text-sm theme-muted mb-5">{t("vs.cta.desc")}</p>
        <a href="/" className="btn-primary !w-auto inline-flex px-8">{t("vs.cta.button")} <ArrowRight className="w-4 h-4" /></a>
      </GlassCard>
    </PageLayout>
  );
}

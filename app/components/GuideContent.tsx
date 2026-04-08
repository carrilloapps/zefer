"use client";

import {
  BookOpen, Lock, Unlock, KeyRound, Shield, MessageSquare, Hash,
  FileText, Upload, Key, Gauge, Link2, Terminal, Server,
  Globe, Download, ArrowRight, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { PageLayout, PageHeader, GlassCard, IconBox } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";

const ENCRYPT_STEPS = [
  { icon: FileText, key: "install.usage.encrypt.step1" },
  { icon: Upload, key: "install.usage.encrypt.step2" },
  { icon: Key, key: "install.usage.encrypt.step3" },
  { icon: Gauge, key: "install.usage.encrypt.step4" },
  { icon: Download, key: "install.usage.encrypt.step5" },
] as const;

const DECRYPT_STEPS = [
  { icon: Upload, key: "install.usage.decrypt.step1" },
  { icon: Key, key: "install.usage.decrypt.step2" },
  { icon: MessageSquare, key: "install.usage.decrypt.step3" },
  { icon: FileText, key: "install.usage.decrypt.step4" },
] as const;

const ADVANCED_FEATURES = [
  { icon: KeyRound, key: "install.usage.advanced.revealkey" },
  { icon: Shield, key: "install.usage.advanced.dualkey" },
  { icon: MessageSquare, key: "install.usage.advanced.question" },
  { icon: Globe, key: "install.usage.advanced.ip" },
  { icon: Hash, key: "install.usage.advanced.attempts" },
  { icon: Gauge, key: "install.usage.advanced.compression" },
] as const;

const SELFHOST_STEPS = [
  { cmd: "git clone https://github.com/carrilloapps/zefer.git && cd zefer", key: "install.usage.selfhost.step1" },
  { cmd: "npm install", key: "install.usage.selfhost.step2" },
  { cmd: "npm run build", key: "install.usage.selfhost.step3" },
  { cmd: "npm start", key: "install.usage.selfhost.step4" },
] as const;

const URL_PARAMS = [
  { param: "passphrase / p", desc: "install.guide.param.passphrase" },
  { param: "passphrase2 / p2", desc: "install.guide.param.passphrase2" },
  { param: "dual / d", desc: "install.guide.param.dual" },
  { param: "reveal / r", desc: "install.guide.param.reveal" },
  { param: "mode / m", desc: "install.guide.param.mode" },
  { param: "ttl", desc: "install.guide.param.ttl" },
  { param: "security / s", desc: "install.guide.param.security" },
  { param: "compression / c", desc: "install.guide.param.compression" },
  { param: "hint / h", desc: "install.guide.param.hint" },
  { param: "note / n", desc: "install.guide.param.note" },
  { param: "question / q", desc: "install.guide.param.question" },
  { param: "answer / a", desc: "install.guide.param.answer" },
  { param: "attempts / att", desc: "install.guide.param.attempts" },
  { param: "ips", desc: "install.guide.param.ips" },
] as const;

function StepList({ steps, icon: SectionIcon, title, t }: { steps: readonly { icon: typeof FileText; key: string }[]; icon: typeof Lock; title: string; t: (key: string) => string }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <IconBox icon={SectionIcon} size="sm" />
        <h2 className="text-base font-semibold theme-heading">{title}</h2>
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={s.key} className="glass p-4 flex items-center gap-3 animate-in">
            <span className="text-xs font-mono font-bold theme-faint w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
            <s.icon className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs theme-text">{t(s.key)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GuideContent() {
  const { t } = useLanguage();

  return (
    <PageLayout>
      <PageHeader icon={BookOpen} badge={t("install.guide.badge")} title={t("install.usage.title")} subtitle={t("install.usage.desc")} />

      {/* ─── Quick start CTA ─── */}
      <GlassCard glow className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <IconBox icon={ArrowRight} size="sm" />
          <div className="text-left">
            <h2 className="text-sm font-semibold theme-heading">{t("install.guide.quickstart")}</h2>
            <p className="text-xs theme-muted">{t("install.guide.quickstart.desc")}</p>
          </div>
        </div>
        <a href="/" className="btn-primary">{t("install.web.cta")} <ArrowRight className="w-4 h-4" /></a>
      </GlassCard>

      {/* ─── Encrypt ─── */}
      <StepList steps={ENCRYPT_STEPS} icon={Lock} title={t("install.usage.encrypt.title")} t={t as (key: string) => string} />

      {/* ─── Decrypt ─── */}
      <StepList steps={DECRYPT_STEPS} icon={Unlock} title={t("install.usage.decrypt.title")} t={t as (key: string) => string} />

      {/* ─── Advanced Features ─── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <IconBox icon={Shield} size="sm" />
          <h2 className="text-base font-semibold theme-heading">{t("install.usage.advanced.title")}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ADVANCED_FEATURES.map((f) => (
            <div key={f.key} className="glass glass-hover p-4 flex items-start gap-3 animate-in">
              <f.icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs theme-muted leading-relaxed">{t(f.key)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── URL Parameters ─── */}
      <div id="url" className="mb-10 scroll-mt-24">
        <div className="flex items-center gap-2 mb-4">
          <IconBox icon={Link2} size="sm" />
          <div>
            <h2 className="text-base font-semibold theme-heading">{t("install.usage.url.title")}</h2>
            <p className="text-xs theme-muted">{t("install.usage.url.desc")}</p>
          </div>
        </div>

        <p className="text-xs theme-muted mb-3">{t("install.guide.url.tab")}</p>

        <div className="space-y-1.5 mb-4">
          {URL_PARAMS.map((p) => (
            <div key={p.param} className="glass p-3 flex items-start gap-3">
              <code className="text-[11px] font-mono text-primary shrink-0 min-w-[140px]">{p.param}</code>
              <p className="text-[11px] theme-muted">{t(p.desc)}</p>
            </div>
          ))}
        </div>

        <p className="text-[11px] theme-warning flex items-center gap-2 mb-4">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          {t("install.guide.url.sensitive")}
        </p>

        <div className="glass !rounded-lg p-3 font-mono text-[11px] overflow-x-auto">
          <p className="theme-faint mb-1">{"# " + t("install.usage.decrypt.title")}</p>
          <p className="text-primary mb-2">{"/?t=decrypt&p=myKey123"}</p>
          <p className="theme-faint mb-1">{"# " + t("install.usage.encrypt.title")}</p>
          <p className="text-primary mb-2">{"/?t=encrypt&m=file&ttl=30&c=gzip&s=high"}</p>
          <p className="theme-faint mb-1">{"# " + t("install.usage.advanced.title")}</p>
          <p className="text-primary">{"/?t=encrypt&p=key1&p2=key2&q=Color%3F&a=blue&ips=10.0.0.1,192.168.1.5"}</p>
        </div>
      </div>

      {/* ─── Self-Hosting ─── */}
      <div id="selfhost" className="mb-10 scroll-mt-24">
        <div className="flex items-center gap-2 mb-4">
          <IconBox icon={Server} size="sm" />
          <h2 className="text-base font-semibold theme-heading">{t("install.usage.selfhost.title")}</h2>
        </div>
        <div className="space-y-2">
          {SELFHOST_STEPS.map((s) => (
            <div key={s.key} className="glass p-4 animate-in">
              <div className="flex items-center gap-3 mb-2">
                <Terminal className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs theme-text">{t(s.key)}</p>
              </div>
              <code className="block text-[11px] font-mono text-primary theme-primary-faint rounded-lg px-3 py-2">{s.cmd}</code>
            </div>
          ))}
        </div>
        <p className="text-[11px] theme-warning mt-3 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          {t("install.usage.selfhost.note")}
        </p>
      </div>

      {/* ─── Back to install ─── */}
      <div className="text-center">
        <Link href="/install" className="inline-flex items-center gap-2 text-xs text-primary hover:opacity-80 transition-opacity cursor-pointer">
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          {t("install.title")}
        </Link>
      </div>
    </PageLayout>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Monitor, Smartphone, Download, Globe, ArrowRight, Shield,
  BookOpen, Server, Link2, Lock, Key, Clock, Zap, ChevronRight,
  Terminal, Copy, Check,
} from "lucide-react";
import Link from "next/link";
import { PageLayout, PageHeader, GlassCard, IconBox } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";

const FEATURES = [
  { icon: Lock, key: "install.feat.encryption" as const },
  { icon: Shield, key: "install.feat.zeroknowledge" as const },
  { icon: Key, key: "install.feat.dualkey" as const },
  { icon: Clock, key: "install.feat.expiration" as const },
  { icon: Globe, key: "install.feat.browser" as const },
  { icon: Zap, key: "install.feat.free" as const },
];

const VS_LINKS = [
  { name: "Hat.sh", href: "/vs/hat-sh", descKey: "install.vs.hatsh" as const },
  { name: "Picocrypt", href: "/vs/picocrypt", descKey: "install.vs.picocrypt" as const },
  { name: "Bitwarden Send", href: "/vs/bitwarden-send", descKey: "install.vs.bitwarden" as const },
  { name: "Cryptomator", href: "/vs/cryptomator", descKey: "install.vs.cryptomator" as const },
  { name: "VeraCrypt", href: "/vs/veracrypt", descKey: "install.vs.veracrypt" as const },
];

const SocialIcon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0" aria-hidden="true"><path d={d} /></svg>
);

const SOCIALS = [
  { href: "https://github.com/carrilloapps", label: "GitHub", icon: <SocialIcon d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /> },
  { href: "https://carrillo.app", label: "Blog", icon: <SocialIcon d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /> },
  { href: "https://linkedin.com/in/carrilloapps", label: "LinkedIn", icon: <SocialIcon d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /> },
  { href: "https://x.com/carrilloapps", label: "X", icon: <SocialIcon d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /> },
  { href: "https://t.me/carrilloapps", label: "Telegram", icon: <SocialIcon d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /> },
];

interface AuthorData { name: string; avatar: string; bio: string }

export default function InstallContent() {
  const { t } = useLanguage();
  const [author, setAuthor] = useState<AuthorData | null>(null);

  useEffect(() => {
    fetch("/api/author")
      .then((r) => r.json())
      .then((d) => setAuthor({ name: d.name, avatar: d.avatar, bio: d.bio }))
      .catch(() => setAuthor({ name: "Jose Carrillo", avatar: "https://github.com/carrilloapps.png", bio: "Senior Fullstack Developer & Tech Lead" }));
  }, []);

  return (
    <PageLayout>
      <PageHeader icon={Download} badge={t("install.badge")} title={t("install.title")} subtitle={t("install.desc")} />

      {/* ─── Hero CTA ─── */}
      <GlassCard glow className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <IconBox icon={Globe} size="lg" />
            <div>
              <h2 className="text-sm font-semibold theme-heading">{t("install.web.title")}</h2>
              <p className="text-xs theme-muted leading-relaxed">{t("install.web.desc")}</p>
            </div>
          </div>
          <a href="/" className="btn-primary !w-auto shrink-0 px-6">{t("install.web.cta")} <ArrowRight className="w-4 h-4" /></a>
        </div>
      </GlassCard>

      {/* ─── Feature strip (plain text, no cards) ─── */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-10">
        {FEATURES.map((f) => (
          <div key={f.key} className="flex items-center gap-1.5">
            <f.icon className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] theme-muted">{t(f.key)}</span>
          </div>
        ))}
      </div>

      {/* ─── PWA Installation (accordion) ─── */}
      <PwaSection t={t} />

      {/* ─── CLI ─── */}
      <CliSection t={t} />

      {/* ─── Native Apps (coming soon, plain text) ─── */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold theme-heading mb-2">{t("install.native.title")}</h2>
        <p className="text-xs theme-muted leading-relaxed mb-3">{t("install.native.desc")}</p>
        <div className="flex flex-wrap gap-2">
          {["Windows", "macOS", "Linux", "iOS", "Android"].map((name) => (
            <span key={name} className="inline-flex items-center gap-1.5 text-[11px] theme-faint border border-[var(--border-subtle)] rounded-lg px-3 py-1.5">
              {name}
              <span className="text-[8px] font-mono theme-warning uppercase">{t("install.coming")}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── Documentation ─── */}
      <div className="mb-10 border-t border-[var(--border-subtle)] pt-8">
        <h2 className="text-sm font-semibold theme-heading mb-4">{t("install.guides.title")}</h2>
        <div className="space-y-1">
          <NavLink href="/install/guide" icon={BookOpen} title={t("install.guides.usage")} desc={t("install.guides.usage.desc")} />
          <NavLink href="/install/guide#selfhost" icon={Server} title={t("install.usage.selfhost.title")} desc={t("install.guides.selfhost.desc")} />
          <NavLink href="/install/guide#url" icon={Link2} title={t("install.usage.url.title")} desc={t("install.guides.url.desc")} />
        </div>
      </div>

      {/* ─── Alternatives ─── */}
      <div className="mb-10 border-t border-[var(--border-subtle)] pt-8">
        <h2 className="text-sm font-semibold theme-heading mb-4">{t("install.compare.title")}</h2>
        <div className="space-y-1">
          {VS_LINKS.map((c) => (
            <NavLink key={c.name} href={c.href} title={`Zefer vs ${c.name}`} desc={t(c.descKey)} badge={c.name[0]} />
          ))}
        </div>
      </div>

      {/* ─── Author ─── */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          {author ? (
            <img src={author.avatar} alt={author.name} width={40} height={40} className="w-10 h-10 rounded-full border border-[var(--glass-border)]" />
          ) : (
            <div className="w-10 h-10 rounded-full skeleton-shimmer" />
          )}
          <div>
            <p className="text-xs font-medium theme-heading">{author?.name ?? "..."}</p>
            <p className="text-[11px] theme-muted">{author?.bio ?? "..."}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border border-[var(--glass-border)] theme-muted hover:text-primary hover:border-[var(--primary-border)] transition-colors cursor-pointer">
              {s.icon}
              {s.label}
            </a>
          ))}
        </div>
      </GlassCard>
    </PageLayout>
  );
}

function NavLink({ href, icon: Icon, title, desc, badge }: { href: string; icon?: typeof BookOpen; title: string; desc: string; badge?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-xl hover:bg-[var(--glass-bg)] transition-colors duration-200 cursor-pointer group">
      {Icon ? (
        <Icon className="w-4 h-4 text-primary shrink-0" />
      ) : (
        <div className="w-6 h-6 rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center shrink-0 group-hover:border-[var(--primary-border)] transition-colors duration-200">
          <span className="text-[9px] font-bold theme-faint group-hover:text-primary transition-colors duration-200">{badge}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium theme-heading group-hover:text-primary transition-colors duration-200">{title}</span>
        <span className="text-[10px] theme-faint ml-2 hidden min-[400px]:inline">{desc}</span>
      </div>
      <ChevronRight className="w-3.5 h-3.5 theme-faint shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
    </Link>
  );
}

/* ─── CLI section ─── */

import { ChevronDown } from "lucide-react";
import type { TranslationKey } from "@/app/lib/i18n";

const BASE_URL = "https://github.com/carrilloapps/zefer-cli/releases/latest/download";

const PLATFORMS: {
  id: string;
  label: string;
  icon: string;
  file: string;
  unixCmd?: string;
  winCmd?: boolean;
}[] = [
  {
    id: "linux-x64",
    label: "Linux — x64",
    icon: "🐧",
    file: "zefer-linux-x64",
    unixCmd: "zefer-linux-x64",
  },
  {
    id: "linux-arm64",
    label: "Linux — ARM64",
    icon: "🐧",
    file: "zefer-linux-arm64",
    unixCmd: "zefer-linux-arm64",
  },
  {
    id: "macos-x64",
    label: "macOS — Intel",
    icon: "",
    file: "zefer-macos-x64",
    unixCmd: "zefer-macos-x64",
  },
  {
    id: "macos-arm64",
    label: "macOS — Apple Silicon",
    icon: "",
    file: "zefer-macos-arm64",
    unixCmd: "zefer-macos-arm64",
  },
  {
    id: "win-x64",
    label: "Windows — x64",
    icon: "🪟",
    file: "zefer-win-x64.exe",
    winCmd: true,
  },
];

const CLI_STEPS: { titleKey: TranslationKey; descKey: TranslationKey; code: string }[] = [
  {
    titleKey: "install.cli.step1.title",
    descKey: "install.cli.step1.desc",
    code: "npm install -g zefer-cli",
  },
  {
    titleKey: "install.cli.step2.title",
    descKey: "install.cli.step2.desc",
    code: "zefer --help",
  },
  {
    titleKey: "install.cli.step3.title",
    descKey: "install.cli.step3.desc",
    code: [
      "zefer encrypt report.pdf -p mypassword",
      "zefer decrypt report.pdf.zefer -p mypassword",
      "zefer keygen --mode secure --length 64",
      "zefer info secret.zefer",
    ].join("\n"),
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="shrink-0 text-[10px] theme-faint hover:text-primary transition-colors cursor-pointer"
      aria-label="Copy"
    >
      {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="flex items-start gap-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-3 py-2.5">
      <pre className="flex-1 text-[11px] font-mono text-primary overflow-x-auto whitespace-pre leading-relaxed">{code}</pre>
      <CopyButton text={code} />
    </div>
  );
}

function CliSection({ t }: { t: (k: TranslationKey) => string }) {
  const [openPlatform, setOpenPlatform] = useState<string | null>(null);
  const [openNpm, setOpenNpm] = useState(false);

  return (
    <GlassCard className="mb-8">
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <IconBox icon={Terminal} />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold theme-heading">{t("install.cli.title")}</h2>
          <p className="text-xs theme-muted leading-relaxed mt-0.5">{t("install.cli.desc")}</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <a href="https://github.com/carrilloapps/zefer-cli" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] theme-faint hover:text-primary border border-[var(--glass-border)] hover:border-[var(--primary-border)] rounded-lg px-2 py-1 transition-colors cursor-pointer">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            GitHub
          </a>
          <a href="https://www.npmjs.com/package/zefer-cli" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] theme-faint hover:text-primary border border-[var(--glass-border)] hover:border-[var(--primary-border)] rounded-lg px-2 py-1 transition-colors cursor-pointer">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5" aria-hidden="true"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z" /></svg>
            npm
          </a>
        </div>
      </div>

      {/* ── Option 1: Standalone binary ── */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-5 h-5 rounded-full bg-[var(--glass-bg)] border border-[var(--primary-border)] flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-primary">1</span>
          </span>
          <span className="text-xs font-semibold theme-heading">{t("install.cli.binary.title")}</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[var(--primary-faint)] text-primary border border-[var(--primary-border)] uppercase tracking-wide font-bold">
            {t("install.cli.binary.desc")}
          </span>
        </div>

        <div className="space-y-1 ml-7">
          {PLATFORMS.map((p) => {
            const isOpen = openPlatform === p.id;
            const downloadUrl = `${BASE_URL}/${p.file}`;
            const unixInstall = p.unixCmd
              ? `curl -L ${downloadUrl} -o zefer\nchmod +x zefer\nsudo mv zefer /usr/local/bin/zefer`
              : null;
            const winInstall = p.winCmd
              ? `Invoke-WebRequest -Uri "${downloadUrl}" -OutFile zefer.exe\n.\\zefer.exe --help`
              : null;
            const checksumUrl = `${BASE_URL}/checksums.txt`;

            return (
              <div key={p.id} className="rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenPlatform(isOpen ? null : p.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[var(--glass-bg)] rounded-xl transition-colors duration-200 cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm">{p.icon}</span>
                  <span className="text-xs font-medium theme-heading flex-1">{p.label}</span>
                  <a
                    href={downloadUrl}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] font-medium text-primary hover:underline mr-2 shrink-0"
                  >
                    ↓ {t("install.cli.binary.download")}
                  </a>
                  <ChevronDown className={`w-3.5 h-3.5 theme-faint shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <div className={`advanced-panel ${isOpen ? "advanced-open" : ""}`}>
                  <div className="px-3 pb-3 pt-1 space-y-3">
                    {unixInstall && (
                      <div>
                        <p className="text-[10px] theme-faint mb-1.5">{t("install.cli.binary.install")}</p>
                        <CodeBlock code={unixInstall} />
                      </div>
                    )}
                    {winInstall && (
                      <div>
                        <p className="text-[10px] theme-faint mb-1.5">PowerShell:</p>
                        <CodeBlock code={winInstall} />
                        <p className="text-[10px] theme-faint mt-2">{t("install.cli.binary.win.desc")}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] theme-faint mb-1.5">{t("install.cli.binary.checksum")}</p>
                      <CodeBlock code={`curl -L ${checksumUrl} | grep ${p.file} | sha256sum -c`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <a
          href="https://github.com/carrilloapps/zefer-cli/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-7 mt-2 inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
        >
          {t("install.cli.binary.releases")}
        </a>
      </div>

      {/* ── Option 2: npm ── */}
      <div className="border-t border-[var(--border-subtle)] pt-3">
        <button
          type="button"
          onClick={() => setOpenNpm((v) => !v)}
          className="w-full flex items-center gap-2 mb-2 cursor-pointer group"
          aria-expanded={openNpm}
        >
          <span className="w-5 h-5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center shrink-0 group-hover:border-[var(--primary-border)] transition-colors">
            <span className="text-[9px] font-bold theme-faint group-hover:text-primary transition-colors">2</span>
          </span>
          <span className="text-xs font-semibold theme-heading flex-1 text-left">{t("install.cli.npm.title")}</span>
          <span className="text-[9px] theme-faint">{t("install.cli.npm.req")}</span>
          <ChevronDown className={`w-3.5 h-3.5 theme-faint ml-2 shrink-0 transition-transform duration-200 ${openNpm ? "rotate-180" : ""}`} />
        </button>

        <div className={`advanced-panel ${openNpm ? "advanced-open" : ""}`}>
          <div className="ml-7 pb-2 space-y-3">
            {CLI_STEPS.map((step, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-medium theme-heading">{t(step.titleKey)}</span>
                  <span className="text-[10px] theme-faint">{t(step.descKey)}</span>
                </div>
                <CodeBlock code={step.code} />
              </div>
            ))}
            <div>
              <p className="text-[10px] theme-faint mb-1.5">{t("install.cli.npx")}</p>
              <CodeBlock code="npx zefer-cli encrypt report.pdf -p mypassword" />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

const BROWSERS: { name: string; steps: TranslationKey[]; code: string; menuKey: TranslationKey }[] = [
  {
    name: "Chrome / Edge",
    steps: ["install.pwa.chrome.1", "install.pwa.chrome.2", "install.pwa.chrome.3"],
    code: "zefer.carrillo.app → ⋮ → ",
    menuKey: "install.pwa.chrome.menu",
  },
  {
    name: "Safari (iOS / macOS)",
    steps: ["install.pwa.safari.1", "install.pwa.safari.2", "install.pwa.safari.3"],
    code: "zefer.carrillo.app → ↑ Share → ",
    menuKey: "install.pwa.safari.menu",
  },
  {
    name: "Firefox (Android)",
    steps: ["install.pwa.firefox.1", "install.pwa.firefox.2"],
    code: "zefer.carrillo.app → ⋮ → ",
    menuKey: "install.pwa.firefox.menu",
  },
];

function PwaSection({ t }: { t: (k: TranslationKey) => string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const toggle = useCallback((i: number) => setOpenIdx((prev) => (prev === i ? null : i)), []);

  return (
    <GlassCard className="mb-8">
      <div className="flex items-center gap-3 mb-1">
        <IconBox icon={Monitor} />
        <div>
          <h2 className="text-sm font-semibold theme-heading">{t("install.usage.pwa.title")}</h2>
          <p className="text-xs theme-muted leading-relaxed">{t("install.pwa.intro")}</p>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        {BROWSERS.map((browser, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={browser.name} className="rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[var(--glass-bg)] rounded-xl transition-colors duration-200 cursor-pointer"
                aria-expanded={isOpen}
                aria-label={browser.name}
              >
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-medium theme-heading flex-1">{browser.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 theme-faint shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>

              <div className={`advanced-panel ${isOpen ? "advanced-open" : ""}`}>
                <div>
                  <div className="px-3 pb-3 pt-1">
                    <ol className="space-y-1.5 text-[12px] theme-muted leading-relaxed pl-5 mb-2">
                      {browser.steps.map((stepKey) => (
                        <li key={stepKey} className="list-decimal">{t(stepKey)}</li>
                      ))}
                    </ol>
                    <code className="block text-[11px] font-mono text-primary bg-[var(--glass-bg)] rounded-lg px-3 py-2">
                      {browser.code}{t(browser.menuKey)}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

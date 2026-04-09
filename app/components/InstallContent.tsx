"use client";

import { useState, useEffect } from "react";
import {
  Monitor, Smartphone, Download, Globe, ArrowRight,
  BookOpen, Server, Link2,
} from "lucide-react";
import Link from "next/link";
import { PageLayout, PageHeader, GlassCard, IconBox } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";

const PLATFORMS = [
  { icon: Monitor, name: "Windows" },
  { icon: Monitor, name: "macOS" },
  { icon: Monitor, name: "Linux" },
  { icon: Smartphone, name: "iOS" },
  { icon: Smartphone, name: "Android" },
];

// ─── Social SVG icons (inline, no external deps) ───

const SocialIcon = ({ d, viewBox = "0 0 24 24" }: { d: string; viewBox?: string }) => (
  <svg viewBox={viewBox} fill="currentColor" className="w-3.5 h-3.5 shrink-0" aria-hidden="true"><path d={d} /></svg>
);

const SOCIALS = [
  { href: "https://github.com/carrilloapps", label: "GitHub", icon: <SocialIcon d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /> },
  { href: "https://carrillo.app", label: "Blog", icon: <SocialIcon d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /> },
  { href: "https://linkedin.com/in/carrilloapps", label: "LinkedIn", icon: <SocialIcon d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /> },
  { href: "https://x.com/carrilloapps", label: "X", icon: <SocialIcon d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /> },
  { href: "https://t.me/carrilloapps", label: "Telegram", icon: <SocialIcon d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /> },
  { href: "https://dev.to/carrilloapps", label: "Dev.to", icon: <SocialIcon d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .67-.08.86-.23.21-.18.31-.47.31-.95v-2c0-.49-.1-.79-.33-.95zm13.37-7.55H3.21C1.44 2.5 0 3.94 0 5.71v12.58C0 20.06 1.44 21.5 3.21 21.5h17.58c1.77 0 3.21-1.44 3.21-3.21V5.71c0-1.77-1.44-3.21-3.21-3.21zM8.88 14.57c0 .87-.29 1.56-.88 2.05-.56.47-1.31.7-2.25.7h-2.5V6.68h2.63c.9 0 1.6.23 2.12.68.55.47.82 1.15.82 2.02v5.19zm4.97.14c0 .67-.17 1.2-.49 1.6-.36.43-.86.66-1.53.66-.65 0-1.16-.23-1.52-.66-.32-.4-.49-.93-.49-1.6V6.68h1.77v8.08c0 .38.04.64.14.8.09.14.26.22.47.22.23 0 .38-.08.48-.22.1-.16.14-.42.14-.8V6.68h1.77v8.03h-.74zm6.57-1.49c0 .73-.12 1.3-.37 1.7-.3.5-.78.76-1.44.76-.58 0-1.03-.24-1.35-.7v.61h-1.76V6.68h1.76v3.12c.31-.45.76-.67 1.34-.67.66 0 1.13.25 1.44.76.25.4.37.96.37 1.7v1.63zm-2.1-2.06c0-.39-.04-.66-.12-.84-.1-.21-.29-.32-.56-.32-.24 0-.43.1-.55.31-.1.17-.15.43-.15.84v2.39c0 .44.05.73.15.88.11.2.3.3.55.3.25 0 .43-.1.54-.3.1-.18.14-.47.14-.91v-2.35z" /> },
  { href: "https://medium.com/@carrilloapps", label: "Medium", icon: <SocialIcon d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" /> },
  { href: "https://www.buymeacoffee.com/carrilloapps", label: "Donate", icon: <SocialIcon d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.502.451-.399.792.045.15.152.263.273.335.333.2.722.286 1.105.342 1.068.155 2.15.225 3.228.251a36.67 36.67 0 004.31-.18l.191-.025c.09-.012.294-.042.294-.042v.012l.484 2.242a.237.237 0 01-.199.284h-.003l-.077.012a36.055 36.055 0 01-5.043.31 35.923 35.923 0 01-4.881-.326l-.321-.047c-.393-.058-.622-.197-.79-.587l-.598-1.39C2.09 10.08 2.382 8.16 2.87 7.487c.2-.275.47-.408.787-.458.374-.058.759-.074 1.138-.067 1.156.02 2.31.107 3.453.253l.203.029a36.377 36.377 0 014.765.788c.113.028.158.19.068.274-.328.303-1.017.437-1.467.453a25.076 25.076 0 01-3.426-.12l-.394-.048h-.002a17.21 17.21 0 01-.838-.147h-.005c-.111-.027-.111.185 0 .212.24.05.481.094.724.13.078.011.172.026.258.036.38.043.762.077 1.157.107 1.178.076 2.36.074 3.536-.006.422-.038.916-.072 1.382-.146.377-.058.71.09.834.473.104.321-.122.78-.474.834z" /> },
];

interface AuthorData {
  name: string;
  avatar: string;
  bio: string;
}

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
      <PageHeader icon={Download} badge={t("install.coming")} title={t("install.title")} subtitle={t("install.desc")} />

      {/* ─── Install as PWA ─── */}
      <GlassCard glow className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <IconBox icon={Monitor} />
          <div className="text-left">
            <h2 className="text-sm font-semibold theme-heading">{t("install.usage.pwa.title")}</h2>
            <p className="text-xs theme-muted leading-relaxed">{t("install.usage.pwa.desc")}</p>
          </div>
        </div>
      </GlassCard>

      {/* ─── Native Apps (Coming Soon) ─── */}
      <div className="mb-8">
        <h2 className="text-base font-semibold theme-heading mb-4 text-center">{t("install.native.title")}</h2>
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-5 gap-3">
          {PLATFORMS.map((p) => (
            <div key={p.name} className="glass glass-lift p-5 text-center animate-in">
              <p.icon className="w-7 h-7 theme-muted mx-auto mb-3" />
              <p className="text-xs font-semibold theme-heading mb-1.5">{p.name}</p>
              <span className="text-[9px] font-mono theme-warning uppercase tracking-wider theme-warning-faint px-2 py-0.5 rounded-full inline-block">
                {t("install.coming")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Web CTA ─── */}
      <GlassCard glow className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <IconBox icon={Globe} />
          <div className="text-left">
            <h2 className="text-sm font-semibold theme-heading">{t("install.web.title")}</h2>
            <p className="text-xs theme-muted">{t("install.web.desc")}</p>
          </div>
        </div>
        <a href="/" className="btn-primary">{t("install.web.cta")} <ArrowRight className="w-4 h-4" /></a>
      </GlassCard>

      {/* ─── Guide links ─── */}
      <div className="mb-8">
        <h2 className="text-base font-semibold theme-heading mb-4 text-center">{t("install.guides.title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/install/guide" className="glass glass-hover glass-lift p-5 text-center animate-in cursor-pointer block">
            <BookOpen className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-xs font-semibold theme-heading mb-1">{t("install.guides.usage")}</p>
            <p className="text-[10px] theme-muted">{t("install.guides.usage.desc")}</p>
          </Link>
          <Link href="/install/guide#selfhost" className="glass glass-hover glass-lift p-5 text-center animate-in cursor-pointer block">
            <Server className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-xs font-semibold theme-heading mb-1">{t("install.usage.selfhost.title")}</p>
            <p className="text-[10px] theme-muted">{t("install.guides.selfhost.desc")}</p>
          </Link>
          <Link href="/install/guide#url" className="glass glass-hover glass-lift p-5 text-center animate-in cursor-pointer block">
            <Link2 className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-xs font-semibold theme-heading mb-1">{t("install.usage.url.title")}</p>
            <p className="text-[10px] theme-muted">{t("install.guides.url.desc")}</p>
          </Link>
        </div>
      </div>

      {/* ─── Author & Social ─── */}
      <div className="glass p-5">
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
      </div>
    </PageLayout>
  );
}

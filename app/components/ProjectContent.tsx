"use client";

import { useEffect, useState } from "react";
import {
  Code,
  Shield,
  Lock,
  FileText,
  Globe,
  Cpu,
  Heart,
  ExternalLink,
  User,
  Award,
  MapPin,
  Calendar,
  Users,
  BookOpen,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useLanguage } from "@/app/components/LanguageProvider";

interface AuthorData {
  login: string;
  name: string;
  avatar: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  profileUrl: string;
  createdAt: string | null;
}

export default function ProjectContent() {
  const { t } = useLanguage();
  const [author, setAuthor] = useState<AuthorData | null>(null);

  useEffect(() => {
    fetch("/api/author").then((r) => r.json()).then(setAuthor).catch(() => {});
  }, []);

  const features = [
    { icon: Lock, key: "project.feat.encryption" as const },
    { icon: FileText, key: "project.feat.format" as const },
    { icon: Shield, key: "project.feat.security" as const },
    { icon: Globe, key: "project.feat.i18n" as const },
    { icon: Cpu, key: "project.feat.device" as const },
    { icon: Award, key: "project.feat.compliance" as const },
  ];

  const links = [
    { icon: Code, label: "GitHub", href: "https://github.com/carrilloapps" },
    { icon: Globe, label: "carrillo.app", href: "https://carrillo.app" },
    { icon: Heart, label: t("nav.donate"), href: "https://www.buymeacoffee.com/carrilloapps" },
  ];

  return (
    <main className="flex-1 flex flex-col">
      <Navbar />

      <section className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 mb-6 !rounded-full">
              <Code className="w-3 h-3 text-primary" />
              <span className="text-[11px] font-medium text-primary font-mono tracking-wider">OPEN SOURCE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold theme-heading mb-4 tracking-tight">
              {t("project.title")}
            </h1>
            <p className="text-base theme-muted max-w-2xl mx-auto leading-relaxed">
              {t("project.subtitle")}
            </p>
          </div>

          {/* Repo card */}
          <a
            href="https://github.com/carrilloapps/zefer"
            target="_blank"
            rel="noopener noreferrer"
            className="block glass glow-green-sm glass-hover p-6 sm:p-8 mb-6 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl theme-primary-faint theme-primary-border border flex items-center justify-center shrink-0">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-semibold theme-heading">carrilloapps/zefer</h2>
                  <ExternalLink className="w-3.5 h-3.5 theme-faint" />
                </div>
                <p className="text-sm theme-muted mb-3">{t("project.repo.desc")}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full theme-primary-faint text-primary theme-primary-border border">MIT License</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full glass theme-muted">Next.js 16</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full glass theme-muted">TypeScript</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full glass theme-muted">Tailwind v4</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full glass theme-muted">AES-256-GCM</span>
                </div>
              </div>
            </div>
          </a>

          {/* About the project */}
          <div className="glass p-6 sm:p-8 mb-6">
            <h2 className="text-sm font-semibold theme-heading mb-3">{t("project.about.title")}</h2>
            <p className="text-[13px] theme-muted leading-relaxed">{t("project.about.desc")}</p>
          </div>

          {/* Features grid */}
          <div className="glass p-6 sm:p-8 mb-6">
            <h2 className="text-sm font-semibold theme-heading mb-4">{t("project.features.title")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feat) => (
                <div key={feat.key} className="glass !rounded-xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg theme-primary-faint theme-primary-border border flex items-center justify-center shrink-0">
                    <feat.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-xs theme-muted leading-relaxed">{t(feat.key)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div className="glass p-6 sm:p-8 mb-6">
            <h2 className="text-sm font-semibold theme-heading mb-4">{t("project.stack.title")}</h2>
            <div className="glass !rounded-xl overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {([
                    ["Framework", "Next.js 16.2.3 (React 19)"],
                    ["Language", "TypeScript 6"],
                    ["Styling", "Tailwind CSS v4"],
                    ["Encryption", "Web Crypto API (AES-256-GCM)"],
                    ["Key Derivation", "PBKDF2-SHA256 (300k-1M iter.)"],
                    ["Compression", "CompressionStream API (Gzip/Deflate)"],
                    ["Icons", "Lucide React"],
                    ["Hosting", "Vercel / Any static host"],
                    ["License", "MIT"],
                  ] as [string, string][]).map(([label, value]) => (
                    <tr key={label}>
                      <td className="text-xs theme-muted px-4 py-2.5 whitespace-nowrap">{label}</td>
                      <td className="text-xs font-mono theme-heading px-4 py-2.5 text-right">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Creator — dynamic from GitHub */}
          <div className="glass p-6 sm:p-8 mb-6">
            <h2 className="text-sm font-semibold theme-heading mb-4">{t("project.creator.title")}</h2>
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Avatar */}
              <a href={author?.profileUrl || "https://github.com/carrilloapps"} target="_blank" rel="noopener noreferrer" className="shrink-0 cursor-pointer">
                {author?.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name || "Author"}
                    width={72}
                    height={72}
                    className="w-[72px] h-[72px] rounded-2xl border-2 border-[var(--glass-border)] hover:border-[var(--primary-border)] transition-colors duration-200"
                  />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-2xl theme-primary-faint theme-primary-border border flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                )}
              </a>

              <div className="flex-1 min-w-0">
                {/* Name + handle */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold theme-heading">{author?.name || "José Carrillo"}</h3>
                  <a href={author?.profileUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:opacity-80 transition-opacity cursor-pointer font-mono">
                    @{author?.login || "carrilloapps"}
                  </a>
                </div>

                {/* Bio */}
                {author?.bio && <p className="text-xs theme-muted mb-2">{author.bio}</p>}
                {!author?.bio && <p className="text-xs theme-muted mb-2">{t("project.creator.desc")}</p>}

                {/* Meta row */}
                <div className="flex flex-wrap gap-3 mb-3">
                  {author?.location && (
                    <span className="flex items-center gap-1 text-[11px] theme-faint"><MapPin className="w-3 h-3" />{author.location}</span>
                  )}
                  {author?.company && (
                    <span className="flex items-center gap-1 text-[11px] theme-faint"><User className="w-3 h-3" />{author.company}</span>
                  )}
                  {author?.createdAt && (
                    <span className="flex items-center gap-1 text-[11px] theme-faint">
                      <Calendar className="w-3 h-3" />
                      {t("project.creator.since")} {new Date(author.createdAt).getFullYear()}
                    </span>
                  )}
                </div>

                {/* Stats + Links — unified style */}
                <div className="flex flex-wrap gap-2">
                  {author && (
                    <>
                      <a href={author.profileUrl} target="_blank" rel="noopener noreferrer" className="glass !rounded-lg px-3 py-1.5 flex items-center gap-1.5 hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer">
                        <BookOpen className="w-3 h-3 theme-faint" />
                        <span className="text-[11px] font-mono theme-heading">{author.publicRepos}</span>
                        <span className="text-[10px] theme-faint">repos</span>
                      </a>
                      <a href={`${author.profileUrl}?tab=followers`} target="_blank" rel="noopener noreferrer" className="glass !rounded-lg px-3 py-1.5 flex items-center gap-1.5 hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer">
                        <Users className="w-3 h-3 theme-faint" />
                        <span className="text-[11px] font-mono theme-heading">{author.followers}</span>
                        <span className="text-[10px] theme-faint">followers</span>
                      </a>
                    </>
                  )}
                  {links.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="glass !rounded-lg px-3 py-1.5 flex items-center gap-1.5 hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer">
                      <link.icon className="w-3 h-3 theme-faint" />
                      <span className="text-[11px] theme-heading">{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Donate CTA */}
          <div className="glass glow-green p-6 sm:p-8 text-center">
            <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="text-lg font-semibold theme-heading mb-2">{t("project.donate.title")}</h2>
            <p className="text-sm theme-muted mb-5 max-w-md mx-auto">{t("project.donate.desc")}</p>
            <a
              href="https://www.buymeacoffee.com/carrilloapps"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !w-auto inline-flex px-8"
            >
              <Heart className="w-4 h-4" /> {t("nav.donate")}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

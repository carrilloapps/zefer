"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// ─── Page layout wrapper ───

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 flex flex-col">
      <Navbar />
      <section className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">{children}</div>
      </section>
      <Footer />
    </main>
  );
}

// ─── Page header (badge + title + subtitle) ───

export function PageHeader({
  icon: Icon,
  badge,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center mb-10 animate-in">
      <div className="inline-flex items-center gap-2 glass px-4 py-1.5 mb-6 !rounded-full">
        <Icon className="w-3 h-3 text-primary" />
        <span className="text-[11px] font-medium text-primary font-mono tracking-wider">
          {badge.toUpperCase()}
        </span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold theme-heading mb-3 tracking-tight">
        {title}
      </h1>
      <p className="text-base theme-muted max-w-2xl mx-auto leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}

// ─── Icon box (used in form headers, section cards) ───

export function IconBox({
  icon: Icon,
  size = "md",
}: {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-9 h-9 rounded-xl",
    lg: "w-12 h-12 rounded-2xl",
  };
  const iconSizes = { sm: "w-3.5 h-3.5", md: "w-4 h-4", lg: "w-6 h-6" };

  return (
    <div className={`${sizes[size]} theme-primary-faint theme-primary-border border flex items-center justify-center shrink-0`}>
      <Icon className={`${iconSizes[size]} text-primary`} />
    </div>
  );
}

// ─── Section card (icon + title + description) ───

export function SectionCard({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="glass glass-hover p-5 sm:p-7 transition-all duration-300">
      <div className="flex items-start gap-4">
        <IconBox icon={icon} />
        <div>
          <h2 className="text-sm font-semibold theme-heading mb-2">{title}</h2>
          <p className="text-[13px] theme-muted leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Glass card (generic wrapper) ───

export function GlassCard({
  children,
  glow = false,
  className = "",
}: {
  children: ReactNode;
  glow?: boolean;
  className?: string;
}) {
  return (
    <div className={`glass p-6 sm:p-8 ${glow ? "glow-green" : ""} ${className}`}>
      {children}
    </div>
  );
}

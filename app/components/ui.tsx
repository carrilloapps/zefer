"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
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

// ─── Glass select (dropdown with search) ───

export function GlassSelect({
  value,
  onChange,
  options,
  label,
  icon: Icon,
  searchable = false,
  searchPlaceholder = "Search...",
  noResultsText = "No results",
}: {
  value: string | number;
  onChange: (v: string | number) => void;
  options: { label: string; value: string | number }[];
  label?: string;
  icon?: LucideIcon;
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && searchable && inputRef.current) inputRef.current.focus();
  }, [open, searchable]);

  const current = options.find((o) => o.value === value);
  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2">
          {Icon && <Icon className="w-3 h-3" />}{label}
        </label>
      )}
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(""); }}
        className="w-full flex items-center justify-between text-sm py-[0.6875rem] px-3 !rounded-lg border border-[var(--glass-border)] cursor-pointer hover:border-[var(--glass-border-hover)] transition-colors"
        style={{ background: "var(--input-solid)" }}
      >
        <span className="theme-text">{current?.label ?? ""}</span>
        <ChevronDown className={`w-3.5 h-3.5 theme-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 shadow-2xl z-50 !rounded-xl overflow-hidden animate-in border border-[var(--glass-border)]" style={{ background: "var(--glass-solid)" }}>
          {searchable && (
            <div className="p-2 border-b border-[var(--glass-border)]">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full text-xs px-2.5 py-1.5 bg-transparent theme-text placeholder:theme-faint outline-none"
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((o) => (
              <button
                key={String(o.value)}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full text-left text-xs px-3 py-2.5 transition-colors cursor-pointer ${
                  o.value === value ? "text-primary bg-[var(--glass-bg-hover)]" : "theme-muted hover:theme-text hover:bg-[var(--glass-bg)]"
                }`}
              >
                {o.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs theme-faint px-3 py-2.5">{noResultsText}</p>
            )}
          </div>
        </div>
      )}
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

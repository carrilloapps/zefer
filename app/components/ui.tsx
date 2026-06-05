"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, Info, Copy, Check } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useLanguage } from "@/app/components/LanguageProvider";
import type { TranslationKey } from "@/app/lib/i18n";

// ─── Info tooltip (hover / focus / tap) ───

/** Small (i) trigger with a plain-language explanation. The visual icon is
 *  small but the hit area is ~36px. */
export function InfoTip({ tipKey, align }: { tipKey: TranslationKey; align?: "left" | "right" }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <span className={`info-tip ${open ? "info-tip-open" : ""}`} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={(e) => { setOpen(!open); e.currentTarget.focus(); }}
        onBlur={() => setOpen(false)}
        aria-label={t("tip.aria")}
        className="relative w-4 h-4 flex items-center justify-center rounded-full theme-faint hover:text-primary transition-colors cursor-help before:content-[''] before:absolute before:-inset-2.5"
      >
        <Info className="w-3 h-3" aria-hidden="true" />
      </button>
      <span role="tooltip" className={`info-tip-bubble ${align === "left" ? "tip-left" : ""}${align === "right" ? "tip-right" : ""}`}>
        {t(tipKey)}
      </span>
    </span>
  );
}

// ─── Code block with lightweight syntax highlighting + copy ───

type CodeLang = "json" | "bash";

/** Dependency-free tokenizer: JSON keys/strings/numbers/booleans/comments,
 *  bash commands/flags/strings/comments. Colors come from theme variables. */
export function highlightCode(code: string, lang: CodeLang): ReactNode[] {
  const out: ReactNode[] = [];
  let k = 0;
  const push = (text: string, cls?: string) => {
    out.push(cls ? <span key={k++} className={cls}>{text}</span> : <span key={k++}>{text}</span>);
  };

  if (lang === "bash") {
    code.split("\n").forEach((line, li) => {
      if (li > 0) push("\n");
      if (/^\s*#/.test(line)) {
        push(line, "tok-cmt");
        return;
      }
      const re = /("(?:[^"\\]|\\.)*")|(--?[\w-]+)|(\$\w+)|([^\s"$-][^\s"]*)|(\s+)/g;
      let m: RegExpExecArray | null;
      let firstWord = true;
      while ((m = re.exec(line)) !== null) {
        if (m[1]) push(m[1], "tok-str");
        else if (m[2]) push(m[2], "tok-flag");
        else if (m[3]) push(m[3], "tok-num");
        else if (m[4]) { push(m[4], firstWord ? "tok-cmd" : undefined); firstWord = false; }
        else push(m[0]);
      }
    });
    return out;
  }

  // json / jsonc
  const re = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")(\s*:)?|(-?\b\d+(?:\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    if (m.index > last) push(code.slice(last, m.index));
    if (m[1]) push(m[1], "tok-cmt");
    else if (m[2] && m[3]) { push(m[2], "tok-key"); push(m[3]); }
    else if (m[2]) push(m[2], "tok-str");
    else if (m[4]) push(m[4], "tok-num");
    else if (m[5]) push(m[5], "tok-bool");
    last = re.lastIndex;
  }
  if (last < code.length) push(code.slice(last));
  return out;
}

export function CodeBlock({ code, lang = "json" }: { code: string; lang?: CodeLang }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="code-block relative group">
      <pre className="overflow-x-auto text-[11px] font-mono leading-relaxed whitespace-pre">
        <code>{highlightCode(code, lang)}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={t("aria.copy")}
        title={t("aria.copy")}
        className="absolute top-1.5 right-1.5 w-9 h-9 flex items-center justify-center rounded-lg theme-faint hover:theme-text hover:bg-[var(--glass-bg)] transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
      </button>
    </div>
  );
}

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
        className="w-full flex items-center justify-between text-sm py-[0.6875rem] px-3 rounded-xl border border-[var(--input-border)] cursor-pointer hover:border-[var(--input-border-focus)] transition-colors"
        style={{ background: "var(--input-bg)" }}
        aria-expanded={open}
        aria-haspopup="listbox"
        {...(label ? { "aria-label": label } : {})}
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
                aria-label={searchPlaceholder}
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

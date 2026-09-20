"use client";

import { useState, useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, Info, Copy, Check } from "lucide-react";
import { Select, Switch, Tooltip } from "radix-ui";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useLanguage } from "@/app/components/LanguageProvider";
import type { TranslationKey } from "@/app/lib/i18n";

// ─── Info tooltip (hover / focus / tap) ───

/** Bubble shared by InfoTip and any other Radix tooltip in the app. Radix
 *  handles positioning, collisions, Escape and the aria-describedby wiring the
 *  hand-rolled version never had. */
export function TipBubble({
  children,
  align = "center",
}: Readonly<{
  children: ReactNode;
  align?: "start" | "center" | "end";
}>) {
  return (
    <Tooltip.Portal>
      <Tooltip.Content side="top" align={align} sideOffset={6} collisionPadding={12} className="info-tip-bubble">
        {children}
      </Tooltip.Content>
    </Tooltip.Portal>
  );
}

/** `align` is expressed in page terms ("left"/"right"); Radix speaks anchor terms. */
const TIP_ALIGN = { left: "start", right: "end" } as const;

/** Small (i) trigger with a plain-language explanation. The visual icon is
 *  small but the hit area is ~36px. Radix drives hover and focus; the explicit
 *  pointer-down toggle keeps the bubble reachable by tap on touch devices,
 *  which a bare Radix tooltip would not be. */
export function InfoTip({ tipKey, align }: Readonly<{ tipKey: TranslationKey; align?: "left" | "right" }>) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); setOpen((o) => !o); }}
            aria-label={t("tip.aria")}
            className="relative w-4 h-4 flex items-center justify-center rounded-full theme-faint hover:text-primary transition-colors cursor-help before:content-[''] before:absolute before:-inset-2.5"
          >
            <Info className="w-3 h-3" aria-hidden="true" />
          </button>
        </Tooltip.Trigger>
        <TipBubble align={align ? TIP_ALIGN[align] : "center"}>
          {t(tipKey)}
        </TipBubble>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// ─── Toggle switch ───

/** Radix Switch: announces as `switch` with `aria-checked` (the sr-only
 *  checkbox it replaces announced as a plain checkbox) and gains a visible
 *  focus ring. `<label for>` still toggles it — a button is a labelable
 *  element — so the click target is unchanged. */
export function Toggle({
  checked,
  onCheckedChange,
  label,
  icon: Icon,
}: Readonly<{
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  icon: LucideIcon;
}>) {
  const id = useId();
  return (
    <span className="flex items-center gap-3 w-fit">
      <Switch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="toggle-track relative flex items-center w-9 h-5 rounded-full shrink-0 cursor-pointer"
      >
        <Switch.Thumb className="toggle-knob block w-4 h-4 rounded-full translate-x-0.5 data-[state=checked]:translate-x-[1.125rem]" />
      </Switch.Root>
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs theme-muted transition-colors cursor-pointer">
        <Icon className="w-3.5 h-3.5" />{label}
      </label>
    </span>
  );
}

// ─── Code block with lightweight syntax highlighting + copy ───

type CodeLang = "json" | "bash";

/** One token type: a sticky pattern tried at the current index and the class
 *  its match is painted with. Splitting the grammar into one small pattern per
 *  token keeps every regex trivial instead of one unreadable mega-alternation. */
interface TokenRule {
  re: RegExp;
  cls?: string;
}

const STRING_RE = /"(?:\\.|[^"\\])*"/y;

const BASH_RULES: TokenRule[] = [
  { re: STRING_RE, cls: "tok-str" },
  { re: /--?[\w-]+/y, cls: "tok-flag" },
  { re: /\$\w+/y, cls: "tok-num" },
  { re: /[^\s"]+/y, cls: "tok-word" },
  { re: /\s+/y },
];

const JSON_RULES: TokenRule[] = [
  { re: /\/\/[^\n]*/y, cls: "tok-cmt" },
  { re: /"(?:\\.|[^"\\])*"(?=\s*:)/y, cls: "tok-key" },
  { re: STRING_RE, cls: "tok-str" },
  { re: /-?\b\d+(?:\.\d+)?\b/y, cls: "tok-num" },
  { re: /\b(?:true|false|null)\b/y, cls: "tok-bool" },
];

/** Walk `src` left to right, emitting the first rule that matches at each
 *  index; an unmatched character is emitted on its own, unstyled. */
function scan(src: string, rules: TokenRule[], emit: (text: string, cls?: string) => void) {
  let i = 0;
  let plainFrom = 0;
  const flushPlain = (until: number) => {
    if (until > plainFrom) emit(src.slice(plainFrom, until));
  };

  while (i < src.length) {
    const hit = rules.find((rule) => {
      rule.re.lastIndex = i;
      return rule.re.test(src);
    });
    if (!hit) {
      i++;
      continue;
    }
    flushPlain(i);
    emit(src.slice(i, hit.re.lastIndex), hit.cls);
    i = hit.re.lastIndex;
    plainFrom = i;
  }
  flushPlain(src.length);
}

/** Dependency-free tokenizer: JSON keys/strings/numbers/booleans/comments,
 *  bash commands/flags/strings/comments. Colors come from theme variables. */
export function highlightCode(code: string, lang: CodeLang): ReactNode[] {
  const out: ReactNode[] = [];
  let k = 0;
  const push = (text: string, cls?: string) => {
    out.push(cls ? <span key={k++} className={cls}>{text}</span> : <span key={k++}>{text}</span>);
  };

  if (lang === "json") {
    scan(code, JSON_RULES, push);
    return out;
  }

  code.split("\n").forEach((line, li) => {
    if (li > 0) push("\n");
    if (line.trimStart().startsWith("#")) {
      push(line, "tok-cmt");
      return;
    }
    // The first bare word on a line is the command being run.
    let firstWord = true;
    scan(line, BASH_RULES, (text, cls) => {
      if (cls !== "tok-word") {
        push(text, cls);
        return;
      }
      push(text, firstWord ? "tok-cmd" : undefined);
      firstWord = false;
    });
  });
  return out;
}

export function CodeBlock({ code, lang = "json" }: Readonly<{ code: string; lang?: CodeLang }>) {
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

export function PageLayout({ children }: Readonly<{ children: ReactNode }>) {
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
}: Readonly<{
  icon: LucideIcon;
  badge: string;
  title: string;
  subtitle: string;
}>) {
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
}: Readonly<{
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
}>) {
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
}: Readonly<{
  icon: LucideIcon;
  title: string;
  description: string;
}>) {
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

/** Radix Select. Replaces a hand-rolled `aria-haspopup="listbox"` button that
 *  had no arrow-key navigation, no typeahead and no `aria-activedescendant`.
 *  Radix's built-in typeahead supersedes the old search box. Values are keyed
 *  as strings because Radix Select speaks strings; the numeric option value is
 *  handed back to `onChange` untouched. */
export function GlassSelect({
  value,
  onChange,
  options,
  label,
  icon: Icon,
}: Readonly<{
  value: string | number;
  onChange: (v: string | number) => void;
  options: { label: string; value: string | number }[];
  label: string;
  icon?: LucideIcon;
}>) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium theme-text mb-2 cursor-pointer">
        {Icon && <Icon className="w-3 h-3" />}{label}
      </label>
      <Select.Root
        value={String(value)}
        onValueChange={(v) => {
          // Radix speaks strings; hand the option's own (possibly numeric)
          // value back to the caller untouched.
          for (const o of options) {
            if (String(o.value) === v) onChange(o.value);
          }
        }}
      >
        <Select.Trigger
          id={id}
          className="group w-full flex items-center justify-between text-sm py-[0.6875rem] px-3 rounded-xl border border-[var(--input-border)] cursor-pointer hover:border-[var(--input-border-focus)] transition-colors theme-text"
          style={{ background: "var(--input-bg)" }}
        >
          <Select.Value />
          <Select.Icon asChild>
            <ChevronDown className="w-3.5 h-3.5 theme-faint transition-transform group-data-[state=open]:rotate-180" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content position="popper" sideOffset={6} collisionPadding={12} className="glass-select-content">
            <Select.Viewport>
              {options.map((o) => (
                <Select.Item key={String(o.value)} value={String(o.value)} className="glass-select-item">
                  <Select.ItemText>{o.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

// ─── Glass card (generic wrapper) ───

export function GlassCard({
  children,
  glow = false,
  className = "",
}: Readonly<{
  children: ReactNode;
  glow?: boolean;
  className?: string;
}>) {
  return (
    <div className={`glass p-6 sm:p-8 ${glow ? "glow-green" : ""} ${className}`}>
      {children}
    </div>
  );
}

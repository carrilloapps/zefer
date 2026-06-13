"use client";

import {
  Library, Package, Code, Lock, Unlock, KeyRound, ScanSearch,
  Boxes, FileCode, ShieldCheck, ExternalLink, AlertTriangle, ArrowRight,
} from "lucide-react";
import { PageLayout, PageHeader, CodeBlock } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";
import type { TranslationKey } from "@/app/lib/i18n";

const IMPORT_CODE = `// ESM / TypeScript
import { encodeZefer, decodeZefer, generateWithOptions, analyzePassword } from "zefer-cli";

// CommonJS
const { encodeZefer, analyzePassword } = require("zefer-cli");`;

const EXAMPLE_ENCRYPT = `import { encodeZefer } from "zefer-cli";
import { writeFile } from "node:fs/promises";

const buf = await encodeZefer({
  content: "api_key=abc123",
  passphrase: "a-strong-passphrase",
  fileName: null,
  expiresAt: 0,
  compression: "gzip",
  iterations: 600000,
});
await writeFile("secret.zefer", buf);`;

const EXAMPLE_DECRYPT = `import { decodeZefer } from "zefer-cli";
import { readFile } from "node:fs/promises";

const bytes = await readFile("secret.zefer");
const res = await decodeZefer(bytes.toString("utf-8"), "a-strong-passphrase", {
  rawBytes: bytes,
});
if (res.ok) console.log(res.payload.content);`;

const EXAMPLE_KEYGEN = `import { generateWithOptions, analyzePassword } from "zefer-cli";

const key = generateWithOptions("base58", 24, { groupSize: 6 });
const report = analyzePassword(key);
console.log(key, report.score, report.entropy);`;

const APIS: { icon: typeof Lock; sig: string; descKey: TranslationKey }[] = [
  { icon: Lock, sig: "encodeZefer(options) → Promise<Buffer>", descKey: "lib.api.encode.desc" },
  { icon: Unlock, sig: "decodeZefer(input, passphrase, options) → Promise<{ ok, payload }>", descKey: "lib.api.decode.desc" },
  { icon: KeyRound, sig: "generateWithOptions(mode, length, options) → string", descKey: "lib.api.keygen.desc" },
  { icon: ScanSearch, sig: "analyzePassword(password) → report", descKey: "lib.api.analyze.desc" },
];

const NOTES: TranslationKey[] = ["lib.notes.1", "lib.notes.2", "lib.notes.3"];

export default function LibraryContent() {
  const { t } = useLanguage();

  return (
    <PageLayout>
      <PageHeader
        icon={Library}
        badge={t("lib.badge")}
        title={t("lib.title")}
        subtitle={t("lib.subtitle")}
      />

      {/* What is it */}
      <div className="glass glow-green-sm p-6 sm:p-8 mb-6 animate-in">
        <h2 className="text-sm font-semibold theme-heading mb-2 flex items-center gap-2">
          <Library className="w-4 h-4 text-primary" />{t("lib.what.title")}
        </h2>
        <p className="text-xs theme-muted leading-relaxed">{t("lib.what.desc")}</p>
        <p className="text-[10px] font-mono theme-faint mt-3">{t("lib.req")}</p>
      </div>

      {/* Install + import */}
      <div className="glass p-6 sm:p-8 mb-6 animate-in">
        <h2 className="text-sm font-semibold theme-heading mb-2 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />{t("lib.install.title")}
        </h2>
        <p className="text-xs theme-muted leading-relaxed mb-3">{t("lib.install.desc")}</p>
        <CodeBlock code="npm install zefer-cli" lang="bash" />

        <h3 className="text-xs font-semibold theme-heading mt-5 mb-1.5 flex items-center gap-2">
          <Code className="w-3.5 h-3.5 text-primary" />{t("lib.import.title")}
        </h3>
        <p className="text-[11px] theme-muted leading-relaxed mb-2">{t("lib.import.desc")}</p>
        <CodeBlock code={IMPORT_CODE} lang="bash" />
      </div>

      {/* Exposed API */}
      <div className="glass p-6 sm:p-8 mb-6 animate-in">
        <h2 className="text-sm font-semibold theme-heading mb-2 flex items-center gap-2">
          <Boxes className="w-4 h-4 text-primary" />{t("lib.api.title")}
        </h2>
        <p className="text-[11px] theme-muted mb-4 leading-relaxed">{t("lib.api.desc")}</p>
        <div>
          {APIS.map((api, i) => (
            <div key={api.sig} className={`py-3.5 ${i > 0 ? "border-t border-[var(--border-subtle)]" : "pt-0"}`}>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg theme-primary-faint theme-primary-border border flex items-center justify-center shrink-0">
                  <api.icon className="w-4 h-4 text-primary" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-mono font-semibold theme-heading mb-1 break-all">{api.sig}</p>
                  <p className="text-[11px] theme-muted leading-relaxed">{t(api.descKey)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Examples */}
      <div className="glass p-6 sm:p-8 mb-6 animate-in">
        <h2 className="text-sm font-semibold theme-heading mb-4 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />{t("lib.examples.title")}
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-medium theme-heading mb-1.5">{t("lib.example.encrypt")}</p>
            <CodeBlock code={EXAMPLE_ENCRYPT} lang="bash" />
          </div>
          <div>
            <p className="text-[11px] font-medium theme-heading mb-1.5">{t("lib.example.decrypt")}</p>
            <CodeBlock code={EXAMPLE_DECRYPT} lang="bash" />
          </div>
          <div>
            <p className="text-[11px] font-medium theme-heading mb-1.5">{t("lib.example.keygen")}</p>
            <CodeBlock code={EXAMPLE_KEYGEN} lang="bash" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="glass p-6 sm:p-8 mb-6 animate-in">
        <h2 className="text-sm font-semibold theme-heading mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 theme-warning" />{t("lib.notes.title")}
        </h2>
        <ul className="space-y-2">
          {NOTES.map((k) => (
            <li key={k} className="flex items-start gap-2.5 text-[11px] theme-muted leading-relaxed">
              <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
              {t(k)}
            </li>
          ))}
        </ul>
      </div>

      {/* CTAs */}
      <div className="glass glow-green p-6 sm:p-8 animate-in">
        <div className="flex items-start gap-3 mb-5">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] theme-muted leading-relaxed">{t("lib.notes.3")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href="https://github.com/carrilloapps/zefer-cli/blob/main/docs/LIBRARY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1"
          >
            {t("lib.cta.docs")} <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.npmjs.com/package/zefer-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-medium border border-[var(--glass-border)] theme-muted hover:theme-text hover:bg-[var(--glass-bg)] transition-colors cursor-pointer"
          >
            {t("lib.cta.npm")} <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com/carrilloapps/zefer-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-medium border border-[var(--glass-border)] theme-muted hover:theme-text hover:bg-[var(--glass-bg)] transition-colors cursor-pointer"
          >
            {t("lib.cta.repo")} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </PageLayout>
  );
}

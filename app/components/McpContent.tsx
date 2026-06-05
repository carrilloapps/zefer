"use client";

import { useState } from "react";
import {
  Plug, Terminal, Wand2, Wrench, Lock, Unlock, KeyRound, ScanSearch,
  FileSearch, ShieldCheck, ExternalLink, ArrowRight, ChevronDown, Blocks,
} from "lucide-react";
import { PageLayout, PageHeader } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";
import type { TranslationKey } from "@/app/lib/i18n";

const CLIENT_CONFIG = `{
  "mcpServers": {
    "zefer": { "command": "zefer", "args": ["mcp"] }
  }
}`;

const NPX_CONFIG = `{
  "mcpServers": {
    "zefer": { "command": "npx", "args": ["-y", "zefer-cli", "mcp"] }
  }
}`;

const NPX_SNIPPET = `"command": "npx", "args": ["-y", "zefer-cli", "mcp"]`;

const EXAMPLE_CALL = `{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {
  "name": "zefer_encrypt",
  "arguments": {
    "text": "api_key=abc123",
    "passphrase": "my-strong-pass",
    "outputPath": "secret.zefer",
    "ttlMinutes": 1440,
    "compression": "gzip"
  }
}}`;

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="glass !rounded-xl p-4 overflow-x-auto text-[11px] font-mono theme-text leading-relaxed whitespace-pre">
      {code}
    </pre>
  );
}

const STD_CONFIG = `{
  "mcpServers": {
    "zefer": { "command": "zefer", "args": ["mcp"] }
  }
}`;

const CLIENTS: { name: string; descKey: TranslationKey; config: string }[] = [
  { name: "Claude Code", descKey: "mcp.client.claudecode", config: STD_CONFIG },
  { name: "Claude Desktop", descKey: "mcp.client.claudedesktop", config: STD_CONFIG },
  { name: "Cursor", descKey: "mcp.client.cursor", config: STD_CONFIG },
  { name: "Windsurf", descKey: "mcp.client.windsurf", config: STD_CONFIG },
  {
    name: "VS Code (Copilot)",
    descKey: "mcp.client.vscode",
    config: `{
  "servers": {
    "zefer": { "type": "stdio", "command": "zefer", "args": ["mcp"] }
  }
}`,
  },
  {
    name: "Zed",
    descKey: "mcp.client.zed",
    config: `{
  "context_servers": {
    "zefer": { "command": { "path": "zefer", "args": ["mcp"] } }
  }
}`,
  },
  {
    name: "Otra herramienta / Other",
    descKey: "mcp.client.generic",
    config: `# npm install
zefer mcp

# without installing
npx zefer-cli mcp

# standalone binary (no Node.js)
./zefer-linux-x64 mcp`,
  },
];

function ClientAccordion() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {CLIENTS.map((c, i) => (
        <div key={c.name} className="glass !rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            aria-controls={`mcp-client-${i}`}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-xs font-medium theme-text hover:bg-[var(--glass-bg)] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Blocks className="w-3.5 h-3.5 text-primary shrink-0" />
              {c.name}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 theme-faint shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && (
            <div id={`mcp-client-${i}`} className="px-4 pb-4 animate-in">
              <p className="text-[11px] theme-muted mb-2 leading-relaxed">{t(c.descKey)}</p>
              <CodeBlock code={c.config} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const TOOLS = [
  {
    icon: Lock,
    name: "zefer_encrypt",
    descKey: "mcp.tool.encrypt",
    returnsKey: "mcp.tool.encrypt.returns",
    params: ["passphrase*", "text | inputPath*", "outputPath", "secondPassphrase", "revealKey", "ttlMinutes", "compression", "question", "maxAttempts", "allowedIps"],
    example: `zefer_encrypt({ text: "api_key=abc", passphrase: "…", ttlMinutes: 1440 })`,
  },
  {
    icon: Unlock,
    name: "zefer_decrypt",
    descKey: "mcp.tool.decrypt",
    returnsKey: "mcp.tool.decrypt.returns",
    params: ["inputPath*", "passphrase*", "secondPassphrase", "questionAnswer", "outputPath", "overwrite"],
    example: `zefer_decrypt({ inputPath: "secret.zefer", passphrase: "…" })`,
  },
  {
    icon: KeyRound,
    name: "zefer_keygen",
    descKey: "mcp.tool.keygen",
    returnsKey: "mcp.tool.keygen.returns",
    params: ["mode", "length", "count", "excludeAmbiguous", "excludeChars", "requireAllClasses", "noRepeats", "groupSize"],
    example: `zefer_keygen({ mode: "base58", length: 24, count: 3, groupSize: 6 })`,
  },
  {
    icon: ScanSearch,
    name: "zefer_analyze_password",
    descKey: "mcp.tool.analyze",
    returnsKey: "mcp.tool.analyze.returns",
    params: ["password*"],
    example: `zefer_analyze_password({ password: "Tr0ub4dor&3" })`,
  },
  {
    icon: FileSearch,
    name: "zefer_inspect",
    descKey: "mcp.tool.inspect",
    returnsKey: "mcp.tool.inspect.returns",
    params: ["inputPath*"],
    example: `zefer_inspect({ inputPath: "secret.zefer" })`,
  },
] as const;

export default function McpContent() {
  const { t } = useLanguage();

  return (
    <PageLayout>
      <PageHeader
        icon={Plug}
        badge={t("mcp.badge")}
        title={t("mcp.title")}
        subtitle={t("mcp.subtitle")}
      />

      {/* What is it */}
      <div className="glass glow-green-sm p-6 sm:p-8 mb-6 animate-in">
        <h2 className="text-sm font-semibold theme-heading mb-2 flex items-center gap-2">
          <Plug className="w-4 h-4 text-primary" />{t("mcp.what.title")}
        </h2>
        <p className="text-xs theme-muted leading-relaxed">{t("mcp.what.desc")}</p>
      </div>

      {/* Setup */}
      <div className="glass p-6 sm:p-8 mb-6 animate-in">
        <h2 className="text-sm font-semibold theme-heading mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />{t("mcp.setup.title")}
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs theme-text mb-2 flex items-center gap-2">
              <span className="text-[10px] font-mono text-primary theme-primary-faint theme-primary-border border rounded-md px-1.5 py-0.5">01</span>
              {t("mcp.setup.step1")}
            </p>
            <CodeBlock code="npm install -g zefer-cli" />
          </div>
          <div>
            <p className="text-xs theme-text mb-2 flex items-center gap-2">
              <span className="text-[10px] font-mono text-primary theme-primary-faint theme-primary-border border rounded-md px-1.5 py-0.5">02</span>
              {t("mcp.setup.step2")}
            </p>
            <p className="text-[10px] theme-faint mb-1.5">{t("mcp.setup.optionA")}</p>
            <CodeBlock code={CLIENT_CONFIG} />
            <p className="text-[10px] theme-faint mb-1.5 mt-3">{t("mcp.setup.optionB")}</p>
            <CodeBlock code={NPX_CONFIG} />
          </div>
        </div>
      </div>

      {/* Per-tool integration accordions */}
      <div className="glass p-6 sm:p-8 mb-6 animate-in">
        <h2 className="text-sm font-semibold theme-heading mb-2 flex items-center gap-2">
          <Blocks className="w-4 h-4 text-primary" />{t("mcp.clients.title")}
        </h2>
        <p className="text-[11px] theme-muted mb-4 leading-relaxed">{t("mcp.clients.desc")}</p>
        <ClientAccordion />
        <div className="mt-4">
          <p className="text-[11px] theme-muted mb-1.5 leading-relaxed">{t("mcp.clients.npxnote")}</p>
          <CodeBlock code={NPX_SNIPPET} />
        </div>
      </div>

      {/* Smart detection */}
      <div className="glass p-6 sm:p-8 mb-6 animate-in">
        <h2 className="text-sm font-semibold theme-heading mb-3 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary" />{t("mcp.detect.title")}
        </h2>
        <ul className="space-y-2">
          {(["mcp.detect.1", "mcp.detect.2", "mcp.detect.3"] as const).map((k) => (
            <li key={k} className="flex items-start gap-2.5 text-[11px] theme-muted leading-relaxed">
              <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
              {t(k)}
            </li>
          ))}
        </ul>
      </div>

      {/* Tools */}
      <div className="glass p-6 sm:p-8 mb-6 animate-in">
        <h2 className="text-sm font-semibold theme-heading mb-4 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-primary" />{t("mcp.tools.title")}
        </h2>
        <div className="space-y-3">
          {TOOLS.map((tool) => (
            <div key={tool.name} className="glass !rounded-xl px-4 py-3.5">
              <div className="flex items-start gap-3 mb-2.5">
                <span className="w-8 h-8 rounded-lg theme-primary-faint theme-primary-border border flex items-center justify-center shrink-0">
                  <tool.icon className="w-4 h-4 text-primary" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-mono font-semibold theme-heading mb-0.5">{tool.name}</p>
                  <p className="text-[11px] theme-muted leading-relaxed">{t(tool.descKey)}</p>
                </div>
              </div>

              {/* Key parameters */}
              <p className="text-[9px] theme-faint uppercase tracking-wider mb-1.5">{t("mcp.tools.params")}</p>
              <div className="flex flex-wrap gap-1 mb-2.5">
                {tool.params.map((p) => (
                  <span
                    key={p}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${
                      p.endsWith("*")
                        ? "theme-primary-faint theme-primary-border text-primary"
                        : "glass theme-muted"
                    }`}
                  >
                    {p.replace("*", "")}{p.endsWith("*") && <span aria-hidden="true"> •</span>}
                  </span>
                ))}
              </div>

              {/* Returns */}
              <p className="text-[10px] theme-faint leading-relaxed mb-2">
                <span className="uppercase tracking-wider text-[9px]">{t("mcp.tools.returns")}: </span>
                <span className="theme-muted">{t(tool.returnsKey)}</span>
              </p>

              {/* Example */}
              <code className="block glass !rounded-lg px-3 py-2 text-[10px] font-mono text-primary overflow-x-auto whitespace-nowrap">
                {tool.example}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Example */}
      <div className="glass p-6 sm:p-8 mb-6 animate-in">
        <h2 className="text-sm font-semibold theme-heading mb-2 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />{t("mcp.example.title")}
        </h2>
        <p className="text-[11px] theme-muted mb-3 leading-relaxed">{t("mcp.example.desc")}</p>
        <CodeBlock code={EXAMPLE_CALL} />
      </div>

      {/* Privacy + CTAs */}
      <div className="glass glow-green p-6 sm:p-8 animate-in">
        <div className="flex items-start gap-3 mb-5">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] theme-muted leading-relaxed">{t("mcp.privacy")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href="https://github.com/carrilloapps/zefer-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1"
          >
            {t("mcp.cta.cli")} <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-medium glass theme-muted hover:theme-text transition-colors cursor-pointer"
          >
            {t("mcp.cta.spec")} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </PageLayout>
  );
}

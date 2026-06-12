import type { Metadata } from "next";
import McpContent from "@/app/components/McpContent";
import { pageMetadata } from "@/app/lib/seo";

const url = "https://zefer.carrillo.app/mcp";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = pageMetadata({
  path: "/mcp",
  title: "Zefer MCP Server — Encryption Tools for AI Agents",
  description:
    "Use Zefer from any AI agent via the Model Context Protocol: encrypt, decrypt, generate scored keys, analyze passwords and inspect .zefer files, locally.",
  keywords: [
    "MCP server",
    "Model Context Protocol",
    "AI agent encryption",
    "Claude MCP encryption",
    "zefer mcp",
    "MCP tools",
    "local encryption AI",
    "stdio MCP server",
  ],
  ogTitle: "Zefer MCP Server | Zefer",
  ogDescription:
    "Every Zefer capability as MCP tools for any AI agent: encrypt, decrypt, keygen, analyze, inspect. 100% local.",
  twitterTitle: "Zefer MCP Server | Zefer",
  twitterDescription:
    "Encryption tools for AI agents via the Model Context Protocol. Local, dependency-free, zero telemetry.",
});

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "MCP Server", item: url },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I connect Zefer to an MCP client?",
      acceptedAnswer: {
        "@type": "Answer",
        text: 'Install the CLI (npm install -g zefer-cli) and add { "mcpServers": { "zefer": { "command": "zefer", "args": ["mcp"] } } } to your client configuration (Claude Code, Claude Desktop, Cursor, Windsurf, VS Code). The server also auto-detects MCP mode when spawned with no arguments and piped stdin.',
      },
    },
    {
      "@type": "Question",
      name: "What tools does the Zefer MCP server expose?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Five tools: zefer_encrypt (text/files to .zefer with every option), zefer_decrypt, zefer_keygen (7 modes with strength scoring), zefer_analyze_password (entropy, attack scenarios, NIST/OWASP/AES-128/post-quantum compliance) and zefer_inspect (deep .zefer analysis without the passphrase). Everything runs locally over stdio with zero telemetry.",
      },
    },
  ],
};

export default function McpPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <McpContent />
    </>
  );
}

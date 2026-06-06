import type { Metadata } from "next";
import ProjectContent from "@/app/components/ProjectContent";

const url = "https://zefer.carrillo.app/project";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = {
  title: "Open-Source Client-Side Encryption Tool",
  description:
    "Zefer is an open-source encryption tool: web app plus official CLI with MCP server. AES-256-GCM, fully cross-compatible files. MIT Licensed.",
  keywords: [
    "open source encryption",
    "MIT license",
    "José Carrillo",
    "encryption tool open source",
    "zefer project",
    "zefer-cli",
    "encryption CLI",
    "client-side encryption tool",
    "AES-256-GCM open source",
    "Next.js encryption app",
  ],
  openGraph: {
    url,
    title: "Project | Zefer",
    description:
      "Open-source encryption: web app + official CLI with MCP server. AES-256-GCM, zero-knowledge, cross-compatible files. MIT Licensed.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project | Zefer",
    description:
      "Open-source encryption: web app + official CLI with MCP server. AES-256-GCM, zero-knowledge. MIT Licensed by José Carrillo.",
  },
  alternates: { canonical: url },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Project", item: url },
  ],
};

export default function ProjectPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ProjectContent />
    </>
  );
}

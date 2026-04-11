import type { Metadata } from "next";
import ProjectContent from "@/app/components/ProjectContent";

const url = "https://zefer.carrillo.app/project";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = {
  title: "Project",
  description:
    "Zefer is an open-source, client-side encryption tool built with Next.js and Web Crypto API. MIT Licensed. Created by José Carrillo (@carrilloapps).",
  keywords: [
    "open source encryption",
    "MIT license",
    "José Carrillo",
    "carrilloapps",
    "zefer project",
    "client-side encryption tool",
    "AES-256-GCM open source",
    "Next.js encryption app",
  ],
  openGraph: {
    url,
    title: "Project | Zefer",
    description:
      "Open-source, client-side encryption tool. AES-256-GCM, zero-knowledge, MIT Licensed. Built with Next.js and Web Crypto API.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project | Zefer",
    description:
      "Open-source client-side encryption tool. AES-256-GCM, zero-knowledge architecture. MIT Licensed by José Carrillo.",
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

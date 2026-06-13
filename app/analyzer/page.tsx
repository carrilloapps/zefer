import type { Metadata } from "next";
import AnalyzerContent from "@/app/components/AnalyzerContent";
import { pageMetadata } from "@/app/lib/seo";

const url = "https://zefer.carrillo.app/analyzer";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = pageMetadata({
  path: "/analyzer",
  title: ".zefer File Analyzer — Inspect Encrypted Files",
  description:
    "Inspect the public header of any .zefer file without the passphrase: format, iterations, compression, hint and note. 100% in your browser.",
  keywords: [
    "zefer file analyzer",
    "zefer file inspector",
    "encrypted file analysis",
    "ZEFB3 format",
    "ZEFR3 format",
    "file header inspector",
    "client-side file analysis",
    "encrypted file metadata",
  ],
  ogTitle: ".zefer File Analyzer | Zefer",
  ogDescription:
    "Inspect any .zefer file's public header without the passphrase. Format, KDF strength, compression. 100% client-side.",
  twitterTitle: ".zefer File Analyzer | Zefer",
  twitterDescription:
    "Inspect .zefer files without the passphrase: format, iterations, compression. Nothing leaves your browser.",
});

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: ".zefer Analyzer", item: url },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What can I see in a .zefer file without the passphrase?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only the public header: format (ZEFB3 or ZEFR3), content mode (text or file), PBKDF2 iterations, compression method, and the optional public hint and note. Everything else — expiration, IP restrictions, secret question, max attempts and the content itself — is sealed inside the AES-256-GCM ciphertext.",
      },
    },
    {
      "@type": "Question",
      name: "Is the analyzed file uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The analyzer reads the file's bytes locally in your browser using the File API. The file never leaves your device and nothing is transmitted or stored.",
      },
    },
  ],
};

export default function AnalyzerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <AnalyzerContent />
    </>
  );
}

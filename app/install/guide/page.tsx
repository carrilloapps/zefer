import type { Metadata } from "next";
import GuideContent from "@/app/components/GuideContent";
import { pageMetadata } from "@/app/lib/seo";

const url = "https://zefer.carrillo.app/install/guide";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = pageMetadata({
  path: "/install/guide",
  title: "How to Use Zefer — Encrypt & Decrypt Files Guide",
  description:
    "Step-by-step guide to encrypt and decrypt files with Zefer. URL parameters, dual keys, IP restrictions, and self-hosting.",
  keywords: [
    "zefer guide",
    "encrypt files",
    "decrypt files",
    "URL parameters",
    "encryption tutorial",
    "AES-256 encryption guide",
    "self-host encryption",
    "file encryption tutorial",
  ],
  ogTitle: "Usage Guide | Zefer",
  ogDescription:
    "Step-by-step guide to encrypt and decrypt files with Zefer. Advanced security features, URL automation, and self-hosting.",
  twitterTitle: "Usage Guide | Zefer",
  twitterDescription:
    "Complete encryption and decryption guide for Zefer. Advanced security, URL parameters, dual keys, and self-hosting.",
});

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Install", item: `${siteUrl}/install` },
    { "@type": "ListItem", position: 3, name: "Usage Guide", item: url },
  ],
};

export default function GuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <GuideContent />
    </>
  );
}

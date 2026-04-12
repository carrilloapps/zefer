import type { Metadata } from "next";
import VsContent from "@/app/components/VsContent";

const url = "https://zefer.carrillo.app/vs/cryptomator";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = {
  title: "Zefer vs Cryptomator — File Sharing vs Cloud Encryption",
  description:
    "Compare Zefer and Cryptomator. Browser-based file encryption for sharing vs transparent cloud storage encryption. Features, use cases, and security compared.",
  keywords: ["zefer vs cryptomator", "cryptomator alternative", "cloud encryption comparison", "cryptomator review", "encrypt files for sharing"],
  openGraph: { url, title: "Zefer vs Cryptomator — File Sharing vs Cloud Encryption", description: "Shareable encrypted files vs transparent cloud vault encryption. Full comparison." },
  twitter: { card: "summary_large_image", title: "Zefer vs Cryptomator", description: "Encrypted file sharing vs cloud vault encryption. Which approach fits your needs?" },
  alternates: { canonical: url },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Zefer vs Cryptomator", item: url },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is the difference between Zefer and Cryptomator?", acceptedAnswer: { "@type": "Answer", text: "Zefer encrypts individual files for sharing (browser-based, no installation). Cryptomator creates encrypted vaults that sync transparently with cloud storage (Dropbox, Google Drive, OneDrive). Zefer is for ad-hoc sharing; Cryptomator is for ongoing cloud protection." } },
    { "@type": "Question", name: "Can I use Zefer instead of Cryptomator?", acceptedAnswer: { "@type": "Answer", text: "They serve different purposes. Use Zefer to encrypt and share specific files with others (with expiration, dual keys, IP restrictions). Use Cryptomator to encrypt your cloud storage transparently. Many users benefit from both." } },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <VsContent competitor="cryptomator" />
    </>
  );
}

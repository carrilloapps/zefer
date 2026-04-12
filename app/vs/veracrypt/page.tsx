import type { Metadata } from "next";
import VsContent from "@/app/components/VsContent";

const url = "https://zefer.carrillo.app/vs/veracrypt";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = {
  title: "Zefer vs VeraCrypt — Shareable Files vs Full-Disk Encryption",
  description:
    "Compare Zefer and VeraCrypt. Browser-based file encryption for sharing vs full-disk and container encryption. Different tools for different threats.",
  keywords: ["zefer vs veracrypt", "veracrypt alternative", "file encryption vs disk encryption", "veracrypt review", "veracrypt online alternative"],
  openGraph: { url, title: "Zefer vs VeraCrypt — Shareable Files vs Full-Disk Encryption", description: "Encrypted shareable files vs encrypted disk volumes. Different tools, different threats.", images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: "Zefer vs VeraCrypt" }] },
  twitter: { card: "summary_large_image", title: "Zefer vs VeraCrypt", description: "Shareable encrypted files vs full-disk encryption. Which threat model fits yours?", images: [`${siteUrl}/twitter-image`] },
  alternates: { canonical: url },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Zefer vs VeraCrypt", item: url },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Should I use Zefer or VeraCrypt?", acceptedAnswer: { "@type": "Answer", text: "It depends on your threat model. Use Zefer to encrypt individual files and share them with others (browser-based, with expiration and access controls). Use VeraCrypt to encrypt entire disk volumes or containers for local storage protection. They complement each other." } },
    { "@type": "Question", name: "Can Zefer replace VeraCrypt?", acceptedAnswer: { "@type": "Answer", text: "No — they solve different problems. Zefer encrypts files for sharing (like sending an API key to a colleague). VeraCrypt protects local storage (like encrypting a USB drive). Zefer runs in the browser; VeraCrypt requires desktop installation." } },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <VsContent competitor="veracrypt" />
    </>
  );
}

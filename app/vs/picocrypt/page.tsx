import type { Metadata } from "next";
import VsContent from "@/app/components/VsContent";
import { pageMetadata } from "@/app/lib/seo";

const url = "https://zefer.carrillo.app/vs/picocrypt";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = pageMetadata({
  path: "/vs/picocrypt",
  title: "Zefer vs Picocrypt — Browser vs Desktop Encryption",
  description:
    "Compare Zefer and Picocrypt: browser-based AES-256-GCM vs lightweight desktop XChaCha20. Features, security, and use cases compared side by side.",
  keywords: ["zefer vs picocrypt", "picocrypt alternative", "browser encryption vs desktop", "picocrypt review", "file encryption comparison"],
  ogTitle: "Zefer vs Picocrypt — Browser vs Desktop Encryption",
  ogDescription: "Browser-based AES-256-GCM vs lightweight desktop XChaCha20. Full comparison.",
  imageAlt: "Zefer vs Picocrypt",
  twitterTitle: "Zefer vs Picocrypt",
  twitterDescription: "Browser encryption vs desktop CLI. Which file encryption tool fits your workflow?",
});

const breadcrumbJsonLd = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Zefer vs Picocrypt", item: url },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is the difference between Zefer and Picocrypt?", acceptedAnswer: { "@type": "Answer", text: "Zefer is a browser-based encryption tool using AES-256-GCM with advanced access controls (expiration, dual key, IP restriction). Picocrypt is a lightweight desktop application using XChaCha20-Poly1305, designed for simplicity and offline use with CLI support." } },
    { "@type": "Question", name: "Is Zefer more secure than Picocrypt?", acceptedAnswer: { "@type": "Answer", text: "Both use strong 256-bit encryption. Zefer uses AES-256-GCM (hardware-accelerated), Picocrypt uses XChaCha20-Poly1305 (timing-attack resistant). The main difference is access control: Zefer adds expiration, IP restriction, and attempt limits inside the encrypted payload." } },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <VsContent competitor="picocrypt" />
    </>
  );
}

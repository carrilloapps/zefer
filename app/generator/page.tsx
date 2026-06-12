import type { Metadata } from "next";
import GeneratorContent from "@/app/components/GeneratorContent";
import { pageMetadata } from "@/app/lib/seo";

const url = "https://zefer.carrillo.app/generator";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = pageMetadata({
  path: "/generator",
  title: "Advanced Password Generator & Strength Analyzer",
  description:
    "Generate cryptographically secure passwords and analyze any password's strength: entropy, crack time, and weaknesses. 100% in your browser.",
  keywords: [
    "password generator",
    "secure password generator",
    "password strength analyzer",
    "password entropy calculator",
    "crack time estimator",
    "random password",
    "crypto.getRandomValues",
    "client-side password tool",
  ],
  ogTitle: "Password Generator & Analyzer | Zefer",
  ogDescription:
    "Generate cryptographically secure passwords and analyze strength, entropy and crack time. 100% client-side.",
  twitterTitle: "Password Generator & Analyzer | Zefer",
  twitterDescription:
    "Secure password generation and strength analysis: entropy, crack time, weaknesses. Nothing leaves your browser.",
});

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Password Generator", item: url },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does Zefer generate secure passwords?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zefer uses the Web Crypto API (crypto.getRandomValues) with rejection sampling to eliminate modulo bias, producing perfectly uniform random passwords. Five modes are available: Unicode (CJK + emoji + symbols), Secure (Latin + symbols + accents), Alphanumeric, Hex, and UUID v7. Generation happens entirely in your browser.",
      },
    },
    {
      "@type": "Question",
      name: "How is password strength calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The analyzer estimates the character pool from the classes present (lowercase, uppercase, digits, symbols, unicode), computes maximum entropy as log2(pool) × length, then applies penalties for structural weaknesses: leaked-list matches, repeated blocks, sequences, keyboard patterns, and embedded years. Crack times are estimated for online (10^4 guesses/s) and offline GPU (10^12 guesses/s) attacks.",
      },
    },
    {
      "@type": "Question",
      name: "Are analyzed passwords sent anywhere?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Both generation and analysis run 100% client-side in your browser. No password, generated or analyzed, is ever stored or transmitted to any server.",
      },
    },
  ],
};

export default function GeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <GeneratorContent />
    </>
  );
}

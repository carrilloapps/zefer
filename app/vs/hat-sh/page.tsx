import type { Metadata } from "next";
import HatShContent from "@/app/components/HatShContent";

const url = "https://zefer.carrillo.app/vs/hat-sh";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = {
  title: "Zefer vs Hat.sh — Encryption Tools Compared",
  description:
    "Detailed comparison of Zefer and Hat.sh. Both are free, open-source, browser-based encryption tools. See which one fits your needs: features, security, and UX compared side by side.",
  keywords: [
    "zefer vs hat.sh",
    "hat.sh alternative",
    "hat.sh vs zefer",
    "browser encryption comparison",
    "client-side encryption tools",
    "file encryption online",
    "hat.sh review",
    "best browser encryption tool",
  ],
  openGraph: {
    url,
    title: "Zefer vs Hat.sh — Encryption Tools Compared",
    description:
      "Detailed comparison of Zefer and Hat.sh. Free, open-source, browser-based file encryption tools compared side by side.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zefer vs Hat.sh — Encryption Tools Compared",
    description:
      "Which browser encryption tool is right for you? Zefer and Hat.sh compared on features, security, UX, and more.",
  },
  alternates: { canonical: url },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Zefer vs Hat.sh", item: url },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the difference between Zefer and Hat.sh?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both are free, open-source, browser-based encryption tools. Zefer uses AES-256-GCM with PBKDF2 and offers advanced features like file expiration, dual passphrase, reveal keys, secret questions, and IP restrictions. Hat.sh uses XChaCha20-Poly1305 with Argon2id and focuses on simplicity with public-key cryptography support (X25519).",
      },
    },
    {
      "@type": "Question",
      name: "Is Zefer a good alternative to Hat.sh?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Zefer is ideal if you need advanced access controls (expiration, IP allowlists, secret questions, max attempts) or want to share encrypted files with multiple security layers. Hat.sh is better if you prefer X25519 public-key encryption or need support for 10+ languages.",
      },
    },
    {
      "@type": "Question",
      name: "Which encryption algorithm is more secure, AES-256-GCM or XChaCha20-Poly1305?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both are considered highly secure and used in production systems worldwide. AES-256-GCM (used by Zefer) is hardware-accelerated in most modern CPUs and is the standard for TLS and government use. XChaCha20-Poly1305 (used by Hat.sh) is resistant to timing attacks and performs well in software. For practical purposes, both are equally safe.",
      },
    },
  ],
};

export default function HatShPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <HatShContent />
    </>
  );
}

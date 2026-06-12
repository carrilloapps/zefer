import type { Metadata } from "next";
import HomeContent from "@/app/components/HomeContent";
import { pageMetadata, SITE_URL } from "@/app/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "",
  title: "Zefer — Encrypt & Share Secrets Securely Online",
  absoluteTitle: true,
  description:
    "Encrypt text and files into password-protected .zefer files with AES-256-GCM. 100% client-side, zero-knowledge. No servers, no traces. Free & open source.",
  keywords: [
    "file encryption",
    "secret sharing",
    "AES-256-GCM",
    "zero knowledge",
    "client-side encryption",
    "password protected files",
    "encrypt files online",
    "secure file transfer",
    "PBKDF2",
    "zefer",
    "encrypt passwords",
    "share API keys securely",
    "browser encryption tool",
  ],
  ogTitle: "Zefer — Share Secrets Securely",
  ogDescription:
    "Encrypt text and files into password-protected .zefer files. AES-256-GCM, 100% client-side, zero-knowledge. No servers, no traces.",
  twitterDescription:
    "Encrypt text and files into password-protected .zefer files. AES-256-GCM encryption, 100% client-side, zero-knowledge.",
  imageAlt: "Zefer — Share Secrets Securely",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Zefer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zefer is a free, open-source tool that encrypts text and files into password-protected .zefer files using AES-256-GCM. Everything happens in your browser — no server ever stores, processes, or transmits your data. You can share the encrypted file through any channel, and only someone with the passphrase can open it.",
      },
    },
    {
      "@type": "Question",
      name: "Is Zefer free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Zefer is completely free and open source under the MIT license. There are no accounts, no subscriptions, no ads, and no usage limits. You can also self-host it or use the official zefer-cli command-line tool.",
      },
    },
    {
      "@type": "Question",
      name: "Is Zefer secure and private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zefer uses AES-256-GCM authenticated encryption with PBKDF2-SHA256 key derivation (up to 1,000,000 iterations). It is zero-knowledge and 100% client-side: passphrases and keys never leave your device, there are no cookies or trackers, and security metadata (expiration, IP limits, secret question) is sealed inside the encrypted payload, not the public header.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need an account to use Zefer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Zefer requires no account, no email, and no sign-up. Open the site, type or upload your content, set a passphrase of at least 6 characters, and download the encrypted .zefer file instantly.",
      },
    },
    {
      "@type": "Question",
      name: "What is a .zefer file and how do I open it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A .zefer file is a portable, password-protected encrypted file that contains your content along with the salt and IV needed for decryption. To open it, upload it back to Zefer (or use zefer-cli) and enter the correct passphrase. Without the passphrase the file is completely unreadable.",
      },
    },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Zefer",
  url: SITE_URL,
  description:
    "Client-side encryption tool that converts text and files into password-protected .zefer files using AES-256-GCM. Zero-knowledge, no servers, no traces.",
  inLanguage: ["en", "es", "pt"],
  publisher: {
    "@type": "Person",
    name: "José Carrillo",
    url: "https://carrillo.app",
  },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <HomeContent />
    </>
  );
}

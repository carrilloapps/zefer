import type { Metadata } from "next";
import HomeContent from "@/app/components/HomeContent";

const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = {
  title: "Zefer — Share Secrets Securely",
  description:
    "Encrypt text and files into password-protected .zefer files using AES-256-GCM. 100% client-side, zero-knowledge. No servers, no traces, no cookies.",
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
  openGraph: {
    url: siteUrl,
    title: "Zefer — Share Secrets Securely",
    description:
      "Encrypt text and files into password-protected .zefer files. AES-256-GCM, 100% client-side, zero-knowledge. No servers, no traces.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zefer — Share Secrets Securely",
    description:
      "Encrypt text and files into password-protected .zefer files. AES-256-GCM encryption, 100% client-side, zero-knowledge.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function Home() {
  return <HomeContent />;
}

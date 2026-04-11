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
  ],
  openGraph: {
    url: siteUrl,
    title: "Zefer — Share Secrets Securely",
    description:
      "Encrypt text and files into password-protected .zefer files. AES-256-GCM, 100% client-side, zero-knowledge.",
  },
  twitter: {
    title: "Zefer — Share Secrets Securely",
    description:
      "Encrypt text and files into .zefer files. AES-256-GCM, no servers, no traces.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function Home() {
  return <HomeContent />;
}

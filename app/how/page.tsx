import type { Metadata } from "next";
import HowContent from "@/app/components/HowContent";

const url = "https://zefer.carrillo.app/how";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how Zefer encrypts your secrets end-to-end using AES-256-GCM, PBKDF2 key derivation, and zero-knowledge architecture. Every step explained in detail.",
  keywords: ["how encryption works", "AES-256-GCM explained", "PBKDF2 key derivation", "end-to-end encryption", "zero knowledge architecture"],
  openGraph: {
    url,
    title: "How It Works | Zefer",
    description: "Learn how Zefer encrypts your secrets end-to-end using AES-256-GCM and PBKDF2. Every step explained.",
  },
  twitter: {
    title: "How It Works | Zefer",
    description: "How Zefer encrypts your secrets end-to-end. AES-256-GCM, PBKDF2, zero-knowledge.",
  },
  alternates: { canonical: url },
};

export default function HowPage() {
  return <HowContent />;
}

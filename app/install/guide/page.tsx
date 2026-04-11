import type { Metadata } from "next";
import GuideContent from "@/app/components/GuideContent";

const url = "https://zefer.carrillo.app/install/guide";

export const metadata: Metadata = {
  title: "Usage Guide",
  description:
    "Complete guide to encrypt and decrypt files with Zefer. Learn about advanced security features, URL parameters for automation, and self-hosting.",
  keywords: ["zefer guide", "encrypt files", "decrypt files", "URL parameters", "encryption tutorial"],
  openGraph: {
    url,
    title: "Usage Guide | Zefer",
    description: "Complete guide to encrypt and decrypt files with Zefer. Advanced features and automation.",
  },
  twitter: {
    title: "Usage Guide | Zefer",
    description: "Complete encryption and decryption guide for Zefer.",
  },
  alternates: { canonical: url },
};

export default function GuidePage() {
  return <GuideContent />;
}

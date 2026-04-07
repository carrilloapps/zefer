import type { Metadata } from "next";
import PrivacyContent from "@/app/components/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy & Security",
  description:
    "Zefer privacy policy and security details. Zero-knowledge architecture, AES-256-GCM encryption, minimal metadata, automatic expiration, and burn-after-reading.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}

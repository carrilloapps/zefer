import type { Metadata } from "next";
import HowContent from "@/app/components/HowContent";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how Zefer encrypts your secrets end-to-end using AES-256-GCM, PBKDF2 key derivation, and zero-knowledge architecture. Every step explained in detail.",
};

export default function HowPage() {
  return <HowContent />;
}

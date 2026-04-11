import type { Metadata } from "next";
import DeviceContent from "@/app/components/DeviceContent";

const url = "https://zefer.carrillo.app/device";

export const metadata: Metadata = {
  title: "Device & Performance",
  description:
    "Understand how Zefer detects your device capabilities and how to optimize your browser for maximum encryption performance.",
  keywords: ["device detection", "browser performance", "encryption speed", "Web Crypto API", "file size limits"],
  openGraph: {
    url,
    title: "Device & Performance | Zefer",
    description: "How Zefer detects your device capabilities and optimizes encryption performance.",
  },
  twitter: {
    title: "Device & Performance | Zefer",
    description: "Device detection and browser optimization for encryption.",
  },
  alternates: { canonical: url },
};

export default function DevicePage() {
  return <DeviceContent />;
}

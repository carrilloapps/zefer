import type { Metadata } from "next";
import InstallContent from "@/app/components/InstallContent";

const url = "https://zefer.carrillo.app/install";

export const metadata: Metadata = {
  title: "Install",
  description:
    "Learn how to use Zefer, encrypt and decrypt files, configure advanced security options, self-host your own instance, and install as PWA.",
  keywords: ["install zefer", "PWA", "self-hosting", "encryption setup", "progressive web app"],
  openGraph: {
    url,
    title: "Install | Zefer",
    description: "Install Zefer as PWA, self-host your own instance, or use it directly from the browser.",
  },
  twitter: {
    title: "Install | Zefer",
    description: "Install Zefer as PWA or self-host your own instance.",
  },
  alternates: { canonical: url },
};

export default function InstallPage() {
  return <InstallContent />;
}

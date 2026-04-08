import type { Metadata } from "next";
import InstallContent from "@/app/components/InstallContent";

export const metadata: Metadata = {
  title: "Install",
  description: "Learn how to use Zefer, encrypt and decrypt files, configure advanced security options, self-host your own instance, and install as PWA.",
};

export default function InstallPage() {
  return <InstallContent />;
}

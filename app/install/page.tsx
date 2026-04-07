import type { Metadata } from "next";
import InstallContent from "@/app/components/InstallContent";

export const metadata: Metadata = {
  title: "Install",
  description: "Download Zefer for Windows, macOS, Linux, iOS, and Android. Coming soon.",
};

export default function InstallPage() {
  return <InstallContent />;
}

import type { Metadata } from "next";
import DeviceContent from "@/app/components/DeviceContent";

export const metadata: Metadata = {
  title: "Device & Performance",
  description:
    "Understand how Zefer detects your device capabilities and how to optimize your browser for maximum encryption performance.",
};

export default function DevicePage() {
  return <DeviceContent />;
}

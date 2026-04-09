import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/app/components/LanguageProvider";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import LegalBanner from "@/app/components/LegalBanner";
import ToastProvider from "@/app/components/ToastProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://zefer.carrillo.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050a0e" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafb" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Zefer — Share Secrets Securely",
    template: "%s | Zefer",
  },
  description:
    "Encrypt secrets into password-protected .zefer files. 100% client-side, AES-256-GCM encryption, zero-knowledge. No servers, no traces.",
  keywords: [
    "file encryption",
    "secret sharing",
    "AES-256-GCM",
    "zero knowledge",
    "client-side encryption",
    "password protected files",
    "zefer",
    "encrypt files",
    "PBKDF2",
  ],
  authors: [{ name: "Jose Carrillo", url: "https://carrillo.app" }],
  creator: "Jose Carrillo",
  publisher: "Jose Carrillo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_VE", "pt_BR"],
    url: siteUrl,
    siteName: "Zefer",
    title: "Zefer — Share Secrets Securely",
    description:
      "Encrypt secrets into password-protected .zefer files. 100% client-side, AES-256-GCM, zero-knowledge.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zefer — Share Secrets Securely",
    description:
      "Encrypt secrets into .zefer files. 100% client-side, AES-256-GCM, no servers.",
    creator: "@carrilloapps",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "security",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js"))` }} />
      </head>
      <body className="min-h-full flex flex-col bg-grid">
        <div className="ambient-glow" aria-hidden="true" />
        <div className="blob-accent" aria-hidden="true" />
        <ThemeProvider>
          <LanguageProvider>
            <div className="relative z-10 flex flex-col flex-1">{children}</div>
            <LegalBanner />
            <ToastProvider />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

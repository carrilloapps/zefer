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
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.github.com" />
        <script dangerouslySetInnerHTML={{ __html: `if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js"))` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Zefer",
              url: "https://zefer.carrillo.app",
              description: "Client-side encryption tool that converts text and files into password-protected .zefer files using AES-256-GCM. Zero-knowledge, no servers, no traces.",
              applicationCategory: "SecurityApplication",
              operatingSystem: "Any",
              browserRequirements: "Requires a modern browser with Web Crypto API support",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
              featureList: [
                "AES-256-GCM encryption",
                "PBKDF2-SHA256 key derivation",
                "100% client-side processing",
                "Zero-knowledge architecture",
                "File and text encryption",
                "Configurable expiration",
                "Dual passphrase support",
                "IP restriction",
                "Secret question protection",
                "Gzip/Deflate compression",
                "Progressive Web App",
              ],
              screenshot: "https://zefer.carrillo.app/opengraph-image",
              author: {
                "@type": "Person",
                name: "José Carrillo",
                url: "https://carrillo.app",
                sameAs: [
                  "https://github.com/carrilloapps",
                  "https://linkedin.com/in/carrilloapps",
                  "https://x.com/carrilloapps",
                ],
              },
              sourceOrganization: {
                "@type": "Organization",
                name: "Carrillo Apps",
                url: "https://carrillo.app",
              },
              license: "https://opensource.org/licenses/MIT",
              softwareVersion: "0.4.1",
              inLanguage: ["en", "es", "pt"],
              isAccessibleForFree: true,
              installUrl: "https://zefer.carrillo.app/install",
              releaseNotes: "https://github.com/carrilloapps/zefer/blob/main/CHANGELOG.md",
              softwareHelp: {
                "@type": "CreativeWork",
                url: "https://zefer.carrillo.app/install/guide",
              },
            }),
          }}
        />
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

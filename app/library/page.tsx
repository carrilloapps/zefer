import type { Metadata } from "next";
import LibraryContent from "@/app/components/LibraryContent";
import { pageMetadata } from "@/app/lib/seo";

const url = "https://zefer.carrillo.app/library";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = pageMetadata({
  path: "/library",
  title: "Zefer Library — Node.js Encryption API",
  description:
    "Use Zefer as a programmatic Node.js library: import encodeZefer, decodeZefer, generateWithOptions and analyzePassword (ESM & CommonJS). Since v1.3.0.",
  keywords: [
    "zefer library",
    "node.js encryption library",
    "encodeZefer",
    "decodeZefer",
    "AES-256-GCM node",
    "encryption npm package",
    "programmatic encryption API",
    "ESM CommonJS encryption",
  ],
  ogTitle: "Zefer as a Library | Zefer",
  ogDescription:
    "Import the same encryption engine into your Node.js code: encodeZefer, decodeZefer, generateWithOptions, analyzePassword. ESM & CommonJS.",
  twitterTitle: "Zefer as a Library | Zefer",
  twitterDescription:
    "Use Zefer's engine programmatically in Node.js — encrypt, decrypt, keygen and analyze. ESM & CommonJS, since v1.3.0.",
});

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Library", item: url },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I use Zefer in my own Node.js code?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Since v1.3.0, the zefer-cli package exposes a zero-side-effect programmatic library. Install it with npm and import the same core functions the web app and CLI use — encodeZefer, decodeZefer, generateWithOptions and analyzePassword — directly from services, AWS Lambda functions, or build scripts.",
      },
    },
    {
      "@type": "Question",
      name: "Is the Zefer library ESM or CommonJS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both. The library is published as ESM and CommonJS with TypeScript types included, so you can `import { encodeZefer } from \"zefer-cli\"` or `const { encodeZefer } = require(\"zefer-cli\")`. The package's \".\" export resolves to the library, not the CLI bundle.",
      },
    },
    {
      "@type": "Question",
      name: "Are files created with the library compatible with the Zefer web app and CLI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The library produces the same ZEFB3/ZEFR3 binary format with the same cryptographic parameters (AES-256-GCM, PBKDF2-SHA256), so a file encrypted via the library opens in the web app and the CLI and vice versa. Note the library never auto-benchmarks — always pass an explicit iterations value.",
      },
    },
  ],
};

export default function LibraryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <LibraryContent />
    </>
  );
}

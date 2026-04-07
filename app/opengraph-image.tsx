import { ImageResponse } from "next/og";

export const alt = "Zefer — Share Secrets Securely";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050a0e",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient blobs */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)",
            top: -100,
            left: -50,
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)",
            bottom: -80,
            right: -30,
            filter: "blur(80px)",
          }}
        />

        {/* Shield icon */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: 32 }}
        >
          <path
            d="M16 2L4 8v8c0 7.18 5.1 13.88 12 15.4C22.9 29.88 28 23.18 28 16V8L16 2z"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M11 16l4 4 6-7"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Zefer
          </div>
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.5)",
              maxWidth: 600,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Share secrets, not risks
          </div>
        </div>

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 32,
            padding: "8px 20px",
            borderRadius: 100,
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#22c55e",
            }}
          />
          <div
            style={{
              fontSize: 13,
              color: "#22c55e",
              fontFamily: "monospace",
              letterSpacing: "0.05em",
            }}
          >
            E2E ENCRYPTED &bull; ZERO-KNOWLEDGE &bull; AES-256-GCM
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

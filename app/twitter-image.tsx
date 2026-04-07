import { ImageResponse } from "next/og";

export const alt = "Zefer — Share Secrets Securely";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
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

        <svg
          width="64"
          height="64"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: 24 }}
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

        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          Zefer
        </div>
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.5)",
            marginTop: 8,
          }}
        >
          End-to-end encrypted secret sharing
        </div>
      </div>
    ),
    { ...size }
  );
}

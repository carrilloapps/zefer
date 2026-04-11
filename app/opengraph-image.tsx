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
        {/* Ambient glow — green top-left */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)",
            top: -150,
            left: -100,
            filter: "blur(100px)",
          }}
        />
        {/* Ambient glow — cyan bottom-right */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
            bottom: -120,
            right: -80,
            filter: "blur(100px)",
          }}
        />
        {/* Subtle grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Shield icon */}
        <svg
          width="88"
          height="88"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: 28 }}
        >
          <path
            d="M16 2L4 8v8c0 7.18 5.1 13.88 12 15.4C22.9 29.88 28 23.18 28 16V8L16 2z"
            fill="rgba(34,197,94,0.08)"
            stroke="#22c55e"
            strokeWidth="1.8"
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
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.03em",
            }}
          >
            Zefer
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.5)",
              maxWidth: 650,
              textAlign: "center",
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
            }}
          >
            Share secrets, not risks
          </div>
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 36,
          }}
        >
          {["AES-256-GCM", "Zero-Knowledge", "100% Client-Side"].map(
            (label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 100,
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.18)",
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                />
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(34,197,94,0.9)",
                    fontFamily: "monospace",
                    letterSpacing: "0.03em",
                  }}
                >
                  {label}
                </div>
              </div>
            )
          )}
        </div>

        {/* Bottom URL bar */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.25)",
              fontFamily: "monospace",
              letterSpacing: "0.04em",
            }}
          >
            zefer.carrillo.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

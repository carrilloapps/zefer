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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          background: "#050a0e",
          position: "relative",
          overflow: "hidden",
          padding: "60px 80px",
          gap: 60,
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)",
            top: -200,
            right: -100,
            filter: "blur(100px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
            bottom: -150,
            left: -50,
            filter: "blur(100px)",
          }}
        />
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Left — Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 160,
            height: 160,
            borderRadius: 32,
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.15)",
            flexShrink: 0,
          }}
        >
          <svg
            width="96"
            height="96"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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
        </div>

        {/* Right — Text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Zefer
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <div
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.4,
                letterSpacing: "-0.01em",
              }}
            >
              End-to-end encrypted secret sharing.
            </div>
            <div
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.4,
                letterSpacing: "-0.01em",
              }}
            >
              No servers. No traces. No cookies.
            </div>
          </div>

          {/* Feature row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 8,
            }}
          >
            {["AES-256-GCM", "PBKDF2", "Open Source"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
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
                    fontSize: 12,
                    color: "rgba(34,197,94,0.9)",
                    fontFamily: "monospace",
                    letterSpacing: "0.03em",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 40,
            fontSize: 13,
            color: "rgba(255,255,255,0.2)",
            fontFamily: "monospace",
            letterSpacing: "0.04em",
          }}
        >
          zefer.carrillo.app
        </div>
      </div>
    ),
    { ...size }
  );
}

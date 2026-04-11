import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #060d0b 0%, #050a0e 50%, #070a12 100%)",
          borderRadius: 40,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Green glow */}
        <div
          style={{
            position: "absolute",
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)",
            top: 20,
            left: 20,
            filter: "blur(30px)",
          }}
        />
        {/* Cyan accent glow */}
        <div
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
            bottom: 15,
            right: 15,
            filter: "blur(20px)",
          }}
        />
        {/* Shield */}
        <svg
          width="100"
          height="100"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 2L4 8v8c0 7.18 5.1 13.88 12 15.4C22.9 29.88 28 23.18 28 16V8L16 2z"
            fill="rgba(34,197,94,0.1)"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M11 16l4 4 6-7"
            stroke="#22c55e"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}

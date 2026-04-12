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
          background: "linear-gradient(145deg, #050a0e 0%, #0a1628 50%, #050a0e 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient blobs */}
        <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.14) 0%, transparent 60%)", top: -300, right: -100, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 60%)", bottom: -200, left: -80, filter: "blur(80px)" }} />
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Shield icon */}
        <svg width="80" height="80" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 28 }}>
          <path d="M16 2L4 8v8c0 7.18 5.1 13.88 12 15.4C22.9 29.88 28 23.18 28 16V8L16 2z" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
          <path d="M11 16l4 4 6-7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Brand + version */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 56, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.03em" }}>Zefer</div>
          <div style={{ padding: "5px 14px", borderRadius: 100, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", fontSize: 18, color: "#22c55e", fontFamily: "monospace" }}>v0.4.1</div>
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", marginTop: 16, textAlign: "center", lineHeight: 1.4, maxWidth: 750 }}>End-to-end encrypted secret sharing. AES-256-GCM, no servers, no traces.</div>

        {/* Tech pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 100, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3178c6" }} />
            <div style={{ fontSize: 16, color: "#22c55e", fontFamily: "monospace" }}>TypeScript</div>
          </div>
          <div style={{ padding: "8px 20px", borderRadius: 100, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 16, color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>AES-256-GCM</div>
          <div style={{ padding: "8px 20px", borderRadius: 100, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 16, color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>Zero-Knowledge</div>
          <div style={{ padding: "8px 20px", borderRadius: 100, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 16, color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>Open Source</div>
        </div>

        {/* Footer */}
        <div style={{ position: "absolute", bottom: 28, fontSize: 16, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", letterSpacing: "0.03em" }}>zefer.carrillo.app</div>
      </div>
    ),
    { ...size }
  );
}

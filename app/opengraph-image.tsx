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
          background: "linear-gradient(145deg, #050a0e 0%, #0a1628 50%, #050a0e 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient blobs */}
        <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 60%)", top: -350, left: -200, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 60%)", bottom: -250, right: -100, filter: "blur(80px)" }} />
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Logo + Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <svg width="52" height="52" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2L4 8v8c0 7.18 5.1 13.88 12 15.4C22.9 29.88 28 23.18 28 16V8L16 2z" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
            <path d="M11 16l4 4 6-7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 44, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>Zefer</div>
          <div style={{ padding: "4px 14px", borderRadius: 100, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", fontSize: 16, color: "#22c55e", fontFamily: "monospace" }}>v0.4.1</div>
        </div>

        {/* Headline */}
        <div style={{ fontSize: 64, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.035em", lineHeight: 1.1, textAlign: "center", marginTop: 4 }}>Share secrets, not risks.</div>

        {/* Subtitle */}
        <div style={{ fontSize: 26, color: "rgba(255,255,255,0.7)", marginTop: 20, textAlign: "center", lineHeight: 1.4, maxWidth: 800 }}>Encrypt text and files into password-protected .zefer files. AES-256-GCM, 100% client-side, zero-knowledge.</div>

        {/* Tech pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 36 }}>
          <div style={{ padding: "8px 20px", borderRadius: 100, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", fontSize: 16, color: "#22c55e", fontFamily: "monospace" }}>AES-256-GCM</div>
          <div style={{ padding: "8px 20px", borderRadius: 100, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 16, color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>PBKDF2</div>
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

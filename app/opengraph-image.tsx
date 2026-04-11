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
        <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.14) 0%, transparent 65%)", top: -280, left: -200, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 65%)", bottom: -200, right: -150, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <svg width="44" height="44" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2L4 8v8c0 7.18 5.1 13.88 12 15.4C22.9 29.88 28 23.18 28 16V8L16 2z" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M11 16l4 4 6-7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 32, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "-0.02em" }}>Zefer</div>
          <div style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 12, color: "#22c55e", fontFamily: "monospace" }}>v0.2.0</div>
        </div>

        <div style={{ fontSize: 60, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.035em", lineHeight: 1.1, textAlign: "center", marginTop: 8 }}>Share secrets, not risks.</div>
        <div style={{ fontSize: 21, color: "rgba(255,255,255,0.4)", marginTop: 16, textAlign: "center", lineHeight: 1.5, maxWidth: 680 }}>Encrypt text and files into password-protected .zefer files using AES-256-GCM. 100% client-side, zero-knowledge.</div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 32 }}>
          <div style={{ padding: "6px 16px", borderRadius: 100, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)", fontSize: 13, color: "rgba(34,197,94,0.9)", fontFamily: "monospace" }}>AES-256-GCM</div>
          <div style={{ padding: "6px 16px", borderRadius: 100, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>PBKDF2</div>
          <div style={{ padding: "6px 16px", borderRadius: 100, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>Zero-Knowledge</div>
          <div style={{ padding: "6px 16px", borderRadius: 100, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>Open Source</div>
        </div>

        <div style={{ position: "absolute", bottom: 24, fontSize: 13, color: "rgba(255,255,255,0.15)", fontFamily: "monospace", letterSpacing: "0.04em" }}>github.com/carrilloapps/zefer</div>
      </div>
    ),
    { ...size }
  );
}

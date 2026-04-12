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
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 65%)", top: -250, right: -100, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)", bottom: -180, left: -80, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />

        <svg width="72" height="72" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 24 }}>
          <path d="M16 2L4 8v8c0 7.18 5.1 13.88 12 15.4C22.9 29.88 28 23.18 28 16V8L16 2z" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M11 16l4 4 6-7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 52, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.03em" }}>Zefer</div>
          <div style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 14, color: "#22c55e", fontFamily: "monospace" }}>v0.4.0</div>
        </div>

        <div style={{ fontSize: 22, color: "rgba(255,255,255,0.45)", marginTop: 12, textAlign: "center", lineHeight: 1.4 }}>End-to-end encrypted secret sharing. No servers, no traces.</div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 16px", borderRadius: 100, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3178c6" }} />
            <div style={{ fontSize: 13, color: "rgba(34,197,94,0.9)", fontFamily: "monospace" }}>TypeScript</div>
          </div>
          <div style={{ padding: "6px 16px", borderRadius: 100, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>AES-256-GCM</div>
          <div style={{ padding: "6px 16px", borderRadius: 100, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>Zero-Knowledge</div>
          <div style={{ padding: "6px 16px", borderRadius: 100, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>Open Source</div>
        </div>

        <div style={{ position: "absolute", bottom: 24, fontSize: 13, color: "rgba(255,255,255,0.15)", fontFamily: "monospace", letterSpacing: "0.04em" }}>github.com/carrilloapps/zefer</div>
      </div>
    ),
    { ...size }
  );
}

import type { FC, ReactNode, CSSProperties } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Lock, Unlock, Check, Clock, FileArchive, FileLock2 } from "lucide-react";
import { COLORS, FONTS } from "../lib/theme";
import { enter, clamp } from "../lib/animation";
import { Eyebrow } from "../components/layout";

const SECRET = "api_key=sk_live_9f2c8a1b4e7d3a6f";

/** Pointer that follows a key-framed path and pulses on "clicks". */
const Cursor: FC = () => {
  const f = useCurrentFrame();
  const fr = [18, 40, 122, 140, 172, 188, 190, 210];
  const xs = [1480, 960, 960, 960, 960, 690, 690, 960];
  const ys = [980, 405, 405, 570, 570, 650, 650, 726];
  const x = interpolate(f, fr, xs, clamp);
  const y = interpolate(f, fr, ys, clamp);
  const appear = interpolate(f, [14, 22], [0, 1], clamp);
  const fade = interpolate(f, [300, 320], [1, 0], clamp);
  const ripple = (center: number) =>
    interpolate(f, [center, center + 22], [0, 1], clamp) * (f >= center && f < center + 22 ? 1 : 0);
  const ripples: [number, number, number][] = [
    [690, 650, ripple(186)],
    [960, 726, ripple(214)],
  ];
  return (
    <>
      {ripples.map(([cx, cy, r], i) =>
        r > 0 ? (
          <div key={i} style={{ position: "absolute", left: cx, top: cy, width: 0, height: 0 }}>
            <div
              style={{
                position: "absolute", left: -40, top: -40, width: 80, height: 80, borderRadius: 999,
                border: `2px solid ${COLORS.green}`, opacity: 1 - r, transform: `scale(${0.3 + r * 1.4})`,
              }}
            />
          </div>
        ) : null,
      )}
      <div style={{ position: "absolute", left: x, top: y, opacity: appear * fade, transform: "translate(-2px,-2px)" }}>
        <svg width={30} height={30} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
          <path d="M5 3l14 7-6 1.5L9.5 18z" fill="#fff" stroke="#0b1118" strokeWidth={1.2} strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};

const Field: FC<{ x: number; y: number; w: number; h: number; label: string; active: boolean; children: ReactNode }> = ({
  x, y, w, h, label, active, children,
}) => (
  <>
    <div style={{ position: "absolute", left: x, top: y - 30, fontSize: 19, color: COLORS.muted, fontWeight: 600 }}>{label}</div>
    <div
      style={{
        position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 14,
        background: COLORS.inputBg, border: `1.5px solid ${active ? "rgba(34,197,94,0.6)" : COLORS.line}`,
        boxShadow: active ? "0 0 0 4px rgba(34,197,94,0.12)" : "none",
        padding: 18, color: COLORS.text, fontFamily: FONTS.mono, fontSize: 24, overflow: "hidden",
      }}
    >
      {children}
    </div>
  </>
);

const Caret: FC<{ on: boolean }> = ({ on }) => {
  const f = useCurrentFrame();
  const blink = on && Math.floor(f / 8) % 2 === 0;
  return <span style={{ opacity: blink ? 1 : 0, color: COLORS.green }}>▌</span>;
};

/** The animated Zefer encrypt UI mock that drives the demo. */
const MockUI: FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const win = spring({ frame: f, fps, config: { damping: 18 } });
  const winStyle: CSSProperties = {
    opacity: win,
    transform: `translateY(${interpolate(win, [0, 1], [40, 0])}px) scale(${interpolate(win, [0, 1], [0.96, 1])})`,
  };

  const secretChars = Math.max(0, Math.min(SECRET.length, Math.floor((f - 44) / 2.4)));
  const typingSecret = f >= 44 && f < 122;
  const passDots = Math.max(0, Math.min(14, Math.floor((f - 144) / 2)));
  const typingPass = f >= 144 && f < 172;
  const strength = passDots / 14;
  const expiresOn = f >= 186;
  const clicked = f >= 214;
  const progress = interpolate(f, [224, 298], [0, 1], clamp);
  const success = f >= 300;

  const dot = (bg: string, size = 12) => <span style={{ width: size, height: size, borderRadius: 999, background: bg }} />;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          ...winStyle, position: "relative", width: 1160, height: 720, borderRadius: 22,
          background: COLORS.panel, border: `1px solid ${COLORS.line}`,
          boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,197,94,0.05)",
        }}
      >
        {/* title bar */}
        <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", borderBottom: `1px solid ${COLORS.line}` }}>
          {dot("#ff5f57")}
          {dot("#febc2e")}
          {dot("#28c840")}
          <div
            style={{
              marginLeft: 18, flex: 1, maxWidth: 360, height: 30, borderRadius: 999, background: COLORS.inputBg,
              border: `1px solid ${COLORS.line}`, display: "flex", alignItems: "center", gap: 8, padding: "0 14px",
              fontFamily: FONTS.mono, fontSize: 15, color: COLORS.muted,
            }}
          >
            <Lock size={13} color={COLORS.green} />
            zefer.carrillo.app
          </div>
        </div>

        {/* tabs */}
        <div style={{ display: "flex", gap: 8, padding: "18px 200px 0" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 12, background: COLORS.green, color: COLORS.bg, fontWeight: 700, fontSize: 19 }}>
            <Lock size={18} /> Encrypt
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 12, color: COLORS.muted, fontWeight: 600, fontSize: 19 }}>
            <Unlock size={18} /> Decrypt
          </div>
        </div>

        <Field x={200} y={150} w={760} h={150} label="Your secret" active={typingSecret}>
          <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {SECRET.slice(0, secretChars)}
            <Caret on={typingSecret} />
          </span>
        </Field>

        <Field x={200} y={362} w={760} h={62} label="Passphrase (min. 6 characters)" active={typingPass}>
          <span style={{ letterSpacing: 6, fontSize: 28 }}>
            {"•".repeat(passDots)}
            <Caret on={typingPass} />
          </span>
        </Field>
        {/* strength bar */}
        <div style={{ position: "absolute", left: 200, top: 436, width: 760, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ width: `${strength * 100}%`, height: "100%", borderRadius: 999, background: strength > 0.75 ? COLORS.green : strength > 0.4 ? "#eab308" : "#ef4444" }} />
        </div>

        {/* options */}
        <div style={{ position: "absolute", left: 200, top: 460, display: "flex", gap: 10 }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 999, fontSize: 17, fontWeight: 600, fontFamily: FONTS.sans,
              border: `1px solid ${expiresOn ? COLORS.primaryBorder : COLORS.line}`,
              background: expiresOn ? COLORS.primaryFaint : "transparent",
              color: expiresOn ? COLORS.green : COLORS.muted,
            }}
          >
            {expiresOn ? <Check size={15} strokeWidth={3} /> : <Clock size={15} />} Expires in 24h
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 999, fontSize: 17, fontWeight: 600, color: COLORS.faint, border: `1px solid ${COLORS.line}` }}>
            <FileArchive size={15} /> Gzip
          </div>
        </div>

        {/* action zone: button → progress → success (same spot) */}
        <div style={{ position: "absolute", left: 200, top: 526, width: 760, height: 70 }}>
          {!clicked && (
            <div
              style={{
                width: "100%", height: "100%", borderRadius: 16, background: COLORS.green, color: COLORS.bg,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                fontSize: 24, fontWeight: 800, fontFamily: FONTS.sans,
                transform: `scale(${interpolate(f, [212, 214, 218], [1, 0.97, 1], clamp)})`,
                boxShadow: f > 200 ? "0 0 40px rgba(34,197,94,0.4)" : "none",
              }}
            >
              <Lock size={22} /> Encrypt &amp; download
            </div>
          )}
          {clicked && !success && (
            <div style={{ width: "100%", height: "100%", borderRadius: 16, background: COLORS.inputBg, border: `1px solid ${COLORS.line}`, padding: "0 22px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.mono, fontSize: 18, color: COLORS.muted }}>
                <span>Encrypting · AES-256-GCM · PBKDF2-SHA256</span>
                <span style={{ color: COLORS.green }}>{Math.round(progress * 100)}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ width: `${progress * 100}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.greenDim}, ${COLORS.green})` }} />
              </div>
            </div>
          )}
          {success && (
            <div style={{ width: "100%", height: "100%", borderRadius: 16, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.5)", padding: "0 22px", display: "flex", alignItems: "center", gap: 16, transform: `scale(${interpolate(f, [300, 312], [0.96, 1], clamp)})` }}>
              <span style={{ width: 40, height: 40, borderRadius: 999, background: COLORS.green, color: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={24} strokeWidth={3} />
              </span>
              <div style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                <FileLock2 size={30} color={COLORS.green} />
                <div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 700, color: COLORS.text }}>secret.zefer</div>
                  <div style={{ fontSize: 16, color: COLORS.muted }}>Downloaded · 1.3 KB · encrypted locally</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Cursor />
    </AbsoluteFill>
  );
};

export const DemoScene: FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", ...enter(f, fps, 4) }}>
        <Eyebrow text="See it in action" />
      </div>
      <MockUI />
    </AbsoluteFill>
  );
};

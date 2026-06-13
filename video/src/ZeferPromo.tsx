import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const GREEN = "#22c55e";
const BG = "#050a0e";
const TEXT = "#f1f5f9";
const MUTED = "#94a3b8";
const FAINT = "#64748b";
const SANS =
  "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Consolas', 'SF Mono', Menlo, monospace";

/** Fade + slide-up driven by a spring that starts at `delay`. */
function useEnter(delay: number): React.CSSProperties {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return { opacity: s, transform: `translateY(${interpolate(s, [0, 1], [22, 0])}px)` };
}

const Shield: React.FC<{ size: number; drawFrom: number }> = ({ size, drawFrom }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [drawFrom, drawFrom + 34], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const checkDraw = interpolate(frame, [drawFrom + 22, drawFrom + 44], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const glow = interpolate(frame % 90, [0, 45, 90], [0.35, 0.7, 0.35]);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none"
      style={{ filter: `drop-shadow(0 0 ${size * 0.06}px rgba(34,197,94,${glow}))` }}>
      <path
        d="M16 2L4 8v8c0 7.18 5.1 13.88 12 15.4C22.9 29.88 28 23.18 28 16V8L16 2z"
        stroke={GREEN} strokeWidth={2.2} strokeLinejoin="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={draw} />
      <path d="M11 16l4 4 6-7" stroke={GREEN} strokeWidth={2.2}
        strokeLinecap="round" strokeLinejoin="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={checkDraw} />
    </svg>
  );
};

const Chip: React.FC<{ label: string; delay: number; u: number }> = ({ label, delay, u }) => {
  const e = useEnter(delay);
  return (
    <div style={{
      ...e, display: "inline-flex", alignItems: "center", gap: u * 0.8,
      padding: `${u * 0.9}px ${u * 1.8}px`, borderRadius: 999,
      border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)",
      color: TEXT, fontFamily: SANS, fontSize: u * 2.1, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      <span style={{ width: u * 1.1, height: u * 1.1, borderRadius: 999, background: GREEN }} />
      {label}
    </div>
  );
};

const Center: React.FC<{ children: React.ReactNode; u: number }> = ({ children, u }) => (
  <AbsoluteFill style={{
    alignItems: "center", justifyContent: "center", flexDirection: "column",
    gap: u * 1.6, padding: u * 6, textAlign: "center",
  }}>{children}</AbsoluteFill>
);

const Brand: React.FC<{ u: number }> = ({ u }) => {
  const e = useEnter(14);
  return <div style={{ ...e, fontSize: u * 12, fontWeight: 800, color: TEXT, letterSpacing: -u * 0.3, lineHeight: 1 }}>Zefer</div>;
};

const Badge: React.FC<{ u: number; delay: number; text: string }> = ({ u, delay, text }) => {
  const e = useEnter(delay);
  return (
    <div style={{
      ...e, fontFamily: MONO, fontSize: u * 1.9, letterSpacing: u * 0.2, color: GREEN,
      padding: `${u * 0.7}px ${u * 1.6}px`, borderRadius: 999,
      border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)",
    }}>{text}</div>
  );
};

const Title: React.FC<{ u: number; delay: number; maxW: number; children: React.ReactNode }> = ({ u, delay, maxW, children }) => {
  const e = useEnter(delay);
  return <div style={{ ...e, fontSize: u * 5.2, fontWeight: 700, color: TEXT, maxWidth: maxW, lineHeight: 1.15 }}>{children}</div>;
};

const ChipRow: React.FC<{ u: number; maxW: number; items: string[] }> = ({ u, maxW, items }) => (
  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: u * 1.4, maxWidth: maxW, marginTop: u * 2 }}>
    {items.map((label, i) => <Chip key={label} label={label} delay={8 + i * 6} u={u} />)}
  </div>
);

const FlowBox: React.FC<{ label: string; accent?: boolean; delay: number; u: number }> = ({ label, accent, delay, u }) => {
  const e = useEnter(delay);
  return (
    <div style={{
      ...e, padding: `${u * 2}px ${u * 2.6}px`, borderRadius: u * 1.6,
      border: `1px solid ${accent ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.12)"}`,
      background: accent ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
      color: accent ? GREEN : TEXT, fontFamily: MONO, fontSize: u * 2.4, fontWeight: 700,
    }}>{label}</div>
  );
};

const FlowArrow: React.FC<{ delay: number; u: number; portrait: boolean }> = ({ delay, u, portrait }) => {
  const e = useEnter(delay);
  return <div style={{ ...e, color: GREEN, fontSize: u * 3.4, fontWeight: 800 }}>{portrait ? "↓" : "→"}</div>;
};

const Flow: React.FC<{ u: number; portrait: boolean }> = ({ u, portrait }) => (
  <div style={{
    display: "flex", flexDirection: portrait ? "column" : "row",
    alignItems: "center", justifyContent: "center", gap: u * 1.6, marginTop: u * 2,
  }}>
    <FlowBox label="Texto / Archivo" delay={10} u={u} />
    <FlowArrow delay={16} u={u} portrait={portrait} />
    <FlowBox label="🔒 AES-256-GCM" accent delay={22} u={u} />
    <FlowArrow delay={28} u={u} portrait={portrait} />
    <FlowBox label="secreto.zefer" delay={34} u={u} />
  </div>
);

const CTA: React.FC<{ u: number }> = ({ u }) => {
  const e1 = useEnter(8);
  const e2 = useEnter(18);
  return (
    <>
      <div style={{ ...e1, fontSize: u * 5.5, fontWeight: 800, color: TEXT }}>
        zefer<span style={{ color: GREEN }}>.carrillo.app</span>
      </div>
      <div style={{ ...e2, fontSize: u * 2.6, color: MUTED, fontWeight: 500 }}>Gratis y open source · MIT</div>
    </>
  );
};

const NetworksFooter: React.FC<{ u: number; text: string }> = ({ u, text }) => {
  const e = useEnter(28);
  return <div style={{ ...e, marginTop: u * 3, color: FAINT, fontFamily: MONO, fontSize: u * 1.7 }}>{text}</div>;
};

export const ZeferPromo: React.FC<{ networks?: string }> = ({ networks }) => {
  const { width, height, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const u = Math.min(width, height) / 100;
  const portrait = height >= width;
  const maxW = width * 0.84;

  const outro = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: SANS, opacity: outro }}>
      <AbsoluteFill style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: `${u * 5}px ${u * 5}px`,
        maskImage: "radial-gradient(circle at 50% 42%, black, transparent 75%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 42%, black, transparent 75%)",
      }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, rgba(34,197,94,0.22), transparent 60%)" }} />

      <Sequence durationInFrames={75}>
        <Center u={u}>
          <Shield size={u * (portrait ? 26 : 22)} drawFrom={4} />
          <Brand u={u} />
          <Badge u={u} delay={20} text="E2E · AES-256-GCM" />
        </Center>
      </Sequence>

      <Sequence from={75} durationInFrames={90}>
        <Center u={u}>
          <Title u={u} delay={2} maxW={maxW}>Comparte secretos de forma segura</Title>
          <ChipRow u={u} maxW={maxW} items={["AES-256-GCM", "Zero-knowledge", "100% en tu navegador", "Sin servidores"]} />
        </Center>
      </Sequence>

      <Sequence from={165} durationInFrames={85}>
        <Center u={u}>
          <Title u={u} delay={2} maxW={maxW}>Texto o archivos → un .zefer cifrado</Title>
          <Flow u={u} portrait={portrait} />
        </Center>
      </Sequence>

      <Sequence from={250} durationInFrames={75}>
        <Center u={u}>
          <Title u={u} delay={2} maxW={maxW}>Web · CLI · MCP · Librería</Title>
          <ChipRow u={u} maxW={maxW} items={["App web", "CLI", "Servidor MCP", "Librería Node.js"]} />
        </Center>
      </Sequence>

      <Sequence from={325}>
        <Center u={u}>
          <Shield size={u * 14} drawFrom={3} />
          <CTA u={u} />
          {networks ? <NetworksFooter u={u} text={networks} /> : null}
        </Center>
      </Sequence>
    </AbsoluteFill>
  );
};

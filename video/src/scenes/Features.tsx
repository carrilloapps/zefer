import type { FC } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Lock, MonitorSmartphone, EyeOff, Timer, KeyRound, Boxes, type LucideIcon } from "lucide-react";
import { COLORS } from "../lib/theme";
import { enter } from "../lib/animation";
import { Center, Eyebrow } from "../components/layout";

const FEATURES: [LucideIcon, string, string][] = [
  [Lock, "AES-256-GCM encryption", "Authenticated, with PBKDF2-SHA256 key derivation."],
  [MonitorSmartphone, "100% client-side", "Runs in your browser. Nothing is uploaded."],
  [EyeOff, "Zero-knowledge", "No servers, no accounts. Open source (MIT)."],
  [Timer, "Self-destructing secrets", "Set an expiration after which the file won't open."],
  [KeyRound, "Layered access control", "Dual passphrase, reveal key, secret question, IP allowlist."],
  [Boxes, "Works everywhere", "Web app, CLI, MCP server, and a Node.js library."],
];

const FeatureCard: FC<{ item: [LucideIcon, string, string]; delay: number }> = ({ item, delay }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [Icon, title, desc] = item;
  return (
    <div style={{ ...enter(f, fps, delay), width: 540, textAlign: "left", display: "flex", gap: 16, padding: "20px 22px", borderRadius: 16, background: COLORS.glass, border: `1px solid ${COLORS.line}` }}>
      <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: COLORS.primaryFaint, border: `1px solid ${COLORS.primaryBorder}`, color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={22} />
      </span>
      <div>
        <div style={{ fontSize: 25, fontWeight: 700, color: COLORS.text }}>{title}</div>
        <div style={{ fontSize: 19, color: COLORS.muted, marginTop: 4, lineHeight: 1.3 }}>{desc}</div>
      </div>
    </div>
  );
};

export const FeaturesScene: FC = () => (
  <Center>
    <Eyebrow text="Features" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
      {FEATURES.map((item, i) => (
        <FeatureCard key={item[1]} item={item} delay={6 + i * 9} />
      ))}
    </div>
  </Center>
);

import type { FC } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Globe, Terminal, Plug, Braces, type LucideIcon } from "lucide-react";
import { COLORS, FONTS } from "../lib/theme";
import { enter } from "../lib/animation";
import { Center, Eyebrow } from "../components/layout";

const CHANNELS: [LucideIcon, string][] = [
  [Globe, "Web app"],
  [Terminal, "CLI"],
  [Plug, "MCP server"],
  [Braces, "Node.js library"],
];

const TERMINAL_TEXT = `$ npm i -g zefer-cli
$ zefer encrypt report.pdf -p "••••••"
  ✓ report.pdf.zefer  (AES-256-GCM)`;

const dot = (bg: string) => <span style={{ width: 11, height: 11, borderRadius: 999, background: bg }} />;

export const ChannelsScene: FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = TERMINAL_TEXT.split("\n");
  const shownChars = Math.max(0, Math.floor((f - 20) * 2.2));
  let acc = 0;
  return (
    <Center>
      <Eyebrow text="One format, every workflow" />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 1200 }}>
        {CHANNELS.map(([Icon, label], i) => (
          <div key={label} style={{ ...enter(f, fps, 6 + i * 5), display: "flex", alignItems: "center", gap: 10, padding: "12px 26px", borderRadius: 999, fontSize: 24, fontWeight: 700, color: COLORS.text, background: COLORS.primaryFaint, border: `1px solid ${COLORS.primaryBorder}` }}>
            <Icon size={22} color={COLORS.green} /> {label}
          </div>
        ))}
      </div>
      <div style={{ ...enter(f, fps, 16), width: 880, marginTop: 14, borderRadius: 16, background: COLORS.panel, border: `1px solid ${COLORS.line}`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)", textAlign: "left", overflow: "hidden" }}>
        <div style={{ height: 40, display: "flex", alignItems: "center", gap: 8, padding: "0 16px", borderBottom: `1px solid ${COLORS.line}` }}>
          {dot("#ff5f57")}
          {dot("#febc2e")}
          {dot("#28c840")}
          <span style={{ marginLeft: 10, fontFamily: FONTS.mono, fontSize: 14, color: COLORS.faint }}>zsh — zefer-cli</span>
        </div>
        <div style={{ padding: 24, fontFamily: FONTS.mono, fontSize: 22, lineHeight: 1.6, minHeight: 150 }}>
          {lines.map((line, i) => {
            const start = acc;
            acc += line.length + 1;
            const n = Math.max(0, Math.min(line.length, shownChars - start));
            const txt = line.slice(0, n);
            const isOk = line.includes("✓");
            return (
              <div key={i} style={{ color: isOk ? COLORS.green : line.startsWith("$") ? COLORS.text : COLORS.muted }}>
                {txt}
                {shownChars > start && shownChars < acc ? <span style={{ color: COLORS.green }}>▌</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </Center>
  );
};

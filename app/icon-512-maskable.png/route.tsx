import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = 512;
const ICON = 240; // smaller icon for maskable safe zone (20% padding)

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#050a0e" }}>
        <svg width={ICON} height={ICON} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2L4 8v8c0 7.18 5.1 13.88 12 15.4C22.9 29.88 28 23.18 28 16V8L16 2z" stroke="#22c55e" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M11 16l4 4 6-7" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { width: SIZE, height: SIZE }
  );
}

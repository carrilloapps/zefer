// Minimal MCP stdio client that drives `opengraph-mcp` to review a URL.
// Usage: node scripts/og-review.mjs <url>
import { spawn } from "node:child_process";

const url = process.argv[2] || "http://localhost:3000/";
const child = spawn("npx", ["-y", "opengraph-mcp"], {
  stdio: ["pipe", "pipe", "inherit"],
  shell: process.platform === "win32",
});

let buf = "";
const pending = new Map();
let toolName = null;

function send(obj) {
  child.stdin.write(JSON.stringify(obj) + "\n");
}
function rpc(id, method, params) {
  return new Promise((resolve) => {
    pending.set(id, resolve);
    send({ jsonrpc: "2.0", id, method, params });
  });
}

child.stdout.on("data", (d) => {
  buf += d.toString();
  let nl;
  while ((nl = buf.indexOf("\n")) !== -1) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id !== undefined && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  }
});

const fail = (m) => { console.error("ERROR:", m); child.kill(); process.exit(1); };
setTimeout(() => fail("timeout (60s)"), 60000);

(async () => {
  await rpc(1, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "og-review", version: "1.0.0" },
  });
  send({ jsonrpc: "2.0", method: "notifications/initialized" });

  const list = await rpc(2, "tools/list", {});
  const tools = list.result?.tools || [];
  console.log("=== TOOLS ===");
  for (const t of tools) {
    console.log(`- ${t.name}: ${t.description || ""}`);
    console.log(`  input: ${JSON.stringify(t.inputSchema?.properties || {})}`);
  }
  // pick a tool that takes a url
  toolName = (tools.find((t) => JSON.stringify(t.inputSchema || {}).includes("url")) || tools[0])?.name;
  if (!toolName) fail("no tools exposed");

  console.log(`\n=== CALL ${toolName}({ url: "${url}" }) ===`);
  const res = await rpc(3, "tools/call", { name: toolName, arguments: { url } });
  const content = res.result?.content || res.error;
  if (Array.isArray(content)) {
    for (const c of content) console.log(c.type === "text" ? c.text : JSON.stringify(c));
  } else {
    console.log(JSON.stringify(content, null, 2));
  }
  child.kill();
  process.exit(0);
})().catch((e) => fail(String(e)));

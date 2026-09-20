// Minimal MCP stdio client that drives `opengraph-mcp` to review a URL.
// Usage: node scripts/og-review.mjs <url>
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

// Resolve npx from the directory of the running node binary instead of letting
// the OS search PATH, and run it through node itself — no shell, no PATH lookup,
// and no .cmd shim, so this behaves identically on Windows and POSIX.
const nodeDir = dirname(process.execPath);
const npxCli = [
  join(nodeDir, "node_modules", "npm", "bin", "npx-cli.js"), // Windows layout
  join(nodeDir, "..", "lib", "node_modules", "npm", "bin", "npx-cli.js"), // POSIX layout
].find((candidate) => existsSync(candidate));

if (!npxCli) {
  console.error("ERROR: could not locate npx-cli.js next to", process.execPath);
  process.exit(1);
}

const url = process.argv[2] || "http://localhost:3000/";
const child = spawn(process.execPath, [npxCli, "-y", "opengraph-mcp"], {
  stdio: ["pipe", "pipe", "inherit"],
});

let buf = "";
const pending = new Map();

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

try {
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
  const toolName = (tools.find((t) => JSON.stringify(t.inputSchema || {}).includes("url")) || tools[0])?.name;
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
} catch (e) {
  fail(String(e));
}

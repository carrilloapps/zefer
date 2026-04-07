import { randomBytes } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";

const ENV_FILE = ".env";
const KEY = "ZEFER_INSTANCE_SECRET";

// 128 bytes = 256 hex chars — maximum entropy
const secret = randomBytes(128).toString("hex");

let content = "";

if (existsSync(ENV_FILE)) {
  content = readFileSync(ENV_FILE, "utf-8");

  if (content.match(new RegExp(`^${KEY}=.+`, "m"))) {
    console.error(`\x1b[31mError:\x1b[0m ${KEY} already exists in ${ENV_FILE}.`);
    console.error("Changing it will make all strict-mode .zefer files permanently undecryptable.");
    console.error("Delete the line manually if you really want to regenerate it.");
    process.exit(1);
  }

  // Remove commented-out or empty versions
  content = content.replace(new RegExp(`^#?\\s*${KEY}=.*\\n?`, "gm"), "");
}

content = content.trimEnd() + "\n" + `${KEY}=${secret}\n`;

writeFileSync(ENV_FILE, content, "utf-8");

console.log(`\x1b[32m✓\x1b[0m Generated ${KEY} (256 hex chars / 1024 bits)`);
console.log(`\x1b[32m✓\x1b[0m Written to ${ENV_FILE}`);
console.log("");
console.log("\x1b[33m⚠ This value must NEVER change.\x1b[0m");
console.log("  Copy it to your hosting environment (Vercel, Docker, etc.).");
console.log("  Do NOT commit .env to the repository.");

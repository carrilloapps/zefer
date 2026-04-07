const ENDPOINTS = [
  "https://api64.ipify.org?format=json",
  "https://api.ipify.org?format=json",
];

export async function getClientIp(): Promise<string | null> {
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      return data.ip ?? null;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Parse a comma-separated list of IPs, trimming whitespace.
 * Returns an empty array if the input is empty.
 */
export function parseIpList(input: string): string[] {
  if (!input.trim()) return [];
  return input
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);
}

/**
 * Check if a given IP matches any entry in the allowed list.
 * Supports exact match for both IPv4 and IPv6.
 */
export function isIpAllowed(clientIp: string, allowedIps: string[]): boolean {
  if (allowedIps.length === 0) return true;
  const normalized = normalizeIp(clientIp);
  return allowedIps.some((ip) => normalizeIp(ip) === normalized);
}

/**
 * Minimal normalization: lowercase, trim.
 * For IPv6, also expands :: shorthand isn't needed for exact user-entered matches.
 */
function normalizeIp(ip: string): string {
  return ip.trim().toLowerCase();
}

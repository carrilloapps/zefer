/**
 * Multiple IP detection services for redundancy and cross-validation.
 * Using different providers reduces the chance of a single point of failure
 * and allows detecting VPN/proxy by comparing results.
 */
const ENDPOINTS = [
  { url: "https://api64.ipify.org?format=json", key: "ip" },
  { url: "https://api.ipify.org?format=json", key: "ip" },
  { url: "https://httpbin.org/ip", key: "origin" },
  { url: "https://api.seeip.org/jsonip", key: "ip" },
];

export interface IpDetectionResult {
  ip: string;
  vpnDetected: boolean;
  proxyDetected: boolean;
  inconsistent: boolean;
  allIps: string[];
  timezone: string | null;
}

/**
 * Detect the client's public IP using multiple services.
 * Cross-validates results to detect VPN/proxy inconsistencies.
 */
export async function detectIp(): Promise<IpDetectionResult> {
  const results: string[] = [];

  // Fetch from multiple services in parallel with 5s timeout
  const promises = ENDPOINTS.map(async ({ url, key }) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { cache: "no-store", signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return null;
      const data = await res.json();
      const ip = typeof data[key] === "string" ? data[key].trim() : null;
      return ip || null;
    } catch {
      return null;
    }
  });

  const resolved = await Promise.allSettled(promises);
  for (const r of resolved) {
    if (r.status === "fulfilled" && r.value) {
      results.push(r.value);
    }
  }

  if (results.length === 0) {
    return {
      ip: "",
      vpnDetected: false,
      proxyDetected: false,
      inconsistent: false,
      allIps: [],
      timezone: null,
    };
  }

  // Primary IP = most common result
  const frequency = new Map<string, number>();
  for (const ip of results) {
    frequency.set(ip, (frequency.get(ip) || 0) + 1);
  }
  const primaryIp = [...frequency.entries()].sort((a, b) => b[1] - a[1])[0][0];

  // Unique IPs detected
  const uniqueIps = [...new Set(results)];

  // Inconsistency = different services return different IPs
  const inconsistent = uniqueIps.length > 1;

  // VPN/Proxy heuristics
  const vpnDetected = detectVpnHeuristic(primaryIp);
  const proxyDetected = inconsistent;

  // Timezone from browser (for cross-checking with IP geolocation)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;

  return {
    ip: primaryIp,
    vpnDetected,
    proxyDetected,
    inconsistent,
    allIps: uniqueIps,
    timezone,
  };
}

/**
 * Heuristic VPN detection based on IP characteristics.
 * Not 100% reliable, but catches common VPN providers.
 */
function detectVpnHeuristic(ip: string): boolean {
  // Known VPN/datacenter IP ranges (first octets)
  // These are common datacenter providers used by VPNs
  const datacenterPrefixes = [
    "104.28.", "104.16.", "104.17.", "104.18.", "104.19.", "104.20.", "104.21.", "104.22.", "104.23.", "104.24.", "104.25.", // Cloudflare
    "172.64.", "172.65.", "172.66.", "172.67.", "172.68.", "172.69.", "172.70.", "172.71.", // Cloudflare
    "198.41.", // Cloudflare
    "185.93.", "185.56.", "185.104.", // Common VPN providers
    "45.33.", "45.56.", "45.79.", // Linode (common for VPNs)
    "139.162.", "172.104.", "172.105.", // Linode
    "167.99.", "167.172.", "134.209.", "157.245.", "138.68.", "159.89.", "174.138.", // DigitalOcean
    "52.0.", "52.1.", "54.0.", "54.1.", "18.0.", "18.1.", "3.0.", "3.1.", // AWS
    "35.0.", "35.1.", "34.0.", "34.1.", // GCP
    "40.0.", "40.1.", "20.0.", "20.1.", "13.0.", "13.1.", // Azure
  ];

  for (const prefix of datacenterPrefixes) {
    if (ip.startsWith(prefix)) return true;
  }

  // WebRTC leak detection: if available, check if WebRTC local IP
  // differs significantly from public IP (indicates VPN tunnel)
  // This runs client-side so we can check

  return false;
}

/**
 * Simple IP detection (backward compatible).
 */
export async function getClientIp(): Promise<string | null> {
  const result = await detectIp();
  return result.ip || null;
}

/**
 * Parse a comma-separated list of IPs, trimming whitespace.
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
 * Normalize IP for comparison.
 * Handles IPv4 and IPv6 lowercase + trim.
 */
function normalizeIp(ip: string): string {
  return ip.trim().toLowerCase();
}

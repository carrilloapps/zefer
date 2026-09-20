export interface DeviceProfile {
  ram: number;              // GB (0 = unknown)
  cores: number;
  gpu: string | null;       // full renderer string
  gpuVendor: string | null; // vendor string
  cpuArch: string | null;   // architecture (x86, arm, etc.)
  platform: string;
  platformVersion: string | null;
  userAgent: string;
  mobile: boolean;
  heapLimit: number | null;  // bytes
  heapUsed: number | null;   // bytes
  heapTotal: number | null;  // bytes
}

export interface DeviceLimits {
  maxFileSize: number;
  maxFileSizeLabel: string;
  profile: DeviceProfile;
}

/**
 * Detect GPU info via WebGL renderer string.
 */
function detectGpu(): { renderer: string | null; vendor: string | null } {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return { renderer: null, vendor: null };

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = ext
      ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);
    const vendor = ext
      ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR);

    return {
      renderer: typeof renderer === "string" ? renderer : null,
      vendor: typeof vendor === "string" ? vendor : null,
    };
  } catch {
    return { renderer: null, vendor: null };
  }
}

/**
 * Try to get CPU architecture from userAgentData (Chromium 90+).
 */
async function detectCpuArch(): Promise<string | null> {
  try {
    const uad = (navigator as unknown as { userAgentData?: { getHighEntropyValues: (hints: string[]) => Promise<{ architecture?: string; platform?: string; platformVersion?: string }> } }).userAgentData;
    if (!uad) return null;
    const data = await uad.getHighEntropyValues(["architecture", "platform", "platformVersion"]);
    return data.architecture || null;
  } catch {
    return null;
  }
}

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const GB = 1024 * 1024 * 1024;
const MB = 1024 * 1024;

/** Phones/tablets: RAM is the only meaningful signal and it is always scarce. */
function mobileFileLimit(ramGb: number): number {
  if (ramGb >= 6) return 1.5 * GB;
  if (ramGb >= 4) return 1 * GB;
  if (ramGb >= 2) return 512 * MB;
  return 256 * MB;
}

/**
 * navigator.deviceMemory reported exactly 8 — which Chromium also returns for
 * machines with far more RAM (privacy clamp). Core count is the best available
 * proxy to separate workstations (i9/Ryzen 9, 20+ threads) from 8 GB ultrabooks.
 */
function clampedRamFileLimit(cores: number): number {
  if (cores >= 20) return 10 * GB;
  if (cores >= 16) return 6 * GB;
  if (cores >= 12) return 4 * GB;
  if (cores >= 8) return 3 * GB;
  return 2 * GB;
}

/** No deviceMemory API at all (Firefox/Safari) — fall back to core count. */
function coreOnlyFileLimit(cores: number): number {
  if (cores >= 16) return 4 * GB;
  if (cores >= 8) return 2 * GB;
  return 1 * GB;
}

/** Desktop/laptop tiers, highest confidence signal first. */
function desktopFileLimit(ramGb: number, cores: number): number {
  // Verified high-memory workstation (some Chromium builds report real RAM)
  if (ramGb >= 64) return 10 * GB;
  if (ramGb >= 32) return cores >= 20 ? 10 * GB : 8 * GB;
  if (ramGb >= 16) return cores >= 16 ? 8 * GB : 6 * GB;
  if (ramGb >= 8) return clampedRamFileLimit(cores);
  if (ramGb >= 4) return cores >= 8 ? 2 * GB : 1 * GB;
  if (ramGb > 0) return 512 * MB;
  return coreOnlyFileLimit(cores);
}

/**
 * Analyze device and compute a dynamic file size limit.
 *
 * Encryption and decryption STREAM the file in 16 MB slices (Blob.slice), so
 * the input is never held in a single contiguous ArrayBuffer — that removes
 * the ~2 GB per-allocation cap that previously made large files fail well
 * below the advertised limit. The remaining constraint is total memory: the
 * output accumulates as ~1× the file size in 16 MB Blob parts before being
 * composed into a (browser-managed, disk-backable) Blob.
 *
 * Sources (in order of accuracy):
 *   1. performance.measureUserAgentSpecificMemory() — exact, Chrome 89+ with crossOriginIsolated
 *   2. (performance as any).memory.jsHeapSizeLimit — Chrome/Edge, JS heap limit
 *   3. navigator.deviceMemory — coarse RAM in GB (Chrome/Edge)
 *   4. Fallback heuristic based on cores + platform
 */
export function analyzeDevice(): DeviceLimits {
  const nav = typeof navigator !== "undefined" ? navigator : null;
  const perf = typeof performance !== "undefined" ? performance : null;

  const cores = nav?.hardwareConcurrency || 2;
  const deviceMemoryGb = (nav as unknown as { deviceMemory?: number })?.deviceMemory || 0;
  const gpu = detectGpu();
  const mobile = isMobile();
  const platform = nav?.platform || "unknown";
  const userAgent = nav?.userAgent || "";

  const perfMemory = (perf as unknown as { memory?: { jsHeapSizeLimit?: number; usedJSHeapSize?: number; totalJSHeapSize?: number } })?.memory;

  const profile: DeviceProfile = {
    ram: deviceMemoryGb,
    cores,
    gpu: gpu.renderer,
    gpuVendor: gpu.vendor,
    cpuArch: null, // filled async below
    platform,
    platformVersion: null,
    userAgent,
    mobile,
    heapLimit: perfMemory?.jsHeapSizeLimit || null,
    heapUsed: perfMemory?.usedJSHeapSize || null,
    heapTotal: perfMemory?.totalJSHeapSize || null,
  };

  // Kick off async CPU arch detection (non-blocking)
  // detectCpuArch never rejects (it resolves to null on any failure).
  detectCpuArch().then((arch) => { profile.cpuArch = arch; });

  // ─── Tiered limit model ───
  //
  // Why not derive the limit from jsHeapSizeLimit: V8 caps the JS heap at
  // ~4 GB on every desktop regardless of physical RAM (a 128 GB workstation
  // reports the same limit as an 8 GB laptop — that is why the old formula
  // froze every machine at ~1.5 GB). ArrayBuffers also live OUTSIDE the V8
  // heap, so the heap is the wrong proxy altogether.
  //
  // navigator.deviceMemory is clamped to 8 by Chromium for privacy, so
  // "ram >= 8" means "8 GB OR MORE — possibly far more". Core count is the
  // best available proxy to separate workstations (i9/Ryzen 9/Threadripper,
  // 20+ threads) from 8 GB ultrabooks.
  //
  // Memory model during encrypt/decrypt: the input is read one 16 MB slice at
  // a time (≈1 chunk resident, not the whole file) and compression streams,
  // so peak ≈ 1× the file size — the accumulated output parts before the Blob
  // is finalized. The tiers leave headroom under reported RAM.
  const maxFileSize = mobile
    ? mobileFileLimit(deviceMemoryGb)
    : desktopFileLimit(deviceMemoryGb, cores);

  return {
    maxFileSize,
    maxFileSizeLabel: formatBytes(maxFileSize),
    profile,
  };
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

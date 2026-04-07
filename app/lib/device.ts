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

/**
 * Analyze device and compute a dynamic file size limit.
 *
 * The limit is 80% of the estimated AVAILABLE memory for a single
 * crypto operation. The browser needs ~3x the file size in RAM:
 *   1x for the raw file ArrayBuffer
 *   1x for the encrypted output
 *   1x for intermediate processing (base64, compression)
 *
 * So: maxFileSize = (availableRAM / 3) * 0.80
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
  detectCpuArch().then((arch) => { profile.cpuArch = arch; }).catch(() => {});

  // ─── Estimate available memory in bytes ───

  let estimatedRamBytes = 0;

  if (perfMemory?.jsHeapSizeLimit) {
    // jsHeapSizeLimit is the max the JS heap can grow to.
    // Use 50% of it — the rest is for the page, DOM, etc.
    estimatedRamBytes = perfMemory.jsHeapSizeLimit * 0.5;
  }
  // Method 2: navigator.deviceMemory
  else if (deviceMemoryGb > 0) {
    // Device reports total RAM. Browser can typically use ~25-50% of total.
    // Use 30% as a conservative estimate for a single tab.
    estimatedRamBytes = deviceMemoryGb * 1024 * 1024 * 1024 * 0.3;
  }
  // Method 3: Heuristic from cores
  else {
    // No memory APIs available (Firefox/Safari).
    // Estimate: ~512MB per core as a rough baseline.
    const estimatedGb = Math.min(cores * 0.5, 16);
    estimatedRamBytes = estimatedGb * 1024 * 1024 * 1024 * 0.3;
  }

  // Browser needs ~3x file size for crypto pipeline
  // Apply 80% safety margin on top
  const maxFileSize = Math.floor((estimatedRamBytes / 3) * 0.8);

  // Clamp: minimum 5 MB, no upper cap
  const finalMax = Math.max(maxFileSize, 5 * 1024 * 1024);

  return {
    maxFileSize: finalMax,
    maxFileSizeLabel: formatBytes(finalMax),
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

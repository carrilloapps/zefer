let cachedHash = "";
let cachedEnabled: boolean | null = null;

/**
 * Fetch the instance hash from the server.
 * The server holds the secret; the client only gets a SHA-256 hash.
 * Result is cached for the session.
 */
export async function getInstanceInfo(): Promise<{
  enabled: boolean;
  hash: string;
}> {
  if (cachedEnabled !== null) {
    return { enabled: cachedEnabled, hash: cachedHash || "" };
  }

  try {
    const res = await fetch("/api/instance");
    const data = await res.json();
    cachedEnabled = !!data.enabled;
    cachedHash = data.hash || "";
    return { enabled: cachedEnabled, hash: cachedHash };
  } catch {
    cachedEnabled = false;
    cachedHash = "";
    return { enabled: false, hash: "" };
  }
}

/**
 * Combine a passphrase with the instance hash for strict mode.
 * The hash is unique per instance and irreversible from the original secret.
 */
export function bindToInstance(passphrase: string, instanceHash: string): string {
  return `${passphrase}\x00ZEFER_STRICT\x00${instanceHash}`;
}

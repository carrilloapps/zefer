import { describe, it, expect, vi, afterEach } from "vitest";
import { detectIp, getClientIp, parseIpList, isIpAllowed } from "../ip";

type Reply = { ok?: boolean; body?: unknown; throws?: boolean };

/** Stubs fetch with one reply per endpoint, in ENDPOINTS order. */
function stubFetch(replies: Reply[]) {
  let i = 0;
  const fetchMock = vi.fn(async () => {
    const reply = replies[i++] ?? { ok: false };
    if (reply.throws) throw new Error("network down");
    return {
      ok: reply.ok !== false,
      json: async () => reply.body,
    } as unknown as Response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("detectIp", () => {
  it("returns an empty result when every endpoint fails", async () => {
    stubFetch([
      { throws: true },           // network error
      { ok: false },              // non-2xx
      { body: { ip: 42 } },       // wrong type for the key
      { body: { origin: "   " } },// blank after trim
    ]);

    await expect(detectIp()).resolves.toEqual({
      ip: "",
      vpnDetected: false,
      proxyDetected: false,
      inconsistent: false,
      allIps: [],
      timezone: null,
    });
  });

  it("picks the most frequent IP and reports a consistent result", async () => {
    stubFetch([
      { body: { ip: " 81.2.3.4 " } },
      { body: { ip: "81.2.3.4" } },
      { body: { origin: "81.2.3.4" } },
      { body: { ip: "81.2.3.4" } },
    ]);

    const result = await detectIp();
    expect(result.ip).toBe("81.2.3.4");
    expect(result.allIps).toEqual(["81.2.3.4"]);
    expect(result.inconsistent).toBe(false);
    expect(result.proxyDetected).toBe(false);
    expect(result.vpnDetected).toBe(false);
    expect(typeof result.timezone).toBe("string");
  });

  it("flags a proxy when services disagree, keeping the majority IP", async () => {
    stubFetch([
      { body: { ip: "81.2.3.4" } },
      { body: { ip: "81.2.3.4" } },
      { body: { origin: "9.9.9.9" } },
      { ok: false },
    ]);

    const result = await detectIp();
    expect(result.ip).toBe("81.2.3.4");
    expect(result.allIps).toEqual(["81.2.3.4", "9.9.9.9"]);
    expect(result.inconsistent).toBe(true);
    expect(result.proxyDetected).toBe(true);
  });

  it("flags a datacenter prefix as a likely VPN", async () => {
    stubFetch([{ body: { ip: "172.67.1.1" } }]);
    await expect(detectIp()).resolves.toMatchObject({ vpnDetected: true });
  });

  it("does not flag a residential IP", async () => {
    stubFetch([{ body: { ip: "200.44.1.1" } }]);
    await expect(detectIp()).resolves.toMatchObject({ vpnDetected: false });
  });

  it("normalizes a missing browser timezone to null", async () => {
    stubFetch([{ body: { ip: "200.44.1.1" } }]);
    vi.spyOn(Intl, "DateTimeFormat").mockReturnValue({
      resolvedOptions: () => ({ timeZone: "" }),
    } as unknown as Intl.DateTimeFormat);

    await expect(detectIp()).resolves.toMatchObject({ timezone: null });
  });

  it("aborts a hung request after the 5s timeout", async () => {
    vi.useFakeTimers();
    try {
      const fetchMock = vi.fn(
        (_url: string, init?: { signal?: AbortSignal }) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
          }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const pending = detectIp();
      await vi.advanceTimersByTimeAsync(5000);
      const result = await pending;
      expect(result.ip).toBe("");
      expect(fetchMock).toHaveBeenCalledTimes(4);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("getClientIp", () => {
  it("returns the detected IP", async () => {
    stubFetch([{ body: { ip: "200.44.1.1" } }]);
    await expect(getClientIp()).resolves.toBe("200.44.1.1");
  });

  it("returns null when nothing was detected", async () => {
    stubFetch([{ ok: false }, { ok: false }, { ok: false }, { ok: false }]);
    await expect(getClientIp()).resolves.toBeNull();
  });
});

describe("parseIpList", () => {
  it("returns an empty list for blank input", () => {
    expect(parseIpList("")).toEqual([]);
    expect(parseIpList("   ")).toEqual([]);
  });

  it("trims entries and drops empty ones", () => {
    expect(parseIpList(" 10.0.0.1 , ,::1,")).toEqual(["10.0.0.1", "::1"]);
  });
});

describe("isIpAllowed", () => {
  it("allows everything when the list is empty", () => {
    expect(isIpAllowed("10.0.0.1", [])).toBe(true);
  });

  it("matches case-insensitively and ignores surrounding whitespace", () => {
    expect(isIpAllowed(" 2001:DB8::1 ", ["2001:db8::1"])).toBe(true);
    expect(isIpAllowed("2001:db8::1", [" 2001:DB8::1 "])).toBe(true);
  });

  it("rejects an IP that is not listed", () => {
    expect(isIpAllowed("10.0.0.2", ["10.0.0.1", "::1"])).toBe(false);
  });
});

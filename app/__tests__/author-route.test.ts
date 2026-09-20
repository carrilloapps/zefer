import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The route memoizes the GitHub profile in a module-level variable, so every
 * test loads a fresh copy of the module to start from an empty cache.
 */
async function loadRoute() {
  vi.resetModules();
  return (await import("@/app/api/author/route")).GET;
}

const GITHUB_PROFILE = {
  login: "carrilloapps",
  name: "José Carrillo",
  avatar_url: "https://avatars.githubusercontent.com/u/1",
  bio: "Senior Fullstack Developer",
  company: "@carrilloapps",
  location: "Bogotá",
  blog: "https://carrillo.app",
  twitter_username: "carrilloapps",
  public_repos: 42,
  followers: 100,
  following: 7,
  html_url: "https://github.com/carrilloapps",
  created_at: "2015-01-01T00:00:00Z",
};

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-16T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("GET /api/author", () => {
  it("maps the GitHub profile onto the app's own shape", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => GITHUB_PROFILE });
    const GET = await loadRoute();

    await expect((await GET()).json()).resolves.toEqual({
      login: "carrilloapps",
      name: "José Carrillo",
      avatar: "https://avatars.githubusercontent.com/u/1",
      bio: "Senior Fullstack Developer",
      company: "@carrilloapps",
      location: "Bogotá",
      blog: "https://carrillo.app",
      twitter: "carrilloapps",
      publicRepos: 42,
      followers: 100,
      following: 7,
      profileUrl: "https://github.com/carrilloapps",
      createdAt: "2015-01-01T00:00:00Z",
    });
    expect(fetchMock).toHaveBeenCalledWith("https://api.github.com/users/carrilloapps", {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 3600 },
    });
  });

  it("serves the cached profile for an hour instead of calling GitHub again", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => GITHUB_PROFILE });
    const GET = await loadRoute();
    const first = await (await GET()).json();

    vi.advanceTimersByTime(3_599_000);
    const second = await (await GET()).json();

    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refetches once the cache entry is older than an hour", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => GITHUB_PROFILE });
    const GET = await loadRoute();
    await GET();

    vi.advanceTimersByTime(3_600_001);
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ...GITHUB_PROFILE, followers: 101 }) });

    await expect((await GET()).json()).resolves.toMatchObject({ followers: 101 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("falls back to static data when GitHub answers with an error status", async () => {
    mockFetch({ ok: false, status: 404, json: async () => ({ message: "Not Found" }) });
    const GET = await loadRoute();

    await expect((await GET()).json()).resolves.toMatchObject({
      login: "carrilloapps",
      name: "José Carrillo",
      avatar: "https://github.com/carrilloapps.png",
      profileUrl: "https://github.com/carrilloapps",
      publicRepos: 0,
      followers: 0,
      following: 0,
      company: null,
      location: null,
      createdAt: null,
    });
  });

  it("falls back to static data when the request itself fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);
    const GET = await loadRoute();

    await expect((await GET()).json()).resolves.toMatchObject({
      login: "carrilloapps",
      bio: "Senior Fullstack Developer & Tech Lead",
      blog: "https://carrillo.app",
      twitter: "carrilloapps",
    });
  });

  it("never caches the fallback, so a recovered API is picked up immediately", async () => {
    const fetchMock = mockFetch({ ok: false, status: 500, json: async () => ({}) });
    const GET = await loadRoute();
    await GET();

    fetchMock.mockResolvedValue({ ok: true, json: async () => GITHUB_PROFILE });

    await expect((await GET()).json()).resolves.toMatchObject({ followers: 100 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("answers with JSON", async () => {
    mockFetch({ ok: true, json: async () => GITHUB_PROFILE });
    const GET = await loadRoute();
    const response = await GET();

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});

const GITHUB_USERNAME = "carrilloapps";
const CACHE_TTL = 3600; // 1 hour in seconds

let cached: { data: unknown; ts: number } | null = null;

export async function GET() {
  // Return cache if fresh
  if (cached && Date.now() - cached.ts < CACHE_TTL * 1000) {
    return Response.json(cached.data);
  }

  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: CACHE_TTL },
    });

    if (!res.ok) throw new Error("GitHub API error");

    const gh = await res.json();

    const data = {
      login: gh.login,
      name: gh.name,
      avatar: gh.avatar_url,
      bio: gh.bio,
      company: gh.company,
      location: gh.location,
      blog: gh.blog,
      twitter: gh.twitter_username,
      publicRepos: gh.public_repos,
      followers: gh.followers,
      following: gh.following,
      profileUrl: gh.html_url,
      createdAt: gh.created_at,
    };

    cached = { data, ts: Date.now() };

    return Response.json(data);
  } catch {
    // Fallback static data if API fails
    return Response.json({
      login: GITHUB_USERNAME,
      name: "José Carrillo",
      avatar: `https://github.com/${GITHUB_USERNAME}.png`,
      bio: "Senior Fullstack Developer & Tech Lead",
      company: null,
      location: null,
      blog: "https://carrillo.app",
      twitter: GITHUB_USERNAME,
      publicRepos: 0,
      followers: 0,
      following: 0,
      profileUrl: `https://github.com/${GITHUB_USERNAME}`,
      createdAt: null,
    });
  }
}

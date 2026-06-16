import { fallbackStats, profile } from "./data";

export type GithubStats = {
  followers: number;
  publicRepos: number;
  stars: number;
  topLanguages: string[];
  live: boolean;
};

type GithubUser = {
  followers: number;
  public_repos: number;
};

type GithubRepo = {
  stargazers_count: number;
  fork: boolean;
  language: string | null;
};

/**
 * Fetches public GitHub stats with no auth token (60 req/hr is plenty for ISR).
 * Revalidates every 6 hours and degrades gracefully to fallbackStats on any
 * error or rate-limit so the UI never breaks.
 */
export async function getGithubStats(): Promise<GithubStats> {
  const base = "https://api.github.com";
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "mihaduldev-portfolio",
  };
  const next = { revalidate: 60 * 60 * 6 };

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`${base}/users/${profile.githubUsername}`, { headers, next }),
      fetch(`${base}/users/${profile.githubUsername}/repos?per_page=100&sort=pushed`, {
        headers,
        next,
      }),
    ]);

    if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API not OK");

    const user = (await userRes.json()) as GithubUser;
    const repos = (await reposRes.json()) as GithubRepo[];

    const stars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

    const langCount = new Map<string, number>();
    for (const r of repos) {
      if (r.fork || !r.language) continue;
      langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1);
    }
    const topLanguages = [...langCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang);

    return {
      followers: user.followers ?? 0,
      publicRepos: user.public_repos ?? 0,
      stars,
      topLanguages: topLanguages.length ? topLanguages : fallbackStats.topLanguages,
      live: true,
    };
  } catch {
    return { ...fallbackStats, live: false };
  }
}

import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/server/db/posts";
import { SITE_URL, SITE_UPDATED } from "@/lib/site";

const base = SITE_URL;

export const revalidate = 3600;

/** A post's true last-touched date: its DB updated_at, else publishedAt. */
function postDate(p: { updatedAt: string | null; publishedAt: string | null }): Date {
  const iso = p.updatedAt ?? p.publishedAt;
  return iso ? new Date(iso) : new Date(SITE_UPDATED);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublishedPosts();

  // Home + /blog reflect the freshest published content; /resume uses the stable
  // site-updated date. Real lastmod (not build time) so crawlers trust it.
  const latest = posts.reduce<Date>(
    (max, p) => (postDate(p) > max ? postDate(p) : max),
    new Date(SITE_UPDATED)
  );
  const staticLastMod: Record<string, Date> = {
    "": latest,
    "/blog": latest,
    "/resume": new Date(SITE_UPDATED),
  };

  const routes: MetadataRoute.Sitemap = ["", "/blog", "/resume"].map((path) => ({
    url: `${base}${path}`,
    lastModified: staticLastMod[path],
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const blog: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: postDate(p),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...routes, ...blog];
}

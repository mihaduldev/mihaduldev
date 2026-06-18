import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/server/db/posts";
import { SITE_URL } from "@/lib/site";

const base = SITE_URL;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublishedPosts();

  const routes: MetadataRoute.Sitemap = ["", "/blog", "/resume"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const blog: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...routes, ...blog];
}

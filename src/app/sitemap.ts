import type { MetadataRoute } from "next";
import { posts } from "@/lib/data";

const base = "https://mihad.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/blog", "/resume"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const blog = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...routes, ...blog];
}

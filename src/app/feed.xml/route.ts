import { listPublishedPosts } from "@/server/db/posts";
import { profile } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

const ESCAPES: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  "'": "&apos;",
  '"': "&quot;",
};
const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ESCAPES[c]);

const rfc822 = (iso: string | null) =>
  (iso ? new Date(iso) : new Date()).toUTCString();

/** RSS 2.0 feed for the blog — discovery + syndication + a freshness signal.
 *  Edge-safe: hand-built XML, no Node-only libraries. */
export async function GET() {
  const posts = await listPublishedPosts();
  const desc = `Notes on .NET, software architecture, DevOps, and practical AI by ${profile.name}.`;
  const lastBuild = rfc822(posts[0]?.updatedAt ?? posts[0]?.publishedAt ?? null);

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.slug}`;
      const cats = p.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n");
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.excerpt)}</description>
      <pubDate>${rfc822(p.publishedAt)}</pubDate>
${cats}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(profile.name)} — Writing</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${esc(desc)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

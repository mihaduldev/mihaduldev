import { query, requireDB, parseJson } from "./client";
import { SEED_POSTS } from "@/lib/seed-posts";

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  bodyMd: string;
  tags: string[];
  cover: string;
  readingTime: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
};

// updated_at is DB-managed (unixepoch() on write), so it isn't part of the input.
export type PostInput = Omit<Post, "id" | "updatedAt">;

// Used only when D1 is unavailable (plain build / sandbox); production reads D1.
const FALLBACK_POSTS: Post[] = SEED_POSTS;

function toPost(r: Record<string, unknown>): Post {
  return {
    id: Number(r.id),
    slug: String(r.slug),
    title: String(r.title),
    excerpt: String(r.excerpt),
    bodyMd: String(r.body_md),
    tags: parseJson<string[]>(r.tags_json, []),
    cover: String(r.cover),
    readingTime: String(r.reading_time),
    published: Number(r.published) === 1,
    publishedAt: (r.published_at as string | null) ?? null,
    // updated_at is a unix-epoch INTEGER (seconds) → ISO for dateModified / sitemap lastmod
    updatedAt:
      r.updated_at != null ? new Date(Number(r.updated_at) * 1000).toISOString() : null,
  };
}

export async function listPublishedPosts(): Promise<Post[]> {
  return query(async (db) => {
    const { results } = await db
      .prepare("SELECT * FROM posts WHERE published = 1 ORDER BY published_at DESC, id DESC")
      .all();
    return results.map(toPost);
  }, FALLBACK_POSTS.filter((p) => p.published));
}

export async function listAllPosts(): Promise<Post[]> {
  return query(async (db) => {
    const { results } = await db
      .prepare("SELECT * FROM posts ORDER BY COALESCE(published_at, '') DESC, id DESC")
      .all();
    return results.map(toPost);
  }, FALLBACK_POSTS);
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  return query(async (db) => {
    const row = await db
      .prepare("SELECT * FROM posts WHERE slug = ? AND published = 1")
      .bind(slug)
      .first();
    return row ? toPost(row) : null;
  }, FALLBACK_POSTS.find((p) => p.slug === slug && p.published) ?? null);
}

export async function getPost(id: number): Promise<Post | null> {
  return query(async (db) => {
    const row = await db.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
    return row ? toPost(row) : null;
  }, FALLBACK_POSTS.find((p) => p.id === id) ?? null);
}

export async function createPost(input: PostInput): Promise<void> {
  const db = await requireDB();
  await db
    .prepare(
      "INSERT INTO posts (slug, title, excerpt, body_md, tags_json, cover, reading_time, published, published_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())"
    )
    .bind(
      input.slug,
      input.title,
      input.excerpt,
      input.bodyMd,
      JSON.stringify(input.tags),
      input.cover,
      input.readingTime,
      input.published ? 1 : 0,
      input.publishedAt
    )
    .run();
}

export async function updatePost(id: number, input: PostInput): Promise<void> {
  const db = await requireDB();
  await db
    .prepare(
      "UPDATE posts SET slug=?, title=?, excerpt=?, body_md=?, tags_json=?, cover=?, reading_time=?, published=?, published_at=?, updated_at=unixepoch() WHERE id=?"
    )
    .bind(
      input.slug,
      input.title,
      input.excerpt,
      input.bodyMd,
      JSON.stringify(input.tags),
      input.cover,
      input.readingTime,
      input.published ? 1 : 0,
      input.publishedAt,
      id
    )
    .run();
}

export async function deletePost(id: number): Promise<void> {
  const db = await requireDB();
  await db.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
}

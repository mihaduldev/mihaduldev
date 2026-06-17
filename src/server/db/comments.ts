import { getDB, query } from "./client";

/** Public-safe comment — never includes the author's email. */
export type PublicComment = {
  id: number;
  parentId: number | null;
  authorName: string;
  body: string;
  createdAt: number;
};

/** Admin view — includes email + request metadata for moderation. */
export type AdminComment = PublicComment & {
  postSlug: string;
  authorEmail: string;
  country: string | null;
  ip: string | null;
  userAgent: string | null;
};

/** Per-comment metadata surfaced only to a logged-in admin. */
export type CommentMeta = {
  id: number;
  email: string;
  country: string | null;
  ip: string | null;
  userAgent: string | null;
};

export type CommentInput = {
  postSlug: string;
  parentId?: number | null;
  authorName: string;
  authorEmail: string;
  body: string;
  country?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

function toPublic(r: Record<string, unknown>): PublicComment {
  return {
    id: Number(r.id),
    parentId: r.parent_id == null ? null : Number(r.parent_id),
    authorName: String(r.author_name),
    body: String(r.body),
    createdAt: Number(r.created_at),
  };
}

/** All comments for a post (flat, oldest-first). Email is excluded by the SELECT. */
export async function listComments(postSlug: string): Promise<PublicComment[]> {
  return query(async (db) => {
    const { results } = await db
      .prepare(
        "SELECT id, parent_id, author_name, body, created_at FROM comments WHERE post_slug = ? ORDER BY created_at ASC, id ASC"
      )
      .bind(postSlug)
      .all();
    return results.map(toPublic);
  }, []);
}

export async function countComments(postSlug: string): Promise<number> {
  return query(async (db) => {
    const row = await db
      .prepare("SELECT COUNT(*) AS n FROM comments WHERE post_slug = ?")
      .bind(postSlug)
      .first<{ n: number }>();
    return Number(row?.n ?? 0);
  }, 0);
}

export async function listAllComments(): Promise<AdminComment[]> {
  return query(async (db) => {
    const { results } = await db
      .prepare("SELECT * FROM comments ORDER BY created_at DESC, id DESC LIMIT 500")
      .all();
    return results.map((r) => ({
      ...toPublic(r),
      postSlug: String(r.post_slug),
      authorEmail: String(r.author_email),
      country: (r.country as string | null) ?? null,
      ip: (r.ip as string | null) ?? null,
      userAgent: (r.user_agent as string | null) ?? null,
    }));
  }, []);
}

/** Admin-only metadata for one post's comments (keyed by comment id client-side). */
export async function listCommentMeta(postSlug: string): Promise<CommentMeta[]> {
  return query(async (db) => {
    const { results } = await db
      .prepare("SELECT id, author_email, country, ip, user_agent FROM comments WHERE post_slug = ?")
      .bind(postSlug)
      .all();
    return results.map((r) => ({
      id: Number(r.id),
      email: String(r.author_email),
      country: (r.country as string | null) ?? null,
      ip: (r.ip as string | null) ?? null,
      userAgent: (r.user_agent as string | null) ?? null,
    }));
  }, []);
}

export async function countAllComments(): Promise<number> {
  return query(async (db) => {
    const row = await db.prepare("SELECT COUNT(*) AS n FROM comments").first<{ n: number }>();
    return Number(row?.n ?? 0);
  }, 0);
}

/** Light anti-spam: true if this email posted within the last `seconds`. */
export async function commentedRecently(email: string, seconds: number): Promise<boolean> {
  return query(async (db) => {
    const row = await db
      .prepare("SELECT created_at FROM comments WHERE author_email = ? ORDER BY created_at DESC LIMIT 1")
      .bind(email)
      .first<{ created_at: number }>();
    if (!row) return false;
    return Math.floor(Date.now() / 1000) - Number(row.created_at) < seconds;
  }, false);
}

/** Inserts a comment. Replies are only attached to a top-level comment of the
 *  same post (prevents cross-post / deep-nest injection). Returns the public
 *  row (or null when D1 is unavailable). */
export async function createComment(input: CommentInput): Promise<PublicComment | null> {
  const db = await getDB();
  if (!db) return null;

  let parentId: number | null = input.parentId ?? null;
  if (parentId != null) {
    const parent = await db
      .prepare("SELECT id FROM comments WHERE id = ? AND post_slug = ? AND parent_id IS NULL")
      .bind(parentId, input.postSlug)
      .first();
    if (!parent) parentId = null; // fall back to top-level if parent is invalid
  }

  const res = (await db
    .prepare(
      "INSERT INTO comments (post_slug, parent_id, author_name, author_email, body, country, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      input.postSlug,
      parentId,
      input.authorName,
      input.authorEmail,
      input.body,
      input.country ?? null,
      input.ip ?? null,
      input.userAgent ?? null
    )
    .run()) as { meta?: { last_row_id?: number } };

  return {
    id: Number(res.meta?.last_row_id ?? 0),
    parentId,
    authorName: input.authorName,
    body: input.body,
    createdAt: Math.floor(Date.now() / 1000),
  };
}

/** Deletes a comment and any replies to it (admin moderation). */
export async function deleteComment(id: number): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.prepare("DELETE FROM comments WHERE id = ? OR parent_id = ?").bind(id, id).run();
}

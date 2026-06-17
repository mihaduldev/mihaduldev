import { getDB, query } from "./client";

export type ReactionType = "like" | "dislike";
export type ReactionCounts = { like: number; dislike: number };

export type ReactionInput = {
  postSlug: string;
  authorName: string;
  authorEmail: string;
  type: ReactionType;
};

export async function getReactionCounts(postSlug: string): Promise<ReactionCounts> {
  return query(
    async (db) => {
      const { results } = await db
        .prepare("SELECT type, COUNT(*) AS n FROM reactions WHERE post_slug = ? GROUP BY type")
        .bind(postSlug)
        .all<{ type: string; n: number }>();
      const counts: ReactionCounts = { like: 0, dislike: 0 };
      for (const r of results) {
        if (r.type === "like") counts.like = Number(r.n);
        else if (r.type === "dislike") counts.dislike = Number(r.n);
      }
      return counts;
    },
    { like: 0, dislike: 0 }
  );
}

/** Upsert one reaction per (post, email); switching like↔dislike updates in place. */
export async function setReaction(input: ReactionInput): Promise<ReactionCounts> {
  const db = await getDB();
  if (!db) return { like: 0, dislike: 0 };
  await db
    .prepare(
      `INSERT INTO reactions (post_slug, author_name, author_email, type)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(post_slug, author_email)
       DO UPDATE SET type = excluded.type, author_name = excluded.author_name, created_at = unixepoch()`
    )
    .bind(input.postSlug, input.authorName, input.authorEmail, input.type)
    .run();
  return getReactionCounts(input.postSlug);
}

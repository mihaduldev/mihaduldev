import { getDB, query, parseJson } from "./client";

export type ChatRole = "user" | "assistant";

export type ChatMsg = { role: ChatRole; content: string; createdAt: number };

/** Structured project brief extracted by the LLM (admin-facing). */
export type ProjectOverview = {
  visitorName: string | null;
  visitorEmail: string | null;
  projectType: string | null;
  summary: string;
  goals: string[];
  features: string[];
  stack: string[];
  timeline: string | null;
  budget: string | null;
  clarity: "low" | "medium" | "high";
  nextStep: string;
  tags: string[];
};

export type Conversation = {
  id: number;
  sessionId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  overview: ProjectOverview | null;
  overviewAt: number;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
};

const now = () => Math.floor(Date.now() / 1000);

/** Finds the visitor's conversation by session, or creates one (race-safe via
 *  the UNIQUE(session_id) index + ON CONFLICT). Null without D1. */
export async function getOrCreateConversation(
  sessionId: string
): Promise<{ id: number; messageCount: number } | null> {
  const db = await getDB();
  if (!db) return null;
  const existing = await db
    .prepare("SELECT id, message_count FROM chat_conversations WHERE session_id = ?")
    .bind(sessionId)
    .first<{ id: number; message_count: number }>();
  if (existing) return { id: Number(existing.id), messageCount: Number(existing.message_count) };
  await db
    .prepare("INSERT INTO chat_conversations (session_id) VALUES (?) ON CONFLICT(session_id) DO NOTHING")
    .bind(sessionId)
    .run();
  const row = await db
    .prepare("SELECT id, message_count FROM chat_conversations WHERE session_id = ?")
    .bind(sessionId)
    .first<{ id: number; message_count: number }>();
  if (!row) return null;
  return { id: Number(row.id), messageCount: Number(row.message_count) };
}

/** Atomic counter for coarse rate limiting. Returns true if ALLOWED. The bucket
 *  `key` self-resets once its window expires. No-ops (allows) without D1. */
export async function rateAllow(key: string, limit: number, windowSec: number): Promise<boolean> {
  const db = await getDB();
  if (!db) return true;
  const t = now();
  const exp = t + windowSec;
  const row = await db
    .prepare(
      `INSERT INTO chat_rate (k, n, exp) VALUES (?1, 1, ?2)
       ON CONFLICT(k) DO UPDATE SET
         n = CASE WHEN chat_rate.exp <= ?3 THEN 1 ELSE chat_rate.n + 1 END,
         exp = CASE WHEN chat_rate.exp <= ?3 THEN ?2 ELSE chat_rate.exp END
       RETURNING n`
    )
    .bind(key, exp, t)
    .first<{ n: number }>();
  return Number(row?.n ?? 1) <= limit;
}

/** True if the conversation's most recent message is newer than `seconds` ago. */
export async function lastMessageWithin(conversationId: number, seconds: number): Promise<boolean> {
  return query(async (db) => {
    const row = await db
      .prepare("SELECT created_at FROM chat_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 1")
      .bind(conversationId)
      .first<{ created_at: number }>();
    if (!row) return false;
    return now() - Number(row.created_at) < seconds;
  }, false);
}

/** Recent messages for rebuilding LLM context (server is the source of truth). */
export async function listConversationMessages(
  conversationId: number,
  limit = 40
): Promise<ChatMsg[]> {
  return query(async (db) => {
    const { results } = await db
      .prepare(
        "SELECT role, content, created_at FROM chat_messages WHERE conversation_id = ? ORDER BY id ASC LIMIT ?"
      )
      .bind(conversationId, limit)
      .all();
    return results.map((r) => ({
      role: (String(r.role) === "assistant" ? "assistant" : "user") as ChatRole,
      content: String(r.content),
      createdAt: Number(r.created_at),
    }));
  }, []);
}

export async function addMessages(
  conversationId: number,
  msgs: { role: ChatRole; content: string }[]
): Promise<void> {
  const db = await getDB();
  if (!db) return;
  for (const m of msgs) {
    await db
      .prepare("INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, ?, ?)")
      .bind(conversationId, m.role, m.content)
      .run();
  }
  await db
    .prepare("UPDATE chat_conversations SET message_count = message_count + ?, updated_at = unixepoch() WHERE id = ?")
    .bind(msgs.length, conversationId)
    .run();
}

function toConversation(r: Record<string, unknown>): Conversation {
  return {
    id: Number(r.id),
    sessionId: String(r.session_id),
    visitorName: (r.visitor_name as string | null) ?? null,
    visitorEmail: (r.visitor_email as string | null) ?? null,
    overview: parseJson<ProjectOverview | null>(r.overview_json, null),
    overviewAt: Number(r.overview_at ?? 0),
    messageCount: Number(r.message_count ?? 0),
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

/* ---------------- admin ---------------- */

export async function listConversations(): Promise<Conversation[]> {
  return query(async (db) => {
    const { results } = await db
      .prepare(
        "SELECT * FROM chat_conversations WHERE message_count > 0 ORDER BY updated_at DESC, id DESC LIMIT 300"
      )
      .all();
    return results.map(toConversation);
  }, []);
}

export async function getConversation(id: number): Promise<Conversation | null> {
  return query(async (db) => {
    const row = await db.prepare("SELECT * FROM chat_conversations WHERE id = ?").bind(id).first();
    return row ? toConversation(row) : null;
  }, null);
}

export async function countConversations(): Promise<number> {
  return query(async (db) => {
    const row = await db
      .prepare("SELECT COUNT(*) AS n FROM chat_conversations WHERE message_count > 0")
      .first<{ n: number }>();
    return Number(row?.n ?? 0);
  }, 0);
}

/** Persists the generated brief + the message_count it reflects (staleness). */
export async function saveOverview(
  id: number,
  overview: ProjectOverview,
  atCount: number
): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db
    .prepare(
      "UPDATE chat_conversations SET overview_json = ?, overview_at = ?, visitor_name = COALESCE(?, visitor_name), visitor_email = COALESCE(?, visitor_email) WHERE id = ?"
    )
    .bind(JSON.stringify(overview), atCount, overview.visitorName, overview.visitorEmail, id)
    .run();
}

export async function deleteConversation(id: number): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.prepare("DELETE FROM chat_messages WHERE conversation_id = ?").bind(id).run();
  await db.prepare("DELETE FROM chat_conversations WHERE id = ?").bind(id).run();
}

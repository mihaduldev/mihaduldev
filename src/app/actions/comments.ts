"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/server/auth";
import {
  createComment,
  commentedRecently,
  listCommentMeta,
  deleteComment,
  type PublicComment,
  type CommentMeta,
} from "@/server/db/comments";
import { setReaction, type ReactionCounts } from "@/server/db/reactions";

const slugRe = /^[a-z0-9-]+$/;

function isPrivateIp(ip: string) {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("::ffff:127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

/** Best-effort country lookup (2-letter code) for hosts not behind Cloudflare.
 *  With no `ip` it geolocates the caller's egress IP — handy in local dev. */
async function geoCountry(ip?: string): Promise<string | null> {
  const url = ip ? `https://api.country.is/${ip}` : "https://api.country.is/";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as { country?: string };
    const code = (data.country ?? "").toUpperCase();
    return /^[A-Z]{2}$/.test(code) ? code : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Request metadata for a comment. Country: Cloudflare's `cf-ipcountry` in
 *  production; a geo-IP fallback otherwise so it still populates off-CF / in dev. */
async function requestMeta() {
  try {
    const h = await headers();
    let country = h.get("cf-ipcountry");
    const ip =
      h.get("cf-connecting-ip") ||
      h.get("x-real-ip") ||
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;
    if (!country || country === "XX" || country === "T1") {
      country = ip && !isPrivateIp(ip) ? await geoCountry(ip) : await geoCountry();
    }
    return { country: country || null, ip, userAgent: h.get("user-agent") };
  } catch {
    return { country: null, ip: null, userAgent: null };
  }
}

async function isAdmin(): Promise<boolean> {
  try {
    const c = await cookies();
    return Boolean(await verifySession(c.get(SESSION_COOKIE)?.value));
  } catch {
    return false;
  }
}

const slug = z.string().min(1).max(120).regex(/^[a-z0-9-]+$/);

const commentSchema = z.object({
  slug,
  parentId: z.number().int().positive().nullish(),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  body: z.string().trim().min(2).max(2000),
  website: z.string().optional(), // honeypot — real users never fill this
});

export type AddCommentResult = { ok: boolean; error?: string; comment?: PublicComment };

export async function addComment(input: unknown): Promise<AddCommentResult> {
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check your name, email, and comment (2+ characters)." };
  }
  const d = parsed.data;
  if (d.website && d.website.trim()) return { ok: false, error: "Submission blocked." };

  try {
    if (await commentedRecently(d.email, 15)) {
      return { ok: false, error: "You're posting a little fast — give it a few seconds." };
    }
    const comment = await createComment({
      postSlug: d.slug,
      parentId: d.parentId ?? null,
      authorName: d.name,
      authorEmail: d.email,
      body: d.body,
      ...(await requestMeta()),
    });
    if (!comment) return { ok: false, error: "Comments are temporarily unavailable." };
    revalidatePath(`/blog/${d.slug}`);
    return { ok: true, comment };
  } catch {
    return { ok: false, error: "Couldn't post your comment right now — please try again." };
  }
}

const reactionSchema = z.object({
  slug,
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  type: z.enum(["like", "dislike"]),
  website: z.string().optional(),
});

export type ReactResult = { ok: boolean; error?: string; counts?: ReactionCounts };

export async function reactToPost(input: unknown): Promise<ReactResult> {
  const parsed = reactionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please enter your name and a valid email." };
  const d = parsed.data;
  if (d.website && d.website.trim()) return { ok: false, error: "Blocked." };

  try {
    const counts = await setReaction({
      postSlug: d.slug,
      authorName: d.name,
      authorEmail: d.email,
      type: d.type,
    });
    revalidatePath(`/blog/${d.slug}`);
    return { ok: true, counts };
  } catch {
    return { ok: false, error: "Couldn't record your reaction right now." };
  }
}

/* ---------- admin-only inline moderation (called from the public post) ---------- */

export type ModerationResult = { isAdmin: boolean; meta?: CommentMeta[] };

/** Returns admin status + per-comment metadata for a post — only when the
 *  caller holds a valid admin session. Non-admins get `{ isAdmin: false }`. */
export async function getCommentModeration(slug: string): Promise<ModerationResult> {
  if (typeof slug !== "string" || !slugRe.test(slug)) return { isAdmin: false };
  if (!(await isAdmin())) return { isAdmin: false };
  return { isAdmin: true, meta: await listCommentMeta(slug) };
}

/** Delete a comment (and its replies) — admin session required. */
export async function moderateDelete(id: number, slug: string): Promise<{ ok: boolean }> {
  if (!(await isAdmin())) return { ok: false };
  if (!Number.isInteger(id) || id <= 0) return { ok: false };
  await deleteComment(id);
  if (typeof slug === "string" && slugRe.test(slug)) revalidatePath(`/blog/${slug}`);
  return { ok: true };
}

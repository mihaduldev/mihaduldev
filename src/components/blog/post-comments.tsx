"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  CornerDownRight,
  Loader2,
  Send,
  Trash2,
} from "lucide-react";
import {
  addComment,
  reactToPost,
  getCommentModeration,
  moderateDelete,
} from "@/app/actions/comments";
import type { PublicComment, CommentMeta } from "@/server/db/comments";
import type { ReactionCounts, ReactionType } from "@/server/db/reactions";

type Identity = { name: string; email: string };
const ID_KEY = "mihad_identity";

const field =
  "w-full rounded-xl border border-border bg-primary/[0.03] px-3.5 py-2.5 text-sm text-primary outline-none transition-colors placeholder:text-tertiary focus:border-accent";

/* ---------- helpers ---------- */
function loadIdentity(): Identity {
  try {
    const raw = localStorage.getItem(ID_KEY);
    if (raw) {
      const v = JSON.parse(raw) as Identity;
      if (v && typeof v.name === "string" && typeof v.email === "string") return v;
    }
  } catch {
    /* ignore */
  }
  return { name: "", email: "" };
}

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return `hsl(${h} 55% 42%)`;
}

function relTime(unix: number) {
  const s = Math.max(1, Math.floor(Date.now() / 1000) - unix);
  const units: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [604800, "w"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [sec, label] of units) if (s >= sec) return `${Math.floor(s / sec)}${label} ago`;
  return "just now";
}

/* Honeypot — hidden from real users, catches naive bots. */
function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="absolute left-[-9999px] top-0 h-0 w-0 opacity-0"
    />
  );
}

/* Friendly browser/OS summary from a raw user-agent (admin view only). */
function uaName(ua: string | null) {
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Version\/.*Safari/.test(ua)
            ? "Safari"
            : "Browser";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Android/.test(ua)
      ? "Android"
      : /iPhone|iPad|iPod/.test(ua)
        ? "iOS"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return os ? `${browser} · ${os}` : browser;
}

/* 2-letter country code → flag emoji (regional indicator symbols). */
function flag(code: string | null) {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

/* Admin-only strip under each comment: who posted + delete control. */
function AdminBar({ meta, onDelete }: { meta?: CommentMeta; onDelete: () => void }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-amber-400/25 bg-amber-400/[0.07] px-2.5 py-1.5 text-[11px] text-tertiary">
      <span className="font-semibold uppercase tracking-wider text-amber-400/90">Admin</span>
      {meta?.email && <span className="text-secondary">{meta.email}</span>}
      {meta?.country && (
        <span>
          · {flag(meta.country)} {meta.country}
        </span>
      )}
      {meta?.ip && <span>· {meta.ip}</span>}
      <span>· {uaName(meta?.userAgent ?? null)}</span>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete this comment"
        className="ml-auto inline-flex items-center gap-1 font-medium text-red-400 transition-colors hover:text-red-300"
      >
        <Trash2 className="size-3" /> Delete
      </button>
    </div>
  );
}

/* ---------- comment form (top-level or reply) ---------- */
function CommentForm({
  slug,
  parentId,
  identity,
  onSaveIdentity,
  onAdded,
  onCancel,
  autoFocus,
  compact,
}: {
  slug: string;
  parentId?: number;
  identity: Identity;
  onSaveIdentity: (id: Identity) => void;
  onAdded: (c: PublicComment) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  compact?: boolean;
}) {
  const [name, setName] = useState(identity.name);
  const [email, setEmail] = useState(identity.email);
  const [body, setBody] = useState("");
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Identity loads from localStorage after mount; fill empty fields when it
  // arrives (and on later changes) without clobbering anything the user typed.
  useEffect(() => {
    if (identity.name) setName((n) => n || identity.name);
    if (identity.email) setEmail((e2) => e2 || identity.email);
  }, [identity.name, identity.email]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const res = await addComment({
      slug,
      parentId: parentId ?? null,
      name,
      email,
      body,
      website: hp,
    });
    setBusy(false);
    if (res.ok && res.comment) {
      onSaveIdentity({ name: name.trim(), email: email.trim() });
      setBody("");
      onAdded(res.comment);
      onCancel?.();
    } else {
      setErr(res.error ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={submit} className={compact ? "mt-3" : ""} noValidate>
      <Honeypot value={hp} onChange={setHp} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          aria-label="Your name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={field}
          autoFocus={autoFocus}
        />
        <input
          aria-label="Your email (not published)"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (not published)"
          className={field}
        />
      </div>
      <textarea
        aria-label="Your comment"
        required
        rows={compact ? 2 : 3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? "Write a reply…" : "Share your thoughts…"}
        className={`${field} mt-3 resize-none`}
      />
      {err && <p role="alert" className="mt-2 text-xs text-red-400">{err}</p>}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-brand-foreground transition-all hover:shadow-[var(--glow-md)] disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {parentId ? "Reply" : "Post comment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-tertiary transition-colors hover:text-primary"
          >
            Cancel
          </button>
        )}
        {!parentId && (
          <span className="ml-auto text-xs text-tertiary">Email stays private.</span>
        )}
      </div>
    </form>
  );
}

/* ---------- avatar ---------- */
function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ width: size, height: size, backgroundColor: avatarColor(name) }}
    >
      {initial(name)}
    </span>
  );
}

/* ---------- single comment + its replies ---------- */
function CommentItem({
  comment,
  replies,
  slug,
  identity,
  onSaveIdentity,
  onAdded,
  isAdmin,
  metaById,
  onDelete,
}: {
  comment: PublicComment;
  replies: PublicComment[];
  slug: string;
  identity: Identity;
  onSaveIdentity: (id: Identity) => void;
  onAdded: (c: PublicComment) => void;
  isAdmin: boolean;
  metaById: Record<number, CommentMeta>;
  onDelete: (id: number) => void;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <li className="rounded-2xl glass p-5">
      <div className="flex items-start gap-3">
        <Avatar name={comment.authorName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">{comment.authorName}</span>
            <span className="text-xs text-tertiary">· {relTime(comment.createdAt)}</span>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-secondary">
            {comment.body}
          </p>
          <button
            type="button"
            onClick={() => setReplying((v) => !v)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-tertiary transition-colors hover:text-accent"
          >
            <CornerDownRight className="size-3.5" />
            {replying ? "Cancel" : "Reply"}
          </button>

          <AnimatePresence>
            {replying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <CommentForm
                  slug={slug}
                  parentId={comment.id}
                  identity={identity}
                  onSaveIdentity={onSaveIdentity}
                  onAdded={onAdded}
                  onCancel={() => setReplying(false)}
                  autoFocus
                  compact
                />
              </motion.div>
            )}
          </AnimatePresence>

          {isAdmin && (
            <AdminBar meta={metaById[comment.id]} onDelete={() => onDelete(comment.id)} />
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <ul className="mt-4 space-y-3 border-l border-border pl-4 sm:pl-5">
          {replies.map((r) => (
            <li key={r.id} className="flex items-start gap-3">
              <Avatar name={r.authorName} size={30} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">{r.authorName}</span>
                  <span className="text-xs text-tertiary">· {relTime(r.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-secondary">
                  {r.body}
                </p>
                {isAdmin && (
                  <AdminBar meta={metaById[r.id]} onDelete={() => onDelete(r.id)} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/* ---------- reactions ---------- */
function ReactionBar({
  slug,
  counts,
  setCounts,
  mine,
  setMine,
  identity,
  onSaveIdentity,
}: {
  slug: string;
  counts: ReactionCounts;
  setCounts: (c: ReactionCounts) => void;
  mine: ReactionType | null;
  setMine: (t: ReactionType) => void;
  identity: Identity;
  onSaveIdentity: (id: Identity) => void;
}) {
  const [pending, setPending] = useState<ReactionType | null>(null);
  const [name, setName] = useState(identity.name);
  const [email, setEmail] = useState(identity.email);
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function send(type: ReactionType, who: Identity) {
    setErr("");
    if (who.name.trim().length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(who.email.trim())) {
      setErr("Please enter your name and a valid email.");
      return;
    }
    setBusy(true);
    const res = await reactToPost({ slug, name: who.name, email: who.email, type, website: hp });
    setBusy(false);
    if (res.ok && res.counts) {
      setCounts(res.counts);
      setMine(type);
      onSaveIdentity({ name: who.name.trim(), email: who.email.trim() });
      try {
        localStorage.setItem(`mihad_react_${slug}`, type);
      } catch {
        /* ignore */
      }
      setPending(null);
    } else {
      setErr(res.error ?? "Couldn't record that.");
    }
  }

  function onReact(type: ReactionType) {
    if (identity.name.trim() && identity.email.trim()) {
      send(type, identity);
    } else {
      setName(identity.name);
      setEmail(identity.email);
      setPending(type);
    }
  }

  const btn = (type: ReactionType, Icon: typeof ThumbsUp, count: number) => {
    const active = mine === type;
    return (
      <button
        type="button"
        onClick={() => onReact(type)}
        disabled={busy}
        aria-pressed={active}
        aria-label={`${type === "like" ? "Like" : "Dislike"} this post (${count})`}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all disabled:opacity-60 ${
          active
            ? "border-accent/40 bg-accent/15 text-accent"
            : "border-border glass text-secondary hover:border-accent/40 hover:text-primary"
        }`}
      >
        <Icon className={`size-4 ${active ? "fill-accent/30" : ""}`} />
        <span className="tabular-nums">{count}</span>
      </button>
    );
  };

  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-secondary">Was this helpful?</span>
        <div className="flex items-center gap-2.5">
          {btn("like", ThumbsUp, counts.like)}
          {btn("dislike", ThumbsDown, counts.dislike)}
        </div>
        <span aria-live="polite" className="text-xs text-tertiary">
          {mine ? "Thanks for the feedback!" : ""}
        </span>
      </div>

      <AnimatePresence>
        {pending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-tertiary">
                Add your name and email to {pending === "like" ? "like" : "dislike"} this post.
              </p>
              <Honeypot value={hp} onChange={setHp} />
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <input
                  aria-label="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={field}
                  autoFocus
                />
                <input
                  aria-label="Your email (not published)"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (not published)"
                  className={field}
                />
              </div>
              {err && <p role="alert" className="mt-2 text-xs text-red-400">{err}</p>}
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  disabled={busy}
                  aria-busy={busy}
                  onClick={() => send(pending, { name, email })}
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-brand-foreground transition-all hover:shadow-[var(--glow-md)] disabled:opacity-60"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  className="text-sm font-medium text-tertiary transition-colors hover:text-primary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {err && !pending && <p role="alert" className="mt-2 text-xs text-red-400">{err}</p>}
    </div>
  );
}

/* ---------- section ---------- */
export function PostComments({
  slug,
  initialComments,
  initialCounts,
}: {
  slug: string;
  initialComments: PublicComment[];
  initialCounts: ReactionCounts;
}) {
  const [comments, setComments] = useState<PublicComment[]>(initialComments);
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts);
  const [identity, setIdentity] = useState<Identity>({ name: "", email: "" });
  const [mine, setMine] = useState<ReactionType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [metaById, setMetaById] = useState<Record<number, CommentMeta>>({});

  useEffect(() => {
    setIdentity(loadIdentity());
    try {
      const r = localStorage.getItem(`mihad_react_${slug}`);
      if (r === "like" || r === "dislike") setMine(r);
    } catch {
      /* ignore */
    }
  }, [slug]);

  // Reveal admin metadata + delete controls only when a valid admin session is
  // present (verified server-side). Normal visitors get nothing extra.
  useEffect(() => {
    let cancelled = false;
    getCommentModeration(slug)
      .then((res) => {
        if (cancelled || !res.isAdmin || !res.meta) return;
        const map: Record<number, CommentMeta> = {};
        for (const m of res.meta) map[m.id] = m;
        setIsAdmin(true);
        setMetaById(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleDelete(id: number) {
    const res = await moderateDelete(id, slug);
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
    }
  }

  function saveIdentity(id: Identity) {
    setIdentity(id);
    try {
      localStorage.setItem(ID_KEY, JSON.stringify(id));
    } catch {
      /* ignore */
    }
  }

  const addToList = (c: PublicComment) => setComments((prev) => [...prev, c]);

  const { topLevel, repliesByParent } = useMemo(() => {
    const topIds = new Set(comments.filter((c) => c.parentId == null).map((c) => c.id));
    const replies: Record<number, PublicComment[]> = {};
    const tops: PublicComment[] = [];
    for (const c of comments) {
      // a reply whose parent is missing (e.g. deleted) renders as top-level, so
      // the visible thread always matches the Discussion count — nothing hides.
      if (c.parentId != null && topIds.has(c.parentId)) {
        (replies[c.parentId] ??= []).push(c);
      } else {
        tops.push(c);
      }
    }
    tops.sort((a, b) => b.createdAt - a.createdAt);
    for (const k of Object.keys(replies)) {
      replies[Number(k)].sort((a, b) => a.createdAt - b.createdAt);
    }
    return { topLevel: tops, repliesByParent: replies };
  }, [comments]);

  return (
    <section aria-label="Reactions and comments" className="mt-16 border-t border-border pt-12">
      <ReactionBar
        slug={slug}
        counts={counts}
        setCounts={setCounts}
        mine={mine}
        setMine={setMine}
        identity={identity}
        onSaveIdentity={saveIdentity}
      />

      <div className="mt-10 flex items-center gap-2">
        <MessageCircle className="size-5 text-accent" />
        <h2 className="font-display text-xl font-bold text-primary">
          Discussion{" "}
          <span className="text-tertiary">({comments.length})</span>
        </h2>
      </div>

      <div className="mt-5 rounded-2xl glass glow-ring p-5 sm:p-6">
        <p className="mb-4 text-sm font-medium text-secondary">Join the conversation</p>
        <CommentForm
          slug={slug}
          identity={identity}
          onSaveIdentity={saveIdentity}
          onAdded={addToList}
        />
      </div>

      {topLevel.length === 0 ? (
        <p className="mt-8 text-center text-sm text-tertiary">
          No comments yet — be the first to share your thoughts.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {topLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              replies={repliesByParent[c.id] ?? []}
              slug={slug}
              identity={identity}
              onSaveIdentity={saveIdentity}
              onAdded={addToList}
              isAdmin={isAdmin}
              metaById={metaById}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

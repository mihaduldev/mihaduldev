"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, X, Send, Loader2, RotateCcw } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ChatMarkdown } from "@/components/assistant/chat-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const SESSION_KEY = "mihad_chat_session";
const MSGS_KEY = "mihad_chat_msgs";
const CID_KEY = "mihad_chat_cid";

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm Mihadul's assistant. Ask me anything about his skills, experience, or how he works — or tell me about a project you have in mind and I'll gather the details so he can follow up.",
};

const CHIPS = ["What's his .NET stack?", "Show recent projects", "Start a project brief"];

function makeSession() {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID().replace(/-/g, "");
  } catch {
    /* ignore */
  }
  return `s${Math.abs(Date.now()).toString(36)}${Math.floor(performance.now()).toString(36)}xpad`;
}

/** Mihadul's logomark as the assistant identity — used in the header and beside
 *  every reply. A radar pulse appears ONLY while the AI is thinking (loading), so
 *  the scrollback never carries a column of competing infinite rings. */
function BrandAvatar({ size = "sm", loading = false }: { size?: "sm" | "md"; loading?: boolean }) {
  const mark = size === "md" ? "size-9 rounded-xl" : "size-7 rounded-lg";
  const radius = size === "md" ? "rounded-xl" : "rounded-lg";
  return (
    <span aria-hidden className="relative grid shrink-0 place-items-center">
      <BrandMark className={mark} />
      {loading && (
        <>
          <span
            className={`pointer-events-none absolute inset-0 ${radius} ring-1 ring-react-cyan/50 motion-reduce:hidden`}
            style={{ animation: "aurora-pulse 1.8s ease-in-out infinite" }}
          />
          <span
            className={`pointer-events-none absolute inset-0 ${radius} ring-1 ring-react-cyan/40 motion-reduce:hidden`}
            style={{ animation: "aurora-pulse 1.8s ease-in-out infinite", animationDelay: "0.9s" }}
          />
        </>
      )}
    </span>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sessionRef = useRef<string>("");
  const cidRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const prevOpen = useRef(false);
  const reduce = useReducedMotion();

  // restore session + transcript
  useEffect(() => {
    try {
      let s = localStorage.getItem(SESSION_KEY);
      if (!s) {
        s = makeSession();
        localStorage.setItem(SESSION_KEY, s);
      }
      sessionRef.current = s;
      const c = localStorage.getItem(CID_KEY);
      if (c) cidRef.current = Number(c) || null;
      const saved = localStorage.getItem(MSGS_KEY);
      if (saved) {
        const arr = JSON.parse(saved) as Msg[];
        if (Array.isArray(arr) && arr.length) setMessages(arr);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // persist transcript + autoscroll
  useEffect(() => {
    try {
      localStorage.setItem(MSGS_KEY, JSON.stringify(messages.slice(-60)));
    } catch {
      /* ignore */
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Focus the input on open; restore focus to the launcher on close.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
    if (prevOpen.current) launcherRef.current?.focus();
  }, [open]);
  useEffect(() => {
    prevOpen.current = open;
  }, [open]);
  // Escape closes the panel from anywhere within it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // On open, verify the stored conversation still exists server-side. If the
  // admin deleted this lead, wipe the stale local transcript so the visitor sees
  // a fresh start instead of a deleted thread. (No-op for first-time visitors.)
  useEffect(() => {
    if (!open) return;
    const session = sessionRef.current;
    const cid = cidRef.current;
    if (!session || cid == null) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/assistant/chat?sessionId=${encodeURIComponent(session)}`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { exists?: boolean; conversationId?: number | null };
        if (cancelled) return;
        const gone =
          !data.exists ||
          (typeof data.conversationId === "number" && data.conversationId !== cid);
        if (gone) {
          cidRef.current = null;
          try {
            localStorage.removeItem(MSGS_KEY);
            localStorage.removeItem(CID_KEY);
          } catch {
            /* ignore */
          }
          setMessages([GREETING]);
        }
      } catch {
        /* keep history on network error */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  function newChat() {
    if (loading) return;
    setMessages([GREETING]);
    setError("");
    try {
      localStorage.removeItem(MSGS_KEY);
    } catch {
      /* ignore */
    }
    inputRef.current?.focus();
  }

  async function send(textArg?: string) {
    const text = (textArg ?? input).trim();
    if (!text || loading) return;
    setError("");
    if (textArg == null) setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionRef.current, message: text }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
        conversationId?: number;
      };
      if (!res.ok || !data.reply) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.error ?? "Something went wrong. Please try again, or email mehad65@gmail.com.",
          },
        ]);
        return;
      }
      // If the server conversation changed (e.g. the admin deleted this lead),
      // discard the stale transcript and begin a fresh thread with this turn.
      if (typeof data.conversationId === "number") {
        if (cidRef.current != null && data.conversationId !== cidRef.current) {
          setMessages([GREETING, { role: "user", content: text }]);
        }
        cidRef.current = data.conversationId;
        try {
          localStorage.setItem(CID_KEY, String(data.conversationId));
        } catch {
          /* ignore */
        }
      }
      // Typewriter reveal — finishes in ~2s regardless of length, so it reads
      // like a streaming chatbot while the request itself stays non-streaming.
      const reply = data.reply;
      if (reduce) {
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
      } else {
        const step = Math.max(2, Math.ceil(reply.length / 140));
        setMessages((m) => [...m, { role: "assistant", content: reply.slice(0, step) }]);
        for (let i = step * 2; i < reply.length; i += step) {
          await new Promise((r) => setTimeout(r, 16));
          const slice = reply.slice(0, i);
          setMessages((m) => {
            const c = [...m];
            c[c.length - 1] = { role: "assistant", content: slice };
            return c;
          });
        }
        setMessages((m) => {
          const c = [...m];
          c[c.length - 1] = { role: "assistant", content: reply };
          return c;
        });
      }
    } catch {
      setError("Network error — please try again.");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I couldn't reach the server. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const lastIdx = messages.length - 1;
  // length+role check (not GREETING reference) so chips survive a localStorage reload
  const showChips = messages.length === 1 && messages[0]?.role === "assistant" && !loading;
  const showTyping = loading && messages[lastIdx]?.role !== "assistant";

  return (
    <>
      {/* launcher — a squircle that frames Mihadul's logomark, not a generic bot */}
      <motion.button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open Mihadul's assistant"}
        aria-expanded={open}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 16 }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-2xl glass-strong glow-ring shadow-[var(--glow-lg)] transition-shadow hover:shadow-[0_0_44px_var(--glow)]"
      >
        <span aria-hidden className="aurora-edge motion-reduce:hidden" />
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="text-primary"
            >
              <ChevronDown className="size-6" />
            </motion.span>
          ) : (
            <motion.span
              key="mark"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <BrandMark className="size-7" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -right-1 -top-1 grid size-2.5 place-items-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-react-cyan/60 motion-safe:animate-[pulse-glow_2.4s_ease-in-out_infinite]" />
            <span className="relative size-2.5 rounded-full bg-react-cyan shadow-[var(--glow-sm)] ring-2 ring-wash" />
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Mihadul's assistant"
            data-scroll-isolate
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="glass-strong fixed bottom-24 right-3 z-50 flex h-[min(36rem,78vh)] w-[min(25rem,calc(100vw-1.5rem))] origin-bottom-right flex-col overflow-hidden rounded-[1.75rem] glow-ring shadow-[var(--glow-md)] sm:right-5"
          >
            {/* ambient depth — drifting aurora (reuses the page's own glow palette) */}
            <span
              aria-hidden
              className="aurora-blob pointer-events-none absolute -left-1/4 -top-1/4 -z-0 size-[120%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--glow)_34%,transparent),transparent)] opacity-30 blur-2xl will-change-transform motion-safe:animate-[drift_18s_ease-in-out_infinite] dark:opacity-30"
            />
            <span
              aria-hidden
              className="aurora-blob pointer-events-none absolute -bottom-1/4 -right-1/4 -z-0 size-[120%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--brand)_28%,transparent),transparent)] opacity-25 blur-2xl will-change-transform motion-safe:animate-[drift_22s_ease-in-out_infinite_reverse] dark:opacity-30"
            />
            <span aria-hidden className="grain pointer-events-none absolute inset-0 -z-0 opacity-[0.16]" />
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />

            {/* persistent live region (announces replies / thinking to SRs) */}
            <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
              {loading
                ? "Mihadul's assistant is composing a reply…"
                : messages[lastIdx]?.role === "assistant"
                  ? messages[lastIdx].content
                  : ""}
            </div>

            {/* header — identity lockup */}
            <div className="relative z-10 flex items-center gap-3 border-b border-border px-4 py-3.5">
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              <BrandAvatar size="md" loading={loading} />
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold leading-tight text-primary">Mihadul Islam</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-tertiary">
                  Full-Stack .NET Engineer
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-secondary">
                  <span className="size-1.5 rounded-full bg-react-cyan shadow-[var(--glow-sm)]" />
                  {loading ? "Thinking…" : "Available for new work"}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <span className="mr-0.5 font-mono text-[10px] text-tertiary/70">v1</span>
                <button
                  type="button"
                  onClick={newChat}
                  aria-label="Start new chat"
                  title="Start new chat"
                  className="grid size-8 place-items-center rounded-full text-tertiary transition-colors hover:bg-white/5 hover:text-primary"
                >
                  <RotateCcw className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close (Escape)"
                  className="grid size-8 place-items-center rounded-full text-tertiary transition-colors hover:bg-white/5 hover:text-primary"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="relative z-10 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {/* faint scrim keeps text legible over the brightest aurora */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-0 bg-[color-mix(in_srgb,var(--card)_30%,transparent)] dark:bg-[color-mix(in_srgb,var(--card)_52%,transparent)]"
              />
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <motion.div
                    key={i}
                    initial={reduce ? false : { opacity: 0, y: 8, x: 6 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="relative flex justify-end"
                  >
                    <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-sm font-medium text-brand-foreground shadow-[var(--glow-sm)]">
                      {m.content}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={i}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="relative flex items-start gap-2.5"
                  >
                    <BrandAvatar size="sm" />
                    <div className="min-w-0">
                      {i === 0 && (
                        <p className="mb-1 ml-0.5 font-display text-[10px] font-medium text-tertiary">
                          Mihadul Islam
                        </p>
                      )}
                      <div className="relative max-w-full break-words rounded-2xl rounded-tl-md glass px-3.5 py-2.5 pl-4 text-sm leading-relaxed text-secondary before:absolute before:inset-y-2 before:left-0 before:w-[2px] before:rounded-full before:bg-gradient-to-b before:from-accent before:to-react-cyan before:opacity-60 [&_a]:break-all [&_a]:text-accent [&_a]:underline-offset-2 [&_strong]:text-primary">
                        <ChatMarkdown>{m.content}</ChatMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )
              )}

              {showTyping && (
                <div className="relative flex items-center gap-2.5">
                  <BrandAvatar size="sm" loading />
                  <div className="rounded-2xl rounded-tl-md glass px-3.5 py-2.5 text-sm text-tertiary">
                    composing a reply…
                  </div>
                </div>
              )}
            </div>

            {/* composer */}
            <div className="relative z-10 border-t border-border p-3">
              <AnimatePresence>
                {showChips && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2 flex flex-wrap gap-2 overflow-hidden px-0.5"
                  >
                    {CHIPS.map((c, i) => (
                      <motion.button
                        key={c}
                        type="button"
                        onClick={() => send(c)}
                        initial={reduce ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="glass rounded-full border border-border px-3 py-1.5 text-xs text-secondary transition-colors hover:border-accent hover:text-primary"
                      >
                        {c}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end gap-2 rounded-2xl glass p-1.5 transition-colors focus-within:border-accent focus-within:shadow-[var(--glow-sm)] focus-within:ring-1 focus-within:ring-accent/30">
                <label htmlFor="chat-input" className="sr-only">
                  Message Mihadul&apos;s assistant
                </label>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Write to the studio — your idea, a role, or a question…"
                  className="max-h-28 flex-1 resize-none bg-transparent px-2.5 py-1.5 text-sm text-primary outline-none placeholder:text-tertiary"
                />
                <motion.button
                  type="button"
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  aria-label="Send message (Enter)"
                  whileTap={{ scale: 0.92 }}
                  className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-react-cyan text-brand-foreground transition-all hover:shadow-[var(--glow-md)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </motion.button>
              </div>
              {error && <p role="alert" className="mt-1.5 px-1 text-[11px] text-red-400">{error}</p>}
              <p className="mt-1.5 px-1 text-center text-[10px] text-tertiary">
                AI-assisted · may be imperfect. Anything you share reaches Mihadul directly.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

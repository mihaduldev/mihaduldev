"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, X, Send, Loader2, Sparkles } from "lucide-react";
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

function makeSession() {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID().replace(/-/g, "");
  } catch {
    /* ignore */
  }
  return `s${Math.abs(Date.now()).toString(36)}${Math.floor(performance.now()).toString(36)}xpad`;
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

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setError("");
    setInput("");
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

  return (
    <>
      {/* launcher */}
      <motion.button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open Mihadul's assistant"}
        aria-expanded={open}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 16 }}
        whileHover={{ y: -2 }}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-brand-foreground shadow-[var(--glow-lg)] transition-shadow hover:shadow-[0_0_40px_var(--glow)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-wash" />
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
            className="glass-strong fixed bottom-24 right-3 z-50 flex h-[min(34rem,75vh)] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl glow-ring sm:right-5"
          >
            {/* persistent live region (announces replies / thinking to SRs) */}
            <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
              {loading
                ? "Assistant is thinking…"
                : messages[messages.length - 1]?.role === "assistant"
                  ? messages[messages.length - 1].content
                  : ""}
            </div>

            {/* header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-react-cyan text-brand-foreground">
                <Sparkles className="size-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">Mihadul&apos;s Assistant</p>
                <p className="flex items-center gap-1.5 text-[11px] text-tertiary">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Asks &amp; answers · gathers project details
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-tertiary transition-colors hover:bg-card hover:text-primary"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-sm text-brand-foreground">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-start">
                    <div className="max-w-[88%] break-words rounded-2xl rounded-bl-md glass px-3.5 py-2.5 text-sm leading-relaxed text-secondary [&_a]:break-all">
                      <ChatMarkdown>{m.content}</ChatMarkdown>
                    </div>
                  </div>
                )
              )}
              {loading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md glass px-3.5 py-2.5 text-sm text-tertiary">
                    <Loader2 className="size-3.5 animate-spin" /> thinking…
                  </div>
                </div>
              )}
            </div>

            {/* input */}
            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-border bg-primary/[0.03] p-1.5 focus-within:border-accent">
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
                  placeholder="Ask about Mihadul, or describe your project…"
                  className="max-h-28 flex-1 resize-none bg-transparent px-2.5 py-1.5 text-sm text-primary outline-none placeholder:text-tertiary"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-brand-foreground transition-all hover:shadow-[var(--glow-sm)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </button>
              </div>
              {error && <p role="alert" className="mt-1.5 px-1 text-[11px] text-red-400">{error}</p>}
              <p className="mt-1.5 px-1 text-center text-[10px] text-tertiary">
                AI assistant · may be imperfect. Shared details reach Mihadul.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

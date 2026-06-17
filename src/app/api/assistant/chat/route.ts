import { NextResponse } from "next/server";
import { assistantSystemPrompt } from "@/server/ai/context";
import { streamChat, isConfigured, type ChatMessage } from "@/server/ai/openrouter";
import {
  getOrCreateConversation,
  listConversationMessages,
  lastMessageWithin,
  addMessages,
  rateAllow,
} from "@/server/db/conversations";

export const runtime = "nodejs";

const MAX_LEN = 1500; // per-message character cap
const MAX_MESSAGES = 60; // total messages (≈30 turns) per conversation
const SESSION_RE = /^[A-Za-z0-9_-]{8,64}$/;
// Abuse controls that do NOT trust the client-chosen sessionId.
const PER_IP_PER_MIN = 12; // requests per IP per minute
const GLOBAL_PER_DAY = 500; // hard ceiling on upstream model calls per day

function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function POST(req: Request) {
  let body: { sessionId?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!SESSION_RE.test(sessionId)) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }
  if (!message) return NextResponse.json({ error: "Message is empty." }, { status: 400 });
  if (message.length > MAX_LEN) {
    return NextResponse.json({ error: "That message is too long." }, { status: 400 });
  }
  if (!(await isConfigured())) {
    return NextResponse.json(
      { error: "The assistant isn't configured yet. Please email Mihadul directly." },
      { status: 503 }
    );
  }

  // Abuse controls keyed on the request IP + a global daily ceiling — these are
  // independent of the client-chosen sessionId, so rotating it can't bypass them.
  const day = Math.floor(Date.now() / 86_400_000);
  if (!(await rateAllow(`g:${day}`, GLOBAL_PER_DAY, 86_400))) {
    return NextResponse.json(
      { error: "The assistant is taking a break for today — please email Mihadul directly." },
      { status: 503 }
    );
  }
  if (!(await rateAllow(`ip:${clientIp(req)}`, PER_IP_PER_MIN, 60))) {
    return NextResponse.json(
      { error: "You're sending messages quickly — please wait a minute and try again." },
      { status: 429 }
    );
  }

  const convo = await getOrCreateConversation(sessionId);
  if (!convo) {
    return NextResponse.json({ error: "The assistant is unavailable right now." }, { status: 503 });
  }

  if (await lastMessageWithin(convo.id, 2)) {
    return NextResponse.json({ error: "One moment — give me a second to reply." }, { status: 429 });
  }
  if (convo.messageCount >= MAX_MESSAGES) {
    return NextResponse.json(
      { error: "We've chatted a lot! Please email Mihadul directly to continue.", capped: true },
      { status: 429 }
    );
  }

  const prior = await listConversationMessages(convo.id, 30);
  const messages: ChatMessage[] = [
    { role: "system", content: assistantSystemPrompt() },
    ...prior.map<ChatMessage>((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  let tokens: ReadableStream<string>;
  try {
    tokens = await streamChat(messages, { temperature: 0.5, maxTokens: 700 });
  } catch {
    return NextResponse.json(
      { error: "The assistant couldn't respond just now. Please try again, or email Mihadul." },
      { status: 502 }
    );
  }

  // Stream token deltas straight to the client while accumulating the full reply,
  // then persist the user+assistant pair once the stream completes.
  const encoder = new TextEncoder();
  const conversationId = convo.id;
  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = tokens.getReader();
      let full = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          full += value;
          controller.enqueue(encoder.encode(value));
        }
      } catch {
        /* upstream error mid-stream — persist whatever arrived */
      } finally {
        const reply = full.trim();
        if (reply) {
          try {
            await addMessages(conversationId, [
              { role: "user", content: message },
              { role: "assistant", content: reply },
            ]);
          } catch {
            /* ignore persistence failure */
          }
        }
        controller.close();
      }
    },
  });

  return new Response(out, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

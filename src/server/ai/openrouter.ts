import { getEnv } from "@/server/db/client";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// 20B is the primary: it streams content fast. The 120B reasoning model can
// stall for many seconds on the free tier before emitting any content, which
// reads as a hang in a streaming chat — so it's only a last-resort fallback.
const DEFAULT_MODEL = "openai/gpt-oss-20b:free";
const FALLBACK_MODELS = [
  "openai/gpt-oss-20b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "openai/gpt-oss-120b:free",
];
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

class HttpError extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

/** Reads the OpenRouter key/model from the CF env (or process.env in dev). */
async function creds() {
  const env = await getEnv();
  const apiKey = env?.OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY ?? "";
  const model = env?.OPENROUTER_MODEL ?? process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
  return { apiKey, model };
}

export async function isConfigured(): Promise<boolean> {
  return Boolean((await creds()).apiKey);
}

async function callModel(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // OpenRouter attribution headers (recommended)
        "HTTP-Referer": "https://mihad.site",
        "X-Title": "Mihadul Islam Portfolio Assistant",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts?.temperature ?? 0.5,
        max_tokens: opts?.maxTokens ?? 700,
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new HttpError(res.status, `OpenRouter ${res.status} (${model}): ${txt.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return (data.choices?.[0]?.message?.content ?? "").trim();
  } finally {
    clearTimeout(timer);
  }
}

/** One non-streaming chat completion, falling through free-model alternatives
 *  when the primary is rate-limited/unavailable. Throws if all attempts fail. */
export async function chatComplete(
  messages: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const { apiKey, model } = await creds();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const chain = [model, ...FALLBACK_MODELS].filter((m, i, a) => a.indexOf(m) === i);
  let lastErr: unknown;
  for (const m of chain) {
    try {
      const out = await callModel(apiKey, m, messages, opts);
      if (out) return out;
      lastErr = new Error(`empty response from ${m}`);
    } catch (e) {
      lastErr = e;
      // Only fall through on transient errors. A 400/401/403 is a hard failure
      // (bad request / auth) that every model would reject — stop immediately.
      if (e instanceof HttpError && (e.status === 400 || e.status === 401 || e.status === 403)) {
        break;
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("OpenRouter request failed");
}

function headers(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://mihad.site",
    "X-Title": "Mihadul Islam Portfolio Assistant",
  };
}

/** Streaming chat: returns a stream of text token deltas (parsed from the
 *  OpenRouter SSE), trying the fallback chain until a model accepts the request. */
export async function streamChat(
  messages: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<string>> {
  const { apiKey, model } = await creds();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const chain = [model, ...FALLBACK_MODELS].filter((m, i, a) => a.indexOf(m) === i);
  let res: Response | null = null;
  let lastErr: unknown;
  for (const m of chain) {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify({
        model: m,
        messages,
        temperature: opts?.temperature ?? 0.5,
        max_tokens: opts?.maxTokens ?? 700,
        stream: true,
      }),
    });
    if (r.ok && r.body) {
      res = r;
      break;
    }
    const txt = await r.text().catch(() => "");
    lastErr = new HttpError(r.status, `OpenRouter ${r.status} (${m}): ${txt.slice(0, 200)}`);
    if (r.status === 400 || r.status === 401 || r.status === 403) break;
  }
  if (!res || !res.body) {
    throw lastErr instanceof Error ? lastErr : new Error("OpenRouter stream failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream<string>({
    async pull(controller) {
      const { done, value } = await reader.read();
      console.error("[sc] read done=", done, "bytes=", value ? value.byteLength : 0);
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith("data:")) continue; // skip SSE comments/keepalives
        const data = line.slice(5).trim();
        if (data === "[DONE]") {
          controller.close();
          return;
        }
        try {
          const json = JSON.parse(data) as {
            choices?: { delta?: { content?: string } }[];
          };
          const delta = json.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta) controller.enqueue(delta);
        } catch {
          /* ignore partial/non-JSON keepalive frames */
        }
      }
    },
    cancel(reason) {
      reader.cancel(reason).catch(() => {});
    },
  });
}

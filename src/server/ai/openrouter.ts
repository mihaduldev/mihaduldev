import { getEnv } from "@/server/db/client";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** OpenRouter reasoning controls. For gpt-oss reasoning models, lowering the
 *  effort frees the token budget for the actual answer (high effort can consume
 *  the whole max_tokens on hidden reasoning and return empty content). */
export type ReasoningOpts = { effort?: "low" | "medium" | "high"; exclude?: boolean };

export type ChatOpts = {
  temperature?: number;
  maxTokens?: number;
  reasoning?: ReasoningOpts;
  /** Per-request abort timeout. Long generations (e.g. full article drafts) need
   *  more than the chat default — a 1000-word draft can take 20-30s on free models. */
  timeoutMs?: number;
};

// 20B is fast and reliable for chat + extraction. The 120B reasoning model can
// stall for many seconds before producing content, so it's a last-resort fallback.
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
  opts?: ChatOpts
): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts?.timeoutMs ?? 25000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // OpenRouter attribution headers (recommended; must be Latin-1)
        "HTTP-Referer": "https://mihad.site",
        "X-Title": "Mihadul Islam Portfolio Assistant",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts?.temperature ?? 0.5,
        max_tokens: opts?.maxTokens ?? 700,
        ...(opts?.reasoning ? { reasoning: opts.reasoning } : {}),
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

/** One chat completion, falling through free-model alternatives when the primary
 *  is rate-limited/unavailable. Throws if all attempts fail. */
export async function chatComplete(
  messages: ChatMessage[],
  opts?: ChatOpts
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
      // 400/401/403 are hard failures every model would reject — stop immediately.
      if (e instanceof HttpError && (e.status === 400 || e.status === 401 || e.status === 403)) {
        break;
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("OpenRouter request failed");
}

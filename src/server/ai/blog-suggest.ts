import { chatComplete } from "./openrouter";

export type PostSuggestion = {
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  readingTime: string;
  body?: string; // present in "draft" mode only
};

export type SuggestInput = { mode: "draft" | "meta"; topic?: string; body?: string };
export type SuggestResult = { ok: boolean; error?: string; suggestion?: PostSuggestion };

const BODY_MARKER = "---BODY---";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function estimateReadingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/** Pulls a JSON object out of a model response. Strips an outer code fence only
 *  if it wraps the WHOLE string (so inner ```lang code fences are left alone),
 *  then parses the first `{`…last `}`. */
function extractJsonObject(raw: string): Record<string, unknown> | null {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  }
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a === -1 || b === -1 || b < a) return null;
  try {
    return JSON.parse(s.slice(a, b + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function buildSuggestion(o: Record<string, unknown>, body?: string): PostSuggestion | null {
  const title = typeof o.title === "string" ? o.title.trim() : "";
  if (!title) return null;
  const out: PostSuggestion = {
    title,
    slug: typeof o.slug === "string" && o.slug.trim() ? slugify(o.slug) : slugify(title),
    excerpt: typeof o.excerpt === "string" ? o.excerpt.trim() : "",
    tags: Array.isArray(o.tags)
      ? o.tags.filter((t): t is string => typeof t === "string").slice(0, 8)
      : [],
    readingTime:
      typeof o.readingTime === "string" && o.readingTime.trim()
        ? o.readingTime.trim()
        : body
          ? estimateReadingTime(body)
          : "5 min read",
  };
  if (typeof body === "string") out.body = body;
  return out;
}

/** "meta" → JSON-only metadata from a body. "draft" → metadata JSON + a
 *  ---BODY--- delimiter + the raw Markdown article (kept OUT of the JSON, since
 *  embedding a long code-heavy article inside a JSON string parses unreliably). */
function parseDraft(raw: string): PostSuggestion | null {
  const at = raw.indexOf(BODY_MARKER);
  if (at !== -1) {
    const meta = extractJsonObject(raw.slice(0, at));
    const body = raw.slice(at + BODY_MARKER.length).replace(/^\s*\n/, "").trim();
    if (meta && body) return buildSuggestion(meta, body);
  }
  // Fallback: the model ignored the delimiter and returned a single JSON object.
  const o = extractJsonObject(raw);
  if (o) return buildSuggestion(o, typeof o.body === "string" ? o.body : "");
  return null;
}

export async function suggestPostFields(input: SuggestInput): Promise<SuggestResult> {
  const mode = input.mode === "draft" ? "draft" : "meta";
  const topic = (input.topic ?? "").slice(0, 600);
  const body = (input.body ?? "").slice(0, 12000);
  if (mode === "draft" && !topic.trim()) return { ok: false, error: "Enter a topic first." };
  if (mode === "meta" && body.trim().length < 30) {
    return { ok: false, error: "Write some body content first, then suggest metadata." };
  }

  const metaShape =
    '{"title":string,"slug":string,"excerpt":string,"tags":string[],"readingTime":string}';

  const system =
    mode === "draft"
      ? `You write a professional engineering blog for Mihadul Islam, a Full-Stack .NET / cloud / AI engineer. Respond in EXACTLY this format, with nothing before or after:
1) One line of minified JSON metadata: ${metaShape}
2) A line containing only: ${BODY_MARKER}
3) The full article as raw Markdown.
Rules:
- title: specific and compelling, under 70 characters.
- slug: lowercase, hyphen-separated, from the title (a-z, 0-9, hyphens only).
- excerpt: a 1-2 sentence summary under 160 characters.
- tags: 3-6 relevant technical tags (e.g. ".NET", "ASP.NET Core", "System Design").
- readingTime: like "6 min read", estimated from the article length.
- The article: practical senior-engineer voice; use ## headings, lists, and \`\`\`lang fenced code blocks where useful; roughly 500-800 words. Do NOT wrap the article in JSON or in code fences — output it as plain Markdown after the ${BODY_MARKER} line.`
      : `You help write a professional engineering blog for Mihadul Islam, a Full-Stack .NET / cloud / AI engineer. Output ONLY minified JSON — no markdown, no code fences, no prose — with EXACTLY this shape:
${metaShape}
Rules:
- title: specific and compelling, under 70 characters.
- slug: lowercase, hyphen-separated, derived from the title (a-z, 0-9, hyphens only).
- excerpt: a 1-2 sentence summary under 160 characters.
- tags: 3-6 relevant technical tags (e.g. ".NET", "ASP.NET Core", "System Design").
- readingTime: like "6 min read".
- Derive everything from the given body. Do NOT rewrite or return the body.`;

  const user =
    mode === "draft"
      ? `TOPIC: ${topic}\n\nWrite the post in the required format.`
      : `BODY:\n${body}\n\nReturn only the JSON metadata for this post.`;

  let raw = "";
  try {
    // gpt-oss is a reasoning model: keep its effort low (this is formatting, not
    // hard reasoning) and budget enough tokens for reasoning + the answer.
    raw = await chatComplete(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      {
        temperature: 0.6,
        maxTokens: mode === "draft" ? 4000 : 1200,
        reasoning: { effort: "low" },
        // Free-model latency is highly variable (a draft can take 20-90s when the
        // tier is congested); give it generous headroom so a slow-but-working call
        // isn't aborted into the rate-limited fallbacks.
        timeoutMs: mode === "draft" ? 90000 : 25000,
      }
    );
  } catch {
    return { ok: false, error: "The AI is unavailable right now — please try again." };
  }

  const suggestion = mode === "draft" ? parseDraft(raw) : (() => {
    const o = extractJsonObject(raw);
    return o ? buildSuggestion(o) : null;
  })();
  if (!suggestion) return { ok: false, error: "Couldn't read the AI response — please try again." };
  return { ok: true, suggestion };
}

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

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parse(raw: string, mode: "draft" | "meta"): PostSuggestion | null {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a === -1 || b === -1) return null;
  try {
    const o = JSON.parse(s.slice(a, b + 1)) as Record<string, unknown>;
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
          : "5 min read",
    };
    if (mode === "draft") out.body = typeof o.body === "string" ? o.body : "";
    return out;
  } catch {
    return null;
  }
}

/** Suggests blog-post fields: a full draft from a topic, or metadata from a body. */
export async function suggestPostFields(input: SuggestInput): Promise<SuggestResult> {
  const mode = input.mode === "draft" ? "draft" : "meta";
  const topic = (input.topic ?? "").slice(0, 600);
  const body = (input.body ?? "").slice(0, 12000);
  if (mode === "draft" && !topic.trim()) return { ok: false, error: "Enter a topic first." };
  if (mode === "meta" && body.trim().length < 30) {
    return { ok: false, error: "Write some body content first, then suggest metadata." };
  }

  const shape = `{"title":string,"slug":string,"excerpt":string,"tags":string[],"readingTime":string${
    mode === "draft" ? ',"body":string' : ""
  }}`;

  const system = `You help write a professional engineering blog for Mihadul Islam, a Full-Stack .NET / cloud / AI engineer. Output ONLY minified JSON — no markdown, no code fences, no prose — with EXACTLY this shape:
${shape}
Rules:
- title: specific and compelling, under 70 characters.
- slug: lowercase, hyphen-separated, derived from the title (a-z, 0-9, hyphens only).
- excerpt: a 1–2 sentence summary under 160 characters.
- tags: 3–6 relevant technical tags (e.g. ".NET", "ASP.NET Core", "System Design").
- readingTime: like "6 min read".
${
  mode === "draft"
    ? '- body: a COMPLETE, well-structured Markdown article on the topic — use ## headings, lists, and fenced code blocks where useful; practical senior-engineer voice; roughly 600–1000 words. Estimate readingTime from the body length.'
    : "- Derive everything from the given body. Do NOT rewrite or return the body."
}`;

  const user =
    mode === "draft"
      ? `TOPIC: ${topic}\n\nWrite the post and return only the JSON.`
      : `BODY:\n${body}\n\nReturn only the JSON metadata for this post.`;

  let raw = "";
  try {
    // gpt-oss is a reasoning model: keep its effort low (this is formatting, not
    // hard reasoning) and budget enough tokens for reasoning + the JSON answer,
    // otherwise hidden reasoning can consume max_tokens and return empty content.
    raw = await chatComplete(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      {
        temperature: 0.6,
        maxTokens: mode === "draft" ? 4000 : 1200,
        reasoning: { effort: "low" },
        // A full draft routinely takes 20-30s on free models; give it headroom
        // so it doesn't abort and fall through to rate-limited fallbacks.
        timeoutMs: mode === "draft" ? 55000 : 25000,
      }
    );
  } catch {
    return { ok: false, error: "The AI is unavailable right now — please try again." };
  }

  const suggestion = parse(raw, mode);
  if (!suggestion) return { ok: false, error: "Couldn't read the AI response — please try again." };
  return { ok: true, suggestion };
}

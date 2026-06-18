import { query, requireDB, parseJson } from "./client";

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  bodyMd: string;
  tags: string[];
  cover: string;
  readingTime: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
};

// updated_at is DB-managed (unixepoch() on write), so it isn't part of the input.
export type PostInput = Omit<Post, "id" | "updatedAt">;

// Used only when D1 is unavailable (plain build / sandbox); production reads D1.
const FALLBACK_POSTS: Post[] = [
  {
    id: 1,
    slug: "clean-architecture-dotnet",
    title: "Clean Architecture in .NET, Without the Dogma",
    excerpt:
      "A practical take on layering ASP.NET Core apps so they stay understandable and easy to change — and when the rules are worth bending.",
    bodyMd:
      "## The one rule that matters\n\nClean Architecture gets a bad reputation because people treat it as a checklist instead of a tool. The real point is **dependency direction**: your business rules should not know or care about the database, the web framework, or the message broker.\n\n- **Domain** — entities, value objects, and rules true regardless of storage.\n- **Application** — use cases that orchestrate the domain; they define interfaces but never implement them.\n- **Infrastructure** — EF Core, HTTP clients, storage; where interfaces get implemented.\n\n> If you can delete your Infrastructure project and your business logic still compiles, you have the direction right.\n\n## When to bend the rules\n\nStart simple and add layers when a real seam appears — the best architecture is the one your team can still understand at 4pm on a Friday.",
    tags: [".NET", "Architecture", "ASP.NET Core"],
    cover: "from-[#087EA4] to-[#58C4DC]",
    readingTime: "8 min read",
    published: true,
    publishedAt: "2026-05-28",
    updatedAt: null,
  },
  {
    id: 2,
    slug: "ship-dotnet-with-docker-ci",
    title: "Shipping a .NET API with Docker and CI/CD",
    excerpt:
      "From Dockerfile to GitHub Actions: a repeatable, automated path to production that you can trust on a Friday afternoon.",
    bodyMd:
      "## Boring releases are the goal\n\nThe point of a deployment pipeline is boring releases: no manual steps, no surprises.\n\nUse a multi-stage Dockerfile so the final image ships only the runtime, not the SDK. A GitHub Actions workflow then builds, **tests**, and pushes an image on every push — if tests fail, nothing ships.\n\n## Safe deploys\n\nTag images with the commit SHA so every deploy is traceable and rollback-able. Run migrations as an explicit, separate step — never silently on startup in production.",
    tags: ["Docker", "DevOps", "AWS"],
    cover: "from-[#512BD4] to-[#087EA4]",
    readingTime: "10 min read",
    published: true,
    publishedAt: "2026-04-15",
    updatedAt: null,
  },
  {
    id: 3,
    slug: "practical-llm-workflows",
    title: "Practical LLM Workflows for Real Products",
    excerpt:
      "How to move past chatbot demos and build retrieval-based AI features that are reliable enough to put in front of real users.",
    bodyMd:
      "## Retrieval beats memorization\n\nMost LLM demos are impressive and useless. Do not ask a model to recall your business data; retrieve the relevant facts and put them in the prompt.\n\n## Treat the LLM as an unreliable function\n\nValidate the output, constrain the task to something narrow, and keep a human in the loop for anything irreversible. Build a small evaluation set and run it on every prompt change.",
    tags: ["AI", "LLMs", "Automation"],
    cover: "from-[#58C4DC] to-[#61DAFB]",
    readingTime: "7 min read",
    published: true,
    publishedAt: "2026-03-02",
    updatedAt: null,
  },
];

function toPost(r: Record<string, unknown>): Post {
  return {
    id: Number(r.id),
    slug: String(r.slug),
    title: String(r.title),
    excerpt: String(r.excerpt),
    bodyMd: String(r.body_md),
    tags: parseJson<string[]>(r.tags_json, []),
    cover: String(r.cover),
    readingTime: String(r.reading_time),
    published: Number(r.published) === 1,
    publishedAt: (r.published_at as string | null) ?? null,
    // updated_at is a unix-epoch INTEGER (seconds) → ISO for dateModified / sitemap lastmod
    updatedAt:
      r.updated_at != null ? new Date(Number(r.updated_at) * 1000).toISOString() : null,
  };
}

export async function listPublishedPosts(): Promise<Post[]> {
  return query(async (db) => {
    const { results } = await db
      .prepare("SELECT * FROM posts WHERE published = 1 ORDER BY published_at DESC, id DESC")
      .all();
    return results.map(toPost);
  }, FALLBACK_POSTS.filter((p) => p.published));
}

export async function listAllPosts(): Promise<Post[]> {
  return query(async (db) => {
    const { results } = await db
      .prepare("SELECT * FROM posts ORDER BY COALESCE(published_at, '') DESC, id DESC")
      .all();
    return results.map(toPost);
  }, FALLBACK_POSTS);
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  return query(async (db) => {
    const row = await db
      .prepare("SELECT * FROM posts WHERE slug = ? AND published = 1")
      .bind(slug)
      .first();
    return row ? toPost(row) : null;
  }, FALLBACK_POSTS.find((p) => p.slug === slug && p.published) ?? null);
}

export async function getPost(id: number): Promise<Post | null> {
  return query(async (db) => {
    const row = await db.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
    return row ? toPost(row) : null;
  }, FALLBACK_POSTS.find((p) => p.id === id) ?? null);
}

export async function createPost(input: PostInput): Promise<void> {
  const db = await requireDB();
  await db
    .prepare(
      "INSERT INTO posts (slug, title, excerpt, body_md, tags_json, cover, reading_time, published, published_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())"
    )
    .bind(
      input.slug,
      input.title,
      input.excerpt,
      input.bodyMd,
      JSON.stringify(input.tags),
      input.cover,
      input.readingTime,
      input.published ? 1 : 0,
      input.publishedAt
    )
    .run();
}

export async function updatePost(id: number, input: PostInput): Promise<void> {
  const db = await requireDB();
  await db
    .prepare(
      "UPDATE posts SET slug=?, title=?, excerpt=?, body_md=?, tags_json=?, cover=?, reading_time=?, published=?, published_at=?, updated_at=unixepoch() WHERE id=?"
    )
    .bind(
      input.slug,
      input.title,
      input.excerpt,
      input.bodyMd,
      JSON.stringify(input.tags),
      input.cover,
      input.readingTime,
      input.published ? 1 : 0,
      input.publishedAt,
      id
    )
    .run();
}

export async function deletePost(id: number): Promise<void> {
  const db = await requireDB();
  await db.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
}

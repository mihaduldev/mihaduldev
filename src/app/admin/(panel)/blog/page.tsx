import Link from "next/link";
import { listAllPosts } from "@/server/db/posts";
import { savePost, removePost } from "@/app/admin/actions";
import { PageHeader, AdminCard, Field, field, SubmitButton } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";

export const dynamic = "force-dynamic";

const COVERS = [
  "from-[#087EA4] to-[#58C4DC]",
  "from-[#512BD4] to-[#087EA4]",
  "from-[#58C4DC] to-[#61DAFB]",
  "from-[#0052CC] to-[#3178C6]",
];

export default async function BlogAdmin({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const sp = await searchParams;
  const editId = sp.edit ? Number(sp.edit) : 0;
  const posts = await listAllPosts();
  const editing = editId ? posts.find((p) => p.id === editId) ?? null : null;

  return (
    <div>
      <PageHeader title="Blog" subtitle="Write and publish posts (Markdown). Drafts stay hidden until published." />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <AdminCard className="self-start">
          <h2 className="font-semibold text-primary">{editing ? "Edit post" : "New post"}</h2>
          <form action={savePost} className="mt-4 space-y-4">
            {editing && <input type="hidden" name="id" defaultValue={editing.id} />}
            <Field label="Title">
              <input name="title" required defaultValue={editing?.title} className={field} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug" hint="url path; auto-cleaned">
                <input name="slug" required defaultValue={editing?.slug} className={field} placeholder="my-post" />
              </Field>
              <Field label="Reading time">
                <input name="readingTime" defaultValue={editing?.readingTime ?? "5 min read"} className={field} />
              </Field>
            </div>
            <Field label="Excerpt">
              <textarea name="excerpt" rows={2} defaultValue={editing?.excerpt} className={field} />
            </Field>
            <Field label="Tags" hint="comma separated">
              <input name="tags" defaultValue={editing?.tags.join(", ")} className={field} placeholder=".NET, Architecture" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cover gradient">
                <select name="cover" defaultValue={editing?.cover ?? COVERS[0]} className={field}>
                  {COVERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Publish date">
                <input
                  name="publishedAt"
                  type="date"
                  defaultValue={editing?.publishedAt ?? new Date().toISOString().slice(0, 10)}
                  className={field}
                />
              </Field>
            </div>
            <Field label="Body (Markdown)">
              <textarea name="bodyMd" rows={14} defaultValue={editing?.bodyMd} className={`${field} font-mono text-xs`} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input type="checkbox" name="published" defaultChecked={editing ? editing.published : true} className="size-4 accent-[var(--accent)]" />
              Published (visible on the public blog)
            </label>
            <div className="flex items-center gap-3 pt-1">
              <SubmitButton>{editing ? "Save changes" : "Create post"}</SubmitButton>
              {editing && (
                <Link href="/admin/blog" className="text-sm text-tertiary hover:text-primary">
                  Cancel
                </Link>
              )}
            </div>
          </form>
        </AdminCard>

        <div className="space-y-3">
          {posts.map((p) => (
            <AdminCard key={p.id} className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-primary">{p.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      p.published ? "bg-green-500/15 text-green-400" : "bg-white/10 text-tertiary"
                    }`}
                  >
                    {p.published ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-tertiary">
                  /{p.slug} · {p.publishedAt} · {p.readingTime}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-tertiary">{p.excerpt}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Link
                  href={`/admin/blog?edit=${p.id}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-center text-xs font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
                >
                  Edit
                </Link>
                <form action={removePost}>
                  <input type="hidden" name="id" defaultValue={p.id} />
                  <ConfirmButton>Delete</ConfirmButton>
                </form>
              </div>
            </AdminCard>
          ))}
        </div>
      </div>
    </div>
  );
}

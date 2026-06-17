import Link from "next/link";
import { listProjects } from "@/server/db/projects";
import { saveProject, removeProject } from "@/app/admin/actions";
import { PageHeader, AdminCard, Field, field } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import { TagInput } from "@/components/admin/tag-input";
import { ConfirmButton } from "@/components/admin/confirm-button";

export const dynamic = "force-dynamic";

export default async function ProjectsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const sp = await searchParams;
  const editId = sp.edit ? Number(sp.edit) : 0;
  const items = await listProjects();
  const editing = editId ? items.find((i) => i.id === editId) ?? null : null;

  return (
    <div>
      <PageHeader title="Projects" subtitle="The Selected Work cards on the public site." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <AdminCard className="self-start">
          <h2 className="font-semibold text-primary">{editing ? "Edit project" : "Add project"}</h2>
          <form key={editing?.id ?? "new"} action={saveProject} className="mt-4 space-y-4">
            {editing && <input type="hidden" name="id" defaultValue={editing.id} />}
            <Field label="Title">
              <input name="title" required defaultValue={editing?.title} className={field} />
            </Field>
            <Field label="Description">
              <textarea name="description" required rows={3} defaultValue={editing?.description} className={field} />
            </Field>
            <Field label="Focus tags" hint="comma separated">
              <TagInput name="focus" defaultValue={editing?.focus ?? []} placeholder="C#, Architecture, System Design" />
            </Field>
            <Field label="Repository URL">
              <input name="repo" type="url" defaultValue={editing?.repo} className={field} placeholder="https://github.com/…" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Accent color" hint="hex">
                <input name="accent" defaultValue={editing?.accent ?? "#087EA4"} className={field} />
              </Field>
              <Field label="Sort order">
                <input name="sort" type="number" defaultValue={editing?.sort ?? items.length + 1} className={field} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input type="checkbox" name="featured" defaultChecked={editing?.featured} className="size-4 accent-[var(--accent)]" />
              Featured
            </label>
            <div className="flex items-center gap-3 pt-1">
              <SubmitButton>{editing ? "Update project" : "Add project"}</SubmitButton>
              {editing && (
                <Link href="/admin/projects" className="text-sm text-tertiary hover:text-primary">
                  Cancel
                </Link>
              )}
            </div>
          </form>
        </AdminCard>

        <div className="space-y-3">
          {items.map((it) => (
            <AdminCard key={it.id} className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded" style={{ backgroundColor: it.accent }} />
                  <h3 className="font-semibold text-primary">{it.title}</h3>
                  {it.featured && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent">
                      Featured
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-tertiary">{it.description}</p>
                <p className="mt-1 text-xs text-tertiary">{it.focus.join(" · ")}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Link
                  href={`/admin/projects?edit=${it.id}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-center text-xs font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
                >
                  Edit
                </Link>
                <form action={removeProject}>
                  <input type="hidden" name="id" defaultValue={it.id} />
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

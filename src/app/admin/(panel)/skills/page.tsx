import Link from "next/link";
import { listSkillGroups } from "@/server/db/skills";
import { saveSkillGroup, removeSkillGroup } from "@/app/admin/actions";
import { PageHeader, AdminCard, Field, field } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import { SkillsEditor } from "@/components/admin/skills-editor";
import { ConfirmButton } from "@/components/admin/confirm-button";

export const dynamic = "force-dynamic";

export default async function SkillsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const sp = await searchParams;
  const editId = sp.edit ? Number(sp.edit) : 0;
  const groups = await listSkillGroups();
  const editing = editId ? groups.find((g) => g.id === editId) ?? null : null;

  return (
    <div>
      <PageHeader title="Skills / Tech Stack" subtitle="Grouped tech categories shown on the public site." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <AdminCard className="self-start">
          <h2 className="font-semibold text-primary">{editing ? "Edit group" : "Add group"}</h2>
          <form key={editing?.id ?? "new"} action={saveSkillGroup} className="mt-4 space-y-4">
            {editing && <input type="hidden" name="id" defaultValue={editing.id} />}
            <Field label="Category">
              <input name="category" required defaultValue={editing?.category} className={field} placeholder="Backend & Architecture" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Icon" hint="lucide: Server, Layout, Database, Sparkles">
                <input name="icon" defaultValue={editing?.icon ?? "Server"} className={field} />
              </Field>
              <Field label="Sort order">
                <input name="sort" type="number" defaultValue={editing?.sort ?? groups.length + 1} className={field} />
              </Field>
            </div>
            <Field label="Description">
              <textarea name="description" rows={2} defaultValue={editing?.description} className={field} />
            </Field>
            <Field label="Skills" hint="Add each tech with its colour, a short purpose, and optionally mark it Core / add a logo.">
              <SkillsEditor defaultValue={editing?.skills ?? []} />
            </Field>
            <div className="flex items-center gap-3 pt-1">
              <SubmitButton>{editing ? "Update group" : "Add group"}</SubmitButton>
              {editing && (
                <Link href="/admin/skills" className="text-sm text-tertiary hover:text-primary">
                  Cancel
                </Link>
              )}
            </div>
          </form>
        </AdminCard>

        <div className="space-y-3">
          {groups.map((g) => (
            <AdminCard key={g.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-primary">{g.category}</h3>
                  <p className="mt-1 text-sm text-tertiary">{g.description}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Link
                    href={`/admin/skills?edit=${g.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-center text-xs font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
                  >
                    Edit
                  </Link>
                  <form action={removeSkillGroup}>
                    <input type="hidden" name="id" defaultValue={g.id} />
                    <ConfirmButton>Delete</ConfirmButton>
                  </form>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {g.skills.map((s) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.03] px-2.5 py-1 text-xs text-secondary"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                    {s.core && <span className="text-[9px] font-semibold uppercase text-accent">core</span>}
                  </span>
                ))}
              </div>
            </AdminCard>
          ))}
        </div>
      </div>
    </div>
  );
}

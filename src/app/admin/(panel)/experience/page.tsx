import Link from "next/link";
import { listExperiences } from "@/server/db/experiences";
import { saveExperience, removeExperience } from "@/app/admin/actions";
import { PageHeader, AdminCard, Field, field, SubmitButton } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";

export const dynamic = "force-dynamic";

export default async function ExperienceAdmin({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const sp = await searchParams;
  const editId = sp.edit ? Number(sp.edit) : 0;
  const items = await listExperiences();
  const editing = editId ? items.find((i) => i.id === editId) ?? null : null;

  return (
    <div>
      <PageHeader
        title="Focus Areas / Experience"
        subtitle="The 'Where my work lives' timeline on the public site."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <AdminCard className="self-start">
          <h2 className="font-semibold text-primary">{editing ? "Edit entry" : "Add entry"}</h2>
          <form action={saveExperience} className="mt-4 space-y-4">
            {editing && <input type="hidden" name="id" defaultValue={editing.id} />}
            <Field label="Period">
              <input name="period" required defaultValue={editing?.period} className={field} placeholder="Now / Ongoing / Continuous" />
            </Field>
            <Field label="Title">
              <input name="title" required defaultValue={editing?.title} className={field} placeholder="Backend & Cloud Engineering" />
            </Field>
            <Field label="Organisation / context">
              <input name="org" required defaultValue={editing?.org} className={field} placeholder="Enterprise Product Work" />
            </Field>
            <Field label="Description">
              <textarea name="description" required rows={3} defaultValue={editing?.description} className={field} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Icon" hint="lucide name: Server, Cloud, Sparkles, GraduationCap…">
                <input name="icon" defaultValue={editing?.icon ?? "Server"} className={field} />
              </Field>
              <Field label="Sort order">
                <input name="sort" type="number" defaultValue={editing?.sort ?? items.length + 1} className={field} />
              </Field>
            </div>
            <Field label="Tags" hint="comma separated">
              <input name="tags" defaultValue={editing?.tags.join(", ")} className={field} placeholder="ASP.NET Core, Clean Architecture" />
            </Field>
            <div className="flex items-center gap-3 pt-1">
              <SubmitButton>{editing ? "Update entry" : "Add entry"}</SubmitButton>
              {editing && (
                <Link href="/admin/experience" className="text-sm text-tertiary hover:text-primary">
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
                <span className="rounded-full bg-highlight px-2.5 py-0.5 text-xs font-semibold text-accent">
                  {it.period}
                </span>
                <h3 className="mt-2 font-semibold text-primary">{it.title}</h3>
                <p className="text-sm text-accent">{it.org}</p>
                <p className="mt-1 line-clamp-2 text-sm text-tertiary">{it.description}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Link
                  href={`/admin/experience?edit=${it.id}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-center text-xs font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
                >
                  Edit
                </Link>
                <form action={removeExperience}>
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

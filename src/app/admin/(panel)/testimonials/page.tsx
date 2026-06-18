import Link from "next/link";
import { Quote } from "lucide-react";
import { listAllTestimonials } from "@/server/db/testimonials";
import { saveTestimonial, removeTestimonial } from "@/app/admin/actions";
import { PageHeader, AdminCard, Field, field } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import { ConfirmButton } from "@/components/admin/confirm-button";

export const dynamic = "force-dynamic";

export default async function TestimonialsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const sp = await searchParams;
  const editId = sp.edit ? Number(sp.edit) : 0;
  const items = await listAllTestimonials();
  const editing = editId ? items.find((t) => t.id === editId) ?? null : null;

  return (
    <div>
      <PageHeader
        title="Testimonials"
        subtitle="Collaborator quotes shown in the home “Words from collaborators” section."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
        <AdminCard className="self-start">
          <h2 className="font-semibold text-primary">
            {editing ? "Edit testimonial" : "New testimonial"}
          </h2>
          <form key={editing?.id ?? "new"} action={saveTestimonial} className="mt-4 space-y-4">
            {editing && <input type="hidden" name="id" defaultValue={editing.id} />}
            <Field label="Quote">
              <textarea
                name="quote"
                rows={4}
                required
                defaultValue={editing?.quote}
                className={field}
                placeholder="What did they say?"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name">
                <input name="name" required defaultValue={editing?.name} className={field} />
              </Field>
              <Field label="Title / role" hint="e.g. CTO · Acme">
                <input name="title" defaultValue={editing?.title} className={field} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Initials" hint="blank = auto from name">
                <input name="initials" maxLength={3} defaultValue={editing?.initials} className={field} />
              </Field>
              <Field label="Order" hint="lower = first">
                <input
                  name="sort"
                  type="number"
                  defaultValue={editing?.sort ?? items.length + 1}
                  className={field}
                />
              </Field>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <SubmitButton>{editing ? "Save changes" : "Add testimonial"}</SubmitButton>
              {editing && (
                <Link href="/admin/testimonials" className="text-sm text-tertiary hover:text-primary">
                  Cancel
                </Link>
              )}
            </div>
          </form>
        </AdminCard>

        <div className="space-y-3">
          {items.length === 0 ? (
            <AdminCard className="text-center">
              <Quote className="mx-auto size-6 text-tertiary" />
              <p className="mt-3 text-sm text-tertiary">
                No testimonials yet. Add collaborator quotes here.
              </p>
            </AdminCard>
          ) : (
            items.map((t) => (
              <AdminCard key={t.id} className="p-5">
                <p className="line-clamp-3 text-sm leading-relaxed text-secondary">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-react-cyan text-[11px] font-bold text-brand-foreground">
                      {t.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-primary">{t.name}</p>
                      <p className="truncate text-xs text-tertiary">{t.title}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/admin/testimonials?edit=${t.id}`}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
                    >
                      Edit
                    </Link>
                    <form action={removeTestimonial}>
                      <input type="hidden" name="id" defaultValue={t.id} />
                      <ConfirmButton>Delete</ConfirmButton>
                    </form>
                  </div>
                </div>
              </AdminCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

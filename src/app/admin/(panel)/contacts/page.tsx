import { Mail, MapPin } from "lucide-react";
import { listContacts } from "@/server/db/contacts";
import { PageHeader, AdminCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function fmt(unix: number) {
  return new Date(unix * 1000).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function ContactsAdmin() {
  const contacts = await listContacts();

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle={`${contacts.length} submission${contacts.length === 1 ? "" : "s"} from the public contact form.`}
      />

      {contacts.length === 0 ? (
        <AdminCard className="text-center">
          <Mail className="mx-auto size-6 text-tertiary" />
          <p className="mt-3 text-sm text-tertiary">
            No messages yet. Submissions from the site&apos;s contact form will appear here.
          </p>
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <AdminCard key={c.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-primary">{c.name}</p>
                  <a
                    href={`mailto:${c.email}?subject=Re:%20your%20message`}
                    className="text-sm text-accent hover:underline"
                  >
                    {c.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-xs text-tertiary">
                  {c.country && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {c.country}
                    </span>
                  )}
                  <span>{fmt(c.createdAt)}</span>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap border-t border-border pt-3 text-sm leading-relaxed text-secondary">
                {c.message}
              </p>
              <a
                href={`mailto:${c.email}?subject=Re:%20your%20message`}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
              >
                <Mail className="size-3.5" /> Reply
              </a>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}

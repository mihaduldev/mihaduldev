import { Mail } from "lucide-react";
import { listContacts, countContacts } from "@/server/db/contacts";
import { PageHeader, AdminCard } from "@/components/admin/ui";
import { ContactsList } from "@/components/admin/contacts-list";
import { ADMIN_PAGE_SIZE } from "@/components/admin/infinite-list";

export const dynamic = "force-dynamic";

export default async function ContactsAdmin() {
  const [contacts, total] = await Promise.all([
    listContacts(ADMIN_PAGE_SIZE, 0),
    countContacts(),
  ]);

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle={`${total} submission${total === 1 ? "" : "s"} from the public contact form.`}
      />

      {total === 0 ? (
        <AdminCard className="text-center">
          <Mail className="mx-auto size-6 text-tertiary" />
          <p className="mt-3 text-sm text-tertiary">
            No messages yet. Submissions from the site&apos;s contact form will appear here.
          </p>
        </AdminCard>
      ) : (
        <ContactsList initial={contacts} total={total} />
      )}
    </div>
  );
}

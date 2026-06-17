"use client";

import { Mail, MapPin } from "lucide-react";
import type { Contact } from "@/server/db/contacts";
import { AdminCard } from "@/components/admin/ui";
import { InfiniteList } from "@/components/admin/infinite-list";
import { moreContacts } from "@/app/admin/actions";

function fmt(unix: number) {
  return new Date(unix * 1000).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ContactsList({ initial, total }: { initial: Contact[]; total: number }) {
  return (
    <InfiniteList<Contact>
      initial={initial}
      total={total}
      loadMore={moreContacts}
      render={(c) => (
        <AdminCard className="p-5">
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
          <p className="mt-3 whitespace-pre-wrap break-words border-t border-border pt-3 text-sm leading-relaxed text-secondary">
            {c.message}
          </p>
          <a
            href={`mailto:${c.email}?subject=Re:%20your%20message`}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
          >
            <Mail className="size-3.5" /> Reply
          </a>
        </AdminCard>
      )}
    />
  );
}

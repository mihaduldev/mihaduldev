"use client";

import Link from "next/link";
import { Mail, Clock, MessageSquare } from "lucide-react";
import type { Conversation } from "@/server/db/conversations";
import { AdminCard } from "@/components/admin/ui";
import { InfiniteList } from "@/components/admin/infinite-list";
import { moreLeads } from "@/app/admin/actions";

function fmt(unix: number) {
  return new Date(unix * 1000).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const clarityStyle: Record<string, string> = {
  high: "bg-green-500/15 text-green-400",
  medium: "bg-amber-400/15 text-amber-300",
  low: "bg-white/10 text-tertiary",
};

export function LeadsList({ initial, total }: { initial: Conversation[]; total: number }) {
  return (
    <InfiniteList<Conversation>
      initial={initial}
      total={total}
      loadMore={moreLeads}
      render={(c) => (
        <Link href={`/admin/conversations?id=${c.id}`} className="block">
          <AdminCard className="p-5 transition-colors hover:border-accent/40">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-primary">
                    {c.overview?.visitorName ?? c.visitorName ?? "Anonymous visitor"}
                  </p>
                  {c.overview && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${clarityStyle[c.overview.clarity] ?? clarityStyle.low}`}
                    >
                      {c.overview.clarity}
                    </span>
                  )}
                  {(c.overview?.visitorEmail ?? c.visitorEmail) && (
                    <span className="inline-flex items-center gap-1 text-xs text-accent">
                      <Mail className="size-3" /> {c.overview?.visitorEmail ?? c.visitorEmail}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-tertiary">
                  {c.overview?.summary ?? "Open to generate the project brief from this conversation."}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5 text-xs text-tertiary">
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="size-3.5" /> {c.messageCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> {fmt(c.updatedAt)}
                </span>
              </div>
            </div>
          </AdminCard>
        </Link>
      )}
    />
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { Bot, ArrowLeft } from "lucide-react";
import {
  listConversations,
  countConversations,
  getConversation,
  listConversationMessages,
  type Conversation,
} from "@/server/db/conversations";
import { getOrGenerateOverview } from "@/server/ai/overview";
import { removeConversation } from "@/app/admin/actions";
import { PageHeader, AdminCard } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { LeadsList } from "@/components/admin/leads-list";
import { ADMIN_PAGE_SIZE } from "@/components/admin/infinite-list";

export const dynamic = "force-dynamic";

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

function Chips({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-tertiary">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span key={it} className="rounded-md border border-border bg-primary/[0.04] px-2 py-0.5 text-xs text-secondary">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

/** The AI-extracted brief — its own async unit so it can stream in Suspense
 *  without blocking the transcript (generation can take a few seconds). */
async function BriefCard({ id, convo }: { id: number; convo: Conversation }) {
  const overview = await getOrGenerateOverview(id);
  return (
    <AdminCard className="self-start">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-primary">Project brief</h2>
        {overview && (
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${clarityStyle[overview.clarity] ?? clarityStyle.low}`}>
            {overview.clarity} clarity
          </span>
        )}
      </div>

      {!overview ? (
        <p className="mt-3 text-sm text-tertiary">
          No brief yet (the AI model may be unavailable). The transcript is on the right.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <span className="text-secondary">
              <span className="text-tertiary">Name:</span>{" "}
              {overview.visitorName ?? convo.visitorName ?? "—"}
            </span>
            <span className="text-secondary">
              <span className="text-tertiary">Email:</span>{" "}
              {overview.visitorEmail ?? convo.visitorEmail ? (
                <a className="text-accent hover:underline" href={`mailto:${overview.visitorEmail ?? convo.visitorEmail}`}>
                  {overview.visitorEmail ?? convo.visitorEmail}
                </a>
              ) : (
                "—"
              )}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-sm">
            <span className="text-secondary"><span className="text-tertiary">Type:</span> {overview.projectType ?? "—"}</span>
            <span className="text-secondary"><span className="text-tertiary">Timeline:</span> {overview.timeline ?? "—"}</span>
            <span className="text-secondary"><span className="text-tertiary">Budget:</span> {overview.budget ?? "—"}</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-tertiary">Summary</p>
            <p className="mt-1 text-sm leading-relaxed text-secondary">{overview.summary || "—"}</p>
          </div>
          <Chips label="Goals" items={overview.goals} />
          <Chips label="Features" items={overview.features} />
          <Chips label="Stack" items={overview.stack} />
          <Chips label="Tags" items={overview.tags} />
          {overview.nextStep && (
            <div className="rounded-lg border border-accent/25 bg-accent/[0.06] px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Suggested next step</p>
              <p className="mt-1 text-sm text-secondary">{overview.nextStep}</p>
            </div>
          )}
        </div>
      )}

      <form action={removeConversation} className="mt-5 border-t border-border pt-4">
        <input type="hidden" name="id" defaultValue={convo.id} />
        <ConfirmButton>Delete conversation</ConfirmButton>
      </form>
    </AdminCard>
  );
}

export default async function ConversationsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const sp = await searchParams;
  const id = sp.id ? Number(sp.id) : 0;

  /* ---------- detail ---------- */
  if (id) {
    const convo = await getConversation(id);
    if (!convo) {
      return (
        <div>
          <PageHeader title="Lead" subtitle="This conversation no longer exists." />
          <Link href="/admin/conversations" className="text-sm text-accent hover:underline">
            ← Back to leads
          </Link>
        </div>
      );
    }
    const messages = await listConversationMessages(id, 200);

    return (
      <div>
        <Link
          href="/admin/conversations"
          className="inline-flex items-center gap-2 text-sm font-medium text-tertiary transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4" /> All leads
        </Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* brief — streams in so the transcript isn't blocked on the LLM */}
          <Suspense
            fallback={
              <AdminCard className="self-start">
                <h2 className="font-semibold text-primary">Project brief</h2>
                <p className="mt-3 text-sm text-tertiary">Generating the brief from this conversation…</p>
              </AdminCard>
            }
          >
            <BriefCard id={id} convo={convo} />
          </Suspense>

          {/* transcript */}
          <AdminCard className="self-start">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-primary">Conversation</h2>
              <span className="text-xs text-tertiary">{messages.length} messages · {fmt(convo.updatedAt)}</span>
            </div>
            <div className="mt-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-accent/90 px-3.5 py-2 text-sm text-brand-foreground"
                        : "max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md border border-border bg-primary/[0.03] px-3.5 py-2 text-sm leading-relaxed text-secondary"
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    );
  }

  /* ---------- list ---------- */
  const [convos, total] = await Promise.all([
    listConversations(ADMIN_PAGE_SIZE, 0),
    countConversations(),
  ]);

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${total} assistant conversation${total === 1 ? "" : "s"}. Open one to see the AI-gathered project brief.`}
      />

      {total === 0 ? (
        <AdminCard className="text-center">
          <Bot className="mx-auto size-6 text-tertiary" />
          <p className="mt-3 text-sm text-tertiary">
            No conversations yet. When visitors chat with the site assistant, their inquiries and project briefs appear here.
          </p>
        </AdminCard>
      ) : (
        <LeadsList initial={convos} total={total} />
      )}
    </div>
  );
}

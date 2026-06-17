import Link from "next/link";
import { MessageSquare, CornerDownRight } from "lucide-react";
import { listAllComments } from "@/server/db/comments";
import { removeComment } from "@/app/admin/actions";
import { PageHeader, AdminCard } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";

export const dynamic = "force-dynamic";

function fmt(unix: number) {
  return new Date(unix * 1000).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function uaName(ua: string | null) {
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Version\/.*Safari/.test(ua)
            ? "Safari"
            : "Browser";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Android/.test(ua)
      ? "Android"
      : /iPhone|iPad|iPod/.test(ua)
        ? "iOS"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return os ? `${browser} · ${os}` : browser;
}

function flag(code: string | null) {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

export default async function CommentsAdmin() {
  const comments = await listAllComments();

  return (
    <div>
      <PageHeader
        title="Comments"
        subtitle={`${comments.length} comment${comments.length === 1 ? "" : "s"} across all posts. Review and remove anything inappropriate.`}
      />

      {comments.length === 0 ? (
        <AdminCard className="text-center">
          <MessageSquare className="mx-auto size-6 text-tertiary" />
          <p className="mt-3 text-sm text-tertiary">
            No comments yet. Reader comments from blog posts will appear here.
          </p>
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <AdminCard key={c.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-primary">{c.authorName}</p>
                    {c.parentId && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                        <CornerDownRight className="size-3" /> Reply
                      </span>
                    )}
                  </div>
                  <a
                    href={`mailto:${c.authorEmail}`}
                    className="text-sm text-accent hover:underline"
                  >
                    {c.authorEmail}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-xs text-tertiary">
                  <Link
                    href={`/blog/${c.postSlug}`}
                    target="_blank"
                    className="hover:text-accent hover:underline"
                  >
                    /blog/{c.postSlug}
                  </Link>
                  <span>{fmt(c.createdAt)}</span>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words border-t border-border pt-3 text-sm leading-relaxed text-secondary">
                {c.body}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-tertiary">
                {c.country && <span>{flag(c.country)} {c.country}</span>}
                {c.ip && <span>· IP {c.ip}</span>}
                <span>· {uaName(c.userAgent)}</span>
              </div>
              <form action={removeComment} className="mt-3">
                <input type="hidden" name="id" defaultValue={c.id} />
                <input type="hidden" name="slug" defaultValue={c.postSlug} />
                <ConfirmButton>Delete</ConfirmButton>
              </form>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}

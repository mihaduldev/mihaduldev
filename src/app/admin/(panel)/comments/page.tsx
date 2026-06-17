import { MessageSquare } from "lucide-react";
import { listAllComments, countAllComments } from "@/server/db/comments";
import { PageHeader, AdminCard } from "@/components/admin/ui";
import { CommentsList } from "@/components/admin/comments-list";
import { ADMIN_PAGE_SIZE } from "@/components/admin/infinite-list";

export const dynamic = "force-dynamic";

export default async function CommentsAdmin() {
  const [comments, total] = await Promise.all([
    listAllComments(ADMIN_PAGE_SIZE, 0),
    countAllComments(),
  ]);

  return (
    <div>
      <PageHeader
        title="Comments"
        subtitle={`${total} comment${total === 1 ? "" : "s"} across all posts. Review and remove anything inappropriate.`}
      />

      {total === 0 ? (
        <AdminCard className="text-center">
          <MessageSquare className="mx-auto size-6 text-tertiary" />
          <p className="mt-3 text-sm text-tertiary">
            No comments yet. Reader comments from blog posts will appear here.
          </p>
        </AdminCard>
      ) : (
        <CommentsList initial={comments} total={total} />
      )}
    </div>
  );
}

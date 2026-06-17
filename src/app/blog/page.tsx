import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import { listPublishedPosts } from "@/server/db/posts";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes on .NET, software architecture, DevOps, and practical AI by Mihadul Islam.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "/blog",
    title: "Writing · Mihadul Islam",
    description:
      "Notes on .NET, software architecture, DevOps, and practical AI by Mihadul Islam.",
  },
};

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts();

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-32 sm:pt-36">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-tertiary transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4" />
        Back home
      </Link>

      <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-primary sm:text-5xl">
        <span className="text-gradient-cyan">Writing</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-tertiary">
        Thoughts on backend engineering, architecture, cloud delivery, and
        building AI features that survive contact with real users.
      </p>

      {posts.length === 0 ? (
        <p className="mt-14 text-tertiary">No posts published yet — check back soon.</p>
      ) : (
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl glass transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_40px_-12px_var(--glow)]"
            >
              <div className={`relative h-44 bg-gradient-to-br ${post.cover}`}>
                <ArrowUpRight className="absolute right-4 top-4 size-5 text-white/85 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-border bg-primary/[0.03] px-2 py-0.5 text-xs font-medium text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 font-display text-xl font-semibold leading-snug text-primary transition-colors group-hover:text-accent">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-tertiary">
                  {post.excerpt}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-tertiary">
                  <time dateTime={post.publishedAt ?? undefined}>
                    {post.publishedAt ? formatDate(post.publishedAt) : ""}
                  </time>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {post.readingTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

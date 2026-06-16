import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { listPublishedPosts, getPublishedPostBySlug } from "@/server/db/posts";
import { profile } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { PostBody } from "@/components/markdown";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await listPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const site = "https://mihad.site";

  return (
    <article className="mx-auto max-w-3xl px-6 pb-24 pt-32 sm:pt-36">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt ?? undefined,
          keywords: post.tags.join(", "),
          author: { "@type": "Person", name: profile.fullName, url: site },
          mainEntityOfPage: `${site}/blog/${post.slug}`,
        }}
      />

      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-tertiary transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4" />
        All posts
      </Link>

      <div className={`mt-8 h-1.5 w-24 rounded-full bg-gradient-to-r ${post.cover} shadow-[0_0_18px_var(--glow)]`} />

      <div className="mt-7 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-border bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-accent"
          >
            {tag}
          </span>
        ))}
      </div>

      <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-primary sm:text-5xl">
        {post.title}
      </h1>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border pb-8 text-sm text-tertiary">
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-react-cyan text-xs font-bold text-brand-foreground">
            {profile.initials}
          </span>
          {profile.name}
        </span>
        {post.publishedAt && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-4" />
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" />
          {post.readingTime}
        </span>
      </div>

      <div className="mt-2">
        <PostBody markdown={post.bodyMd} />
      </div>

      <div className="mt-16 rounded-3xl glass glow-ring p-8 text-center">
        <p className="font-display text-xl font-semibold text-primary">Enjoyed this?</p>
        <p className="mt-2 text-sm text-tertiary">
          Let&apos;s talk about backend, cloud, or AI engineering.
        </p>
        <Link
          href="/#contact"
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-brand-foreground transition-all hover:shadow-[var(--glow-lg)]"
        >
          Get in touch
        </Link>
      </div>
    </article>
  );
}

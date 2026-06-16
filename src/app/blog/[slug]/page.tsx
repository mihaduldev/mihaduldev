import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { posts, profile } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  let Content: React.ComponentType;
  try {
    const mod = await import(`../../../content/blog/${slug}.mdx`);
    Content = mod.default;
  } catch {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 pb-24 pt-32 sm:pt-36">
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
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="size-4" />
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" />
          {post.readingTime}
        </span>
      </div>

      <div className="prose-portfolio mt-2">
        <Content />
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

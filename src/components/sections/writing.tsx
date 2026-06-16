"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SectionHeading } from "@/components/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { GlassCard } from "@/components/depth/glass-card";

export type PostCard = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
  cover: string;
};

export function Writing({ posts }: { posts: PostCard[] }) {
  return (
    <div className="relative w-full">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Writing"
            title="Notes & dispatches"
            description="On .NET, architecture, DevOps, and practical AI — hard ideas made shareable."
            align="left"
          />
          <Link
            href="/blog"
            className="group hidden shrink-0 items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:shadow-[var(--glow-md)] sm:inline-flex"
          >
            All posts
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <RevealGroup className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-3">
          {posts.map((post) => (
            <RevealItem key={post.slug}>
              <GlassCard className="h-full">
                <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
                  <div className={`relative h-36 bg-gradient-to-br ${post.cover}`}>
                    <div className="absolute inset-0 bg-wash/10" />
                    <ArrowUpRight className="absolute right-4 top-4 size-5 text-white/85 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-border bg-white/[0.03] px-2 py-0.5 text-xs font-medium text-secondary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-primary transition-colors group-hover:text-accent">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-tertiary">
                      {post.excerpt}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-tertiary">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {post.readingTime}
                      </span>
                    </div>
                  </div>
                </Link>
              </GlassCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </div>
  );
}

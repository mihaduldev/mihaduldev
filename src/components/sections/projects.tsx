"use client";

import { ArrowUpRight, Github, Star } from "lucide-react";
import type { Project } from "@/server/db/projects";
import { SectionHeading } from "@/components/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { GlassCard } from "@/components/depth/glass-card";

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <div className="relative w-full">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Selected Work"
          title={
            <>
              Systems worth <span className="text-accent">shipping</span>
            </>
          }
          description="Backend foundations, system design, and clean architecture in practice."
        />

        <RevealGroup className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2">
          {projects.map((p) => (
            <RevealItem key={p.title}>
              <GlassCard className="h-full">
                <a
                  href={p.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-full flex-col p-7"
                >
                  <div className="relative flex items-start justify-between">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg"
                      style={{ backgroundColor: p.accent, boxShadow: `0 0 22px ${p.accent}66` }}
                    >
                      <Github className="size-6" />
                    </span>
                    <div className="flex items-center gap-2">
                      {p.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-xs font-medium text-accent backdrop-blur">
                          <Star className="size-3 fill-accent" /> Featured
                        </span>
                      )}
                      <ArrowUpRight className="size-5 text-tertiary transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" />
                    </div>
                  </div>

                  <h3 className="relative mt-6 font-display text-xl font-semibold text-primary transition-colors group-hover:text-accent">
                    {p.title}
                  </h3>
                  <p className="relative mt-2 flex-1 text-sm leading-relaxed text-tertiary">
                    {p.description}
                  </p>

                  <div className="relative mt-6 flex flex-wrap gap-2">
                    {p.focus.map((f) => (
                      <span
                        key={f}
                        className="rounded-md border border-border bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-secondary"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </a>
              </GlassCard>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-12 flex justify-center">
          <a
            href="https://github.com/mihaduldev"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex h-12 items-center gap-2 rounded-full glass px-6 text-sm font-semibold text-primary transition-all hover:shadow-[var(--glow-md)]"
          >
            <Github className="size-4" />
            View all on GitHub
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

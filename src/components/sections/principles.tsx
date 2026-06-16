"use client";

import { principles } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { GlassCard } from "@/components/depth/glass-card";
import { Icon } from "@/components/icon";

export function Principles() {
  return (
    <div className="relative w-full">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="How I Work"
          title="Principles I build by"
          description="Simple rules that keep systems dependable as they grow."
        />

        <RevealGroup className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {principles.map((p, i) => (
            <RevealItem key={p.title} className={i === 0 ? "lg:col-span-2" : ""}>
              <GlassCard className="h-full p-7">
                <span className="pointer-events-none absolute -right-6 -top-8 font-display text-[7rem] font-bold leading-none text-accent/[0.07]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Icon name={p.icon} className="size-6" />
                </span>
                <h3 className="relative mt-5 font-display text-lg font-semibold text-primary">
                  {p.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-tertiary">
                  {p.description}
                </p>
              </GlassCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </div>
  );
}

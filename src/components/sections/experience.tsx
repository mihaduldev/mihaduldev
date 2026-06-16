"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { experience } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { GlassCard } from "@/components/depth/glass-card";
import { Icon } from "@/components/icon";

export function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 70%"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="relative w-full">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading eyebrow="Focus Areas" title="Where my work lives" />

        {/* Left-rail timeline */}
        <div ref={ref} className="relative mt-12 sm:mt-16">
          {/* track + animated fill */}
          <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-border" aria-hidden />
          <motion.div
            aria-hidden
            style={{ scaleY }}
            className="absolute left-[19px] top-3 bottom-3 w-0.5 origin-top bg-gradient-to-b from-brand via-accent to-react-cyan shadow-[var(--glow-sm)]"
          />

          <div className="space-y-6 sm:space-y-7">
            {experience.map((item) => (
              <Reveal key={item.title} direction="up">
                <div className="relative pl-14 sm:pl-16">
                  {/* node */}
                  <span className="absolute left-[19px] top-7 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-accent bg-wash shadow-[var(--glow-sm)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>

                  <GlassCard className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                        <Icon name={item.icon} className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-semibold leading-tight text-primary">
                          {item.title}
                        </h3>
                        <p className="text-sm font-medium text-accent">{item.org}</p>
                      </div>
                      <span className="ml-auto rounded-full bg-highlight px-3 py-1 text-xs font-semibold text-accent">
                        {item.period}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-tertiary">
                      {item.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-border bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-secondary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

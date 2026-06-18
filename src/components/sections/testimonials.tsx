"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { Testimonial } from "@/server/db/testimonials";
import { SectionHeading } from "@/components/section-heading";
import { duration, easing } from "@/lib/motion";

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const reduce = useReducedMotion();
  const count = items.length;
  const multiple = count > 1;

  const paginate = useCallback(
    (d: number) => setState(([i]) => [(i + d + count) % count, d]),
    [count]
  );

  useEffect(() => {
    if (reduce || !multiple) return;
    const id = setInterval(() => paginate(1), 6000);
    return () => clearInterval(id);
  }, [paginate, reduce, multiple]);

  if (!count) return null;
  const safeIndex = Math.min(index, count - 1);
  const t = items[safeIndex];

  return (
    <div className="relative w-full overflow-hidden">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="Words from collaborators"
          description="A few words from people I've worked with."
        />

        <div className="relative mt-12 sm:mt-16">
          <Quote className="absolute -top-4 left-2 size-16 text-accent/10" aria-hidden />
          <div className="relative min-h-[260px] sm:min-h-[210px]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.figure
                key={safeIndex}
                initial={{ opacity: 0, x: dir >= 0 ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir >= 0 ? -40 : 40 }}
                transition={{ duration: duration.standard, ease: easing.smooth }}
                className="rounded-2xl glass glow-soft p-8 sm:p-10"
              >
                <blockquote className="text-lg font-medium leading-relaxed text-primary sm:text-xl">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-react-cyan text-sm font-bold text-brand-foreground">
                    {t.initials}
                  </span>
                  <div>
                    <p className="font-semibold text-primary">{t.name}</p>
                    {t.title && <p className="text-sm text-tertiary">{t.title}</p>}
                  </div>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {multiple && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => paginate(-1)}
                aria-label="Previous testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full glass text-secondary transition-colors hover:text-accent"
              >
                <ChevronLeft className="size-5" />
              </button>
              <div className="flex gap-2">
                {items.map((it, i) => (
                  <button
                    key={it.id}
                    onClick={() => setState([i, i > safeIndex ? 1 : -1])}
                    aria-label={`Go to testimonial ${i + 1}`}
                    aria-current={i === safeIndex}
                    className="flex h-11 items-center justify-center px-1"
                  >
                    <span
                      className={`h-2 rounded-full transition-all ${
                        i === safeIndex ? "w-7 bg-accent shadow-[var(--glow-sm)]" : "w-2 bg-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <button
                onClick={() => paginate(1)}
                aria-label="Next testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full glass text-secondary transition-colors hover:text-accent"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

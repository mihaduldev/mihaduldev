"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { easing } from "@/lib/motion";
import { usePointer } from "@/components/depth/pointer-parallax";

/**
 * A full-viewport deck panel. Owns the section id (the snap target + nav
 * anchor), shows a large ghost index numeral, and animates its content in
 * every time it enters view (once:false) so paging between sections feels
 * alive and dynamic.
 */
export function Panel({
  id,
  index,
  children,
  className,
}: {
  id: string;
  index: number;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  // Big ghost numeral rides the shared pointer field for per-section depth.
  const { mx, my } = usePointer();
  const numX = useTransform(mx, (v) => v * -64);
  const numY = useTransform(my, (v) => v * -44);

  // Hero (index 0) stays full-bleed/centered; every other panel is top-aligned
  // with padding that clears the floating nav, so its heading is always visible.
  return (
    <section
      id={id}
      data-panel={id}
      className={cn(
        "panel",
        index === 0 ? "justify-center" : "justify-start pt-20 pb-10 sm:pt-24",
        className
      )}
    >
      {index > 0 && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: easing.smooth }}
          className="pointer-events-none absolute right-3 top-20 hidden select-none sm:right-10 sm:block"
        >
          <motion.span
            style={{ x: numX, y: numY }}
            className="block font-display text-[15vw] font-bold leading-none text-accent/[0.05]"
          >
            {String(index).padStart(2, "0")}
          </motion.span>
        </motion.div>
      )}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 44, scale: 0.985 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: easing.smooth }}
        className="relative w-full"
      >
        {children}
      </motion.div>
    </section>
  );
}

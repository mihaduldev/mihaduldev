"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { easing } from "@/lib/motion";

/**
 * Section header: a small uppercase kicker (eyebrow) above a left-aligned
 * title with a wipe reveal. `description` is intentionally NOT rendered — the
 * prop is kept so callers stay unchanged, but section copy lives in the body,
 * not a duplicated subheading.
 */
export function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("text-left", className)}>
      {eyebrow && (
        <motion.span
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px 0px -80px 0px" }}
          transition={{ duration: 0.5, ease: easing.smooth }}
          className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent/90"
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        initial={
          reduce ? { opacity: 0 } : { opacity: 0, y: 14, clipPath: "inset(0 100% 0 0)" }
        }
        whileInView={{ opacity: 1, y: 0, clipPath: "inset(0 0% 0 0)" }}
        viewport={{ once: true, margin: "-80px 0px -80px 0px" }}
        transition={{ duration: 0.65, ease: easing.smooth }}
        className="pb-0.5 font-display text-[clamp(1.6rem,3.6vw,2.4rem)] font-bold leading-[1.1] tracking-tight text-primary"
      >
        {title}
      </motion.h2>
    </div>
  );
}

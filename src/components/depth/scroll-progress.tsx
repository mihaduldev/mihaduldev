"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { spring } from "@/lib/motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, spring.scroll);

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-brand via-accent to-react-cyan shadow-[var(--glow-sm)]"
    />
  );
}

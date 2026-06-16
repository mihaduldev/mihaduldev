"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { profile } from "@/lib/data";

/**
 * Hero portrait in a glowing glass frame. Drops in automatically when a photo
 * exists at /portrait.jpg (square or 4:5, ~800px+). Until then it shows a clean
 * monogram fallback, so the layout is never broken.
 */
// Tries these in order, so any of these filenames in /public just works.
const SOURCES = ["/portrait.jpg", "/portrait.jpeg", "/portrait.png", "/portrait.webp"];

export function Portrait() {
  const [srcIndex, setSrcIndex] = useState(0);
  const hasPhoto = srcIndex < SOURCES.length;
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative mx-auto w-full max-w-[14rem] lg:max-w-[17rem]"
    >
      {/* glow aura */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle at 50% 40%, var(--glow), transparent 65%)" }}
      />

      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl glass glow-ring">
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={SOURCES[srcIndex]}
            alt={`${profile.fullName} — ${profile.role}`}
            onError={() => setSrcIndex((i) => i + 1)}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0e1726] to-[#0a0f1a]">
            <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-react-cyan text-3xl font-bold text-brand-foreground glow-soft">
              {profile.initials}
            </span>
            <span className="mt-4 px-6 text-center text-xs text-tertiary">
              Add your photo at{" "}
              <code className="font-mono text-accent">public/portrait.jpg</code>
            </span>
          </div>
        )}
        {/* subtle top sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5"
        />
      </div>

      {/* floating availability chip */}
      <motion.div
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-full glass px-3.5 py-2 text-xs font-medium text-primary glow-soft"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </span>
        Open to work
      </motion.div>
    </motion.div>
  );
}

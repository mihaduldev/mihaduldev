"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { profile } from "@/lib/data";

/**
 * Hero portrait in a glowing glass frame. Drops in automatically when a photo
 * exists at /portrait.jpg (square or 4:5, ~800px+). Until then it shows a clean
 * monogram fallback, so the layout is never broken. The availability status
 * lives once, on the hero's left badge — intentionally not repeated here.
 */
// Tries these in order, so any of these filenames in /public just works.
// The ?v= busts the browser cache when the photo is reprocessed.
const SOURCES = [
  "/portrait.jpg?v=3",
  "/portrait.jpeg?v=3",
  "/portrait.png?v=3",
  "/portrait.webp?v=3",
];

export function Portrait() {
  const [srcIndex, setSrcIndex] = useState(0);
  const hasPhoto = srcIndex < SOURCES.length;
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative mx-auto w-full max-w-[13rem] sm:max-w-[15rem] lg:max-w-[17rem]"
    >
      {/* soft glow aura — kept light, not a heavy shadow */}
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-[1.75rem] opacity-45 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: "radial-gradient(circle at 50% 35%, var(--glow), transparent 65%)" }}
      />

      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border glass glow-ring">
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={SOURCES[srcIndex]}
            alt={`Portrait of ${profile.fullName}, ${profile.role}`}
            onError={() => setSrcIndex((i) => i + 1)}
            width={800}
            height={1000}
            className="h-full w-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-wash-2 to-card">
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
    </motion.div>
  );
}

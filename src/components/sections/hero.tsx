"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Download, Github, Linkedin, Mail, Globe, MapPin } from "lucide-react";
import { profile, socials } from "@/lib/data";
import { ArchitectureBackground } from "@/components/depth/architecture-bg";
import { Portrait } from "@/components/depth/portrait";
import { duration, easing } from "@/lib/motion";
import type { HeroContent } from "@/server/db/settings";

const iconMap = { Github, Linkedin, Mail, Globe } as const;

export function Hero({ content }: { content: HeroContent }) {
  const reduce = useReducedMotion();
  const fade = (d: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: duration.calm, delay: d, ease: easing.smooth },
  });
  // LCP-critical text: animate transform ONLY (opacity stays 1) so the largest
  // text paints on the first frame instead of waiting for the fade — protects LCP.
  const rise = (d: number) => ({
    initial: reduce ? false : { y: 16 },
    animate: { y: 0 },
    transition: { duration: duration.calm, delay: d, ease: easing.smooth },
  });

  return (
    <div className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden">
      {/* theme-aware stage: deep-space in dark, airy cyan-washed white in light */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "var(--hero-stage)" }}
      />
      <ArchitectureBackground />
      {/* clean pocket behind the portrait (desktop) so the photo floats above
          the architecture instead of sitting inside it — softly hides nodes
          right around the card while blending into the stage */}
      <div
        aria-hidden
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(27% 52% at 74% 50%, var(--hero-fade) 0%, color-mix(in srgb, var(--hero-fade) 62%, transparent) 46%, transparent 74%)",
        }}
      />
      {/* fade the left toward the wash so the headline reads cleanly over the
          texture (kept clear at the top so the floating nav stays crisp) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, var(--hero-fade) 0%, color-mix(in srgb, var(--hero-fade) 64%, transparent) 46%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: "linear-gradient(to top, var(--hero-fade), transparent)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-24 sm:py-28 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14">
        {/* LEFT — who / what / why */}
        <div className="text-left">
          {/* availability — the single status signal */}
          <motion.div {...fade(0.05)}>
            <span className="glass inline-flex items-center gap-2 rounded-full py-1.5 pl-2 pr-4 text-xs font-medium text-secondary">
              <span className="relative flex h-2.5 w-2.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
              </span>
              {content.availability}
            </span>
          </motion.div>

          {/* WHO — strongest element (LCP) */}
          <motion.h1
            {...rise(0.12)}
            className="mt-6 font-display text-[clamp(2.75rem,7vw,4.5rem)] font-bold leading-[1.02] tracking-tight text-primary"
          >
            {content.name}
          </motion.h1>

          {/* WHAT */}
          <motion.p
            {...rise(0.2)}
            className="mt-4 text-lg font-semibold leading-snug text-primary sm:text-xl"
          >
            {content.roleLead}
            <span className="text-accent">{content.roleAccent}</span>
          </motion.p>

          {/* WHY (value) — constrained width for readability */}
          <motion.p
            {...fade(0.28)}
            className="mt-5 max-w-xl text-base leading-relaxed text-secondary sm:text-[1.0625rem]"
          >
            {content.description}
          </motion.p>

          {/* proof */}
          <motion.ul {...fade(0.34)} className="mt-6 flex flex-wrap gap-2.5">
            {content.proof.map((p) => (
              <li
                key={p}
                className="glass rounded-full px-3.5 py-1.5 text-xs font-medium text-secondary"
              >
                {p}
              </li>
            ))}
          </motion.ul>

          {/* CTAs */}
          <motion.div {...fade(0.42)} className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="#projects"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-7 text-sm font-semibold text-brand-foreground shadow-[var(--glow-md)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--glow-lg)]"
            >
              View my work
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/resume"
              className="glass inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:border-accent/50"
            >
              <Download className="size-4" />
              Download CV
            </Link>
            <Link
              href="#contact"
              className="group inline-flex h-12 items-center gap-1.5 px-2 text-sm font-semibold text-secondary underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              Let&apos;s discuss your project
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* socials + location */}
          <motion.div {...fade(0.5)} className="mt-9 flex flex-wrap items-center gap-4">
            <ul className="flex items-center gap-2">
              {socials.map((s) => {
                const Icon = iconMap[s.icon as keyof typeof iconMap] ?? Globe;
                const isMail = s.href.startsWith("mailto:");
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      {...(isMail ? {} : { target: "_blank", rel: "noreferrer" })}
                      aria-label={
                        isMail ? `Email ${profile.name}` : `${s.label} (opens in a new tab)`
                      }
                      className="group/social relative flex h-10 w-10 items-center justify-center rounded-full glass text-secondary transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow-[var(--glow-sm)]"
                    >
                      <Icon className="size-[18px]" aria-hidden />
                      {/* hover/focus tooltip (decorative — name is on aria-label) */}
                      <span
                        aria-hidden
                        className="glass pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 scale-90 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium text-primary opacity-0 shadow-[var(--glow-sm)] transition-all duration-200 group-hover/social:scale-100 group-hover/social:opacity-100 group-focus-visible/social:scale-100 group-focus-visible/social:opacity-100"
                      >
                        {s.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <span className="flex items-center gap-1.5 text-sm text-tertiary">
              <MapPin className="size-4" aria-hidden />
              {profile.location}
            </span>
          </motion.div>
        </div>

        {/* RIGHT — portrait (who, with a face = trust) */}
        <div className="order-first lg:order-last">
          <Portrait />
        </div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 sm:block"
        aria-hidden
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-primary/25 p-1">
          <motion.span
            animate={reduce ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-accent"
          />
        </div>
      </motion.div>
    </div>
  );
}

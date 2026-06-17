"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Download, Github, Linkedin, Mail, Globe, MapPin } from "lucide-react";
import { profile, socials } from "@/lib/data";
import { ParticleField } from "@/components/depth/particle-field";
import { Portrait } from "@/components/depth/portrait";
import { duration, easing } from "@/lib/motion";

const iconMap = { Github, Linkedin, Mail, Globe } as const;

// 3-second value proof — what he's known for
const proof = ["Clean Architecture", "Cloud-ready delivery", "Practical AI"];

export function Hero() {
  const reduce = useReducedMotion();
  const fade = (d: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
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
      <ParticleField text={profile.initials} />
      {/* fade the left toward the wash so the headline reads cleanly over the
          texture (kept clear at the top so the floating nav stays crisp) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, var(--hero-fade) 0%, color-mix(in srgb, var(--hero-fade) 70%, transparent) 50%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: "linear-gradient(to top, var(--hero-fade), transparent)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-28 lg:grid-cols-[1.15fr_0.85fr]">
        {/* LEFT — who / what / why */}
        <div className="text-left">
          <motion.div {...fade(0.05)}>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-secondary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-react-cyan opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-react-cyan" />
              </span>
              Available for new opportunities
            </span>
          </motion.div>

          {/* WHO */}
          <motion.h1
            {...fade(0.12)}
            className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight text-primary sm:text-6xl lg:text-[4.25rem]"
          >
            {profile.name}
          </motion.h1>

          {/* WHAT */}
          <motion.p
            {...fade(0.2)}
            className="mt-4 text-lg font-semibold text-primary sm:text-xl"
          >
            Software Engineer{" "}
            <span className="text-accent">· .NET · Cloud · System Design · AI</span>
          </motion.p>

          {/* WHY (value) */}
          <motion.p
            {...fade(0.28)}
            className="mt-4 max-w-xl text-base leading-relaxed text-secondary sm:text-lg"
          >
            I build reliable backend systems, clean APIs, and practical AI
            integrations that real businesses depend on.
          </motion.p>

          {/* proof */}
          <motion.ul {...fade(0.34)} className="mt-6 flex flex-wrap gap-2">
            {proof.map((p) => (
              <li
                key={p}
                className="glass rounded-full px-3 py-1 text-xs font-medium text-secondary"
              >
                {p}
              </li>
            ))}
          </motion.ul>

          {/* CTAs */}
          <motion.div {...fade(0.42)} className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#projects"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-brand-foreground transition-all hover:shadow-[var(--glow-lg)]"
            >
              View my work
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/resume"
              className="glass inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-primary transition-colors hover:border-accent/50"
            >
              <Download className="size-4" />
              Download CV
            </Link>
            <Link
              href="#contact"
              className="inline-flex h-12 items-center px-3 text-sm font-semibold text-secondary transition-colors hover:text-accent"
            >
              Hire me →
            </Link>
          </motion.div>

          {/* socials + location */}
          <motion.div {...fade(0.5)} className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              {socials.map((s) => {
                const Icon = iconMap[s.icon as keyof typeof iconMap] ?? Globe;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="glass flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-all hover:-translate-y-0.5 hover:text-react-cyan hover:shadow-[var(--glow-md)]"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                );
              })}
            </div>
            <span className="flex items-center gap-1.5 text-sm text-tertiary">
              <MapPin className="size-4" />
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
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-primary/25 p-1">
          <motion.span
            animate={reduce ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-react-cyan"
          />
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { skillGroups, type Skill } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Marquee } from "@/components/motion/marquee";
import { Icon } from "@/components/icon";
import { duration, easing } from "@/lib/motion";
import { cn } from "@/lib/utils";

const allSkills = skillGroups.flatMap((g) => g.skills);

function SkillBadge({ skill }: { skill: Skill }) {
  const [err, setErr] = useState(false);
  if (skill.logo && !err) {
    return (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-white/[0.06] p-2 transition-transform group-hover:scale-110">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${skill.logo}.svg`}
          alt=""
          aria-hidden
          loading="lazy"
          className="h-full w-full object-contain"
          onError={() => setErr(true)}
        />
      </span>
    );
  }
  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white transition-transform group-hover:scale-110"
      style={{ backgroundColor: skill.color, boxShadow: `0 0 16px ${skill.color}55` }}
    >
      {skill.name.charAt(0)}
    </span>
  );
}

function Pill({ name, color }: { name: string; color: string }) {
  return (
    <span className="flex shrink-0 items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-tertiary">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}

export function Skills() {
  const [active, setActive] = useState(0);
  const group = skillGroups[active];

  return (
    <div className="relative w-full">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Tech Stack"
          title="A toolkit for shipping scalable web applications"
        />
      </div>

      {/* Decorative background marquee — subtle, not the main content */}
      <div className="pointer-events-none relative mt-10 flex select-none flex-col gap-3 opacity-45 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <Marquee>
          {allSkills.slice(0, Math.ceil(allSkills.length / 2)).map((s) => (
            <Pill key={s.name} {...s} />
          ))}
        </Marquee>
        <Marquee reverse>
          {allSkills.slice(Math.ceil(allSkills.length / 2)).map((s) => (
            <Pill key={s.name} {...s} />
          ))}
        </Marquee>
      </div>

      <div className="mx-auto mt-12 max-w-6xl px-6 sm:mt-16">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {skillGroups.map((g, i) => (
            <button
              key={g.category}
              onClick={() => setActive(i)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                active === i
                  ? "border-transparent bg-accent text-brand-foreground shadow-[var(--glow-lg)]"
                  : "border-border glass text-secondary hover:border-accent/40 hover:text-primary"
              )}
            >
              <Icon name={g.icon} className="size-4" />
              {g.category}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: duration.standard, ease: easing.smooth }}
          >
            {/* Category purpose */}
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-secondary sm:text-base">
              {group.description}
            </p>

            {/* Skill cards: name + purpose + Core badge */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.skills.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: duration.reveal, delay: i * 0.05, ease: easing.smooth }}
                  className="group flex gap-4 rounded-2xl glass p-5 transition-transform duration-300 hover:-translate-y-1"
                >
                  <SkillBadge skill={s} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-primary">{s.name}</h3>
                      {s.core && (
                        <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                          Core
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-snug text-tertiary">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

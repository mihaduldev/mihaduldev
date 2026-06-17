"use client";

import { about, profile } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { GlassCard } from "@/components/depth/glass-card";
import { Icon } from "@/components/icon";

export function About() {
  return (
    <div className="relative w-full">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="About"
          title={
            <>
              Engineering that real users{" "}
              <span className="text-accent">depend on</span>
            </>
          }
          description="Turning messy business requirements into clean, dependable software."
        />

        <div className="mt-12 grid gap-6 sm:mt-16 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <GlassCard tilt={false} className="h-full p-8">
              <p className="text-lg leading-relaxed text-secondary">{about.lead}</p>
              <p className="mt-4 text-base leading-relaxed text-tertiary">{about.body}</p>
              <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-react-cyan text-lg font-bold text-brand-foreground glow-soft">
                  {profile.initials}
                </span>
                <div>
                  <p className="font-display font-semibold text-primary">{profile.fullName}</p>
                  <p className="text-sm text-tertiary">{profile.role} · {profile.location}</p>
                </div>
              </div>
            </GlassCard>
          </Reveal>

          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {about.building.map((item) => (
              <RevealItem key={item.title}>
                <GlassCard className="h-full p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                      <Icon name={item.icon} className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-primary">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-tertiary">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </div>
  );
}

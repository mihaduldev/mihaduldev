import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, Globe, Github, Linkedin, MapPin } from "lucide-react";
import {
  profile,
  about,
  skillGroups,
  experience,
  projects,
  principles,
  socials,
} from "@/lib/data";
import { PrintButton as PrintControl } from "@/components/print-button";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume / CV of ${profile.name} (${profile.fullName}) — ${profile.role} based in ${profile.location}.`,
  alternates: { canonical: "/resume" },
};

const contactIcons = { Github, Linkedin, Mail, Globe } as const;

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 sm:pt-32">
      {/* controls — hidden when printing */}
      <div className="no-print mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-tertiary transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back home
        </Link>
        <PrintControl />
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 print:border-0 print:p-0">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-primary">
              {profile.fullName}
            </h1>
            <p className="mt-1 font-medium text-brand">{profile.headline}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-tertiary">
              <MapPin className="size-3.5" />
              {profile.location}
            </p>
          </div>
          <ul className="space-y-1.5 text-sm">
            {socials.map((s) => {
              const Icon = contactIcons[s.icon as keyof typeof contactIcons] ?? Globe;
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="inline-flex items-center gap-2 text-secondary transition-colors hover:text-brand"
                  >
                    <Icon className="size-3.5 text-tertiary" />
                    {s.handle}
                  </a>
                </li>
              );
            })}
          </ul>
        </header>

        {/* Summary */}
        <Section title="Summary">
          <p className="leading-relaxed text-secondary">{about.lead}</p>
          <p className="mt-2 leading-relaxed text-tertiary">{about.body}</p>
        </Section>

        {/* Skills */}
        <Section title="Technical Skills">
          <div className="space-y-3">
            {skillGroups.map((g) => (
              <div key={g.category} className="grid gap-1 sm:grid-cols-[200px_1fr]">
                <p className="text-sm font-semibold text-primary">{g.category}</p>
                <p className="text-sm text-secondary">
                  {g.skills.map((s) => s.name).join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Focus / Experience */}
        <Section title="Focus Areas">
          <div className="space-y-5">
            {experience.map((e) => (
              <div key={e.title}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-semibold text-primary">{e.title}</h3>
                  <span className="shrink-0 text-xs font-medium text-tertiary">
                    {e.period}
                  </span>
                </div>
                <p className="text-sm font-medium text-brand">{e.org}</p>
                <p className="mt-1 text-sm leading-relaxed text-secondary">
                  {e.description}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Projects */}
        <Section title="Selected Projects">
          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.title}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-semibold text-primary">{p.title}</h3>
                  <a
                    href={p.repo}
                    className="shrink-0 text-xs font-medium text-link hover:underline"
                  >
                    {p.repo.replace("https://github.com/", "github.com/")}
                  </a>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-secondary">
                  {p.description}
                </p>
                <p className="mt-1 text-xs text-tertiary">{p.focus.join(" · ")}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Principles */}
        <Section title="Engineering Principles">
          <ul className="grid gap-2 sm:grid-cols-2">
            {principles.map((p) => (
              <li key={p.title} className="text-sm text-secondary">
                <span className="font-semibold text-primary">{p.title}</span> —{" "}
                {p.description}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-brand">
        {title}
      </h2>
      {children}
    </section>
  );
}

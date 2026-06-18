import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { resume } from "@/lib/resume";
import { profile } from "@/lib/data";
import { PrintButton } from "@/components/print-button";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume / CV of ${resume.name} — ${resume.title}.`,
  alternates: { canonical: "/resume" },
  openGraph: {
    type: "profile",
    url: "/resume",
    title: `Resume · ${resume.name}`,
    description: `Resume / CV of ${resume.name} — ${resume.title}.`,
    firstName: "Mihadul",
    lastName: "Islam",
    username: profile.githubUsername,
  },
};

const ACCENT = "#087EA4";
const LINK = "text-[#0b6c87] hover:underline";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2
        className="mb-3 border-b-2 pb-1 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-900"
        style={{ borderColor: ACCENT }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-[920px] px-4 pb-24 pt-24 sm:px-6 sm:pt-28 print:p-0">
      {/* controls — hidden when printing */}
      <div className="no-print mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-tertiary transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4" />
          Back home
        </Link>
        <PrintButton />
      </div>

      <article className="resume-paper mx-auto max-w-[860px] rounded-2xl border border-slate-200 bg-white p-8 text-slate-700 shadow-xl sm:p-12">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {resume.name}
            </h1>
            <p className="mt-1 text-base font-semibold" style={{ color: ACCENT }}>
              {resume.title}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
              {resume.contacts.map((c) => (
                <div key={c.label} className="flex gap-2">
                  <span className="w-[68px] shrink-0 font-semibold text-slate-900">{c.label}</span>
                  {c.href ? (
                    <a href={c.href} className={`break-all ${LINK}`}>
                      {c.value}
                    </a>
                  ) : (
                    <span className="break-all text-slate-600">{c.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resume.photo}
            alt={resume.name}
            className="hidden h-36 w-28 shrink-0 rounded-lg border border-slate-200 object-cover sm:block"
          />
        </header>

        <Section title="Professional Summary">
          <p className="text-sm leading-relaxed text-slate-700">{resume.summary}</p>
        </Section>

        <Section title="Languages, Frameworks, Tools & Skills">
          <ul className="columns-1 gap-x-10 sm:columns-2">
            {resume.skills.map((s) => (
              <li
                key={s}
                className="mb-1.5 flex break-inside-avoid items-start gap-2 text-sm text-slate-700"
              >
                <span
                  className="mt-[7px] size-1 shrink-0 rounded-full"
                  style={{ backgroundColor: ACCENT }}
                />
                {s}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Working Experience">
          <div className="space-y-4">
            {resume.experience.map((e) => (
              <div key={e.role} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-semibold text-slate-900">{e.role}</h3>
                  <span className="text-xs font-medium text-slate-500">{e.period}</span>
                </div>
                <p className="text-sm font-medium" style={{ color: ACCENT }}>
                  {e.org}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {e.points.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                      <span className="mt-[7px] size-1 shrink-0 rounded-full bg-slate-400" />
                      {p}
                    </li>
                  ))}
                </ul>
                {e.tools && (
                  <p className="mt-1.5 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Tools:</span> {e.tools}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Projects">
          <div className="space-y-4">
            {resume.projects.map((p) => (
              <div key={p.name} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-semibold text-slate-900">{p.name}</h3>
                  <span className="text-xs font-medium text-slate-500">{p.org}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{p.description}</p>
                {p.tools && (
                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Tools:</span> {p.tools}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Professional Training">
          <div className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {resume.training.map((t) => (
              <div key={t.title} className="break-inside-avoid">
                <h3 className="text-sm font-semibold text-slate-900">{t.title}</h3>
                <p className="text-sm text-slate-600">{t.org}</p>
                <p className="text-xs text-slate-500">{t.period}</p>
              </div>
            ))}
          </div>
        </Section>

        {resume.certifications.length > 0 && (
          <Section title="Certifications">
            <div className="space-y-3">
              {resume.certifications.map((c) => (
                <div key={c.name} className="break-inside-avoid">
                  <h3 className="text-sm font-semibold text-slate-900">{c.name}</h3>
                  <p className="text-sm text-slate-600">
                    {c.issuer} · {c.date}
                  </p>
                  {c.credentialId && (
                    <p className="text-xs text-slate-500">Credential ID: {c.credentialId}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title="Education">
          <div className="space-y-3">
            {resume.education.map((e) => (
              <div
                key={e.degree}
                className="flex flex-wrap items-baseline justify-between gap-x-4 break-inside-avoid"
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900">{e.degree}</h3>
                  <p className="text-sm text-slate-600">{e.org}</p>
                  {e.note && <p className="text-xs text-slate-500">{e.note}</p>}
                </div>
                <p className="shrink-0 text-xs font-medium text-slate-500">{e.period}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Other Skills">
          <div className="grid gap-3 sm:grid-cols-2">
            {resume.otherSkills.map((o) => (
              <div key={o.area} className="break-inside-avoid text-sm">
                <h3 className="font-semibold text-slate-900">{o.area}</h3>
                <p className="text-slate-600">{o.tools}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="References">
          <div className="grid gap-5 sm:grid-cols-2">
            {resume.references.map((r) => (
              <div key={r.name} className="break-inside-avoid text-sm">
                <h3 className="font-semibold text-slate-900">{r.name}</h3>
                <p className="text-slate-600">{r.title}</p>
                <p className="mt-1">
                  <span className="text-slate-500">Email:</span>{" "}
                  <a href={`mailto:${r.email}`} className={LINK}>
                    {r.email}
                  </a>
                </p>
                <p>
                  <span className="text-slate-500">Phone:</span>{" "}
                  <span className="text-slate-700">{r.phone}</span>
                </p>
              </div>
            ))}
          </div>
        </Section>
      </article>
    </div>
  );
}

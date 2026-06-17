import { Users, FolderGit2, Star, Code2, Github, Radio } from "lucide-react";
import type { GithubStats } from "@/lib/github";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";

export function Stats({ stats }: { stats: GithubStats }) {
  const cards = [
    { label: "Followers", value: stats.followers, icon: Users },
    { label: "Public Repos", value: stats.publicRepos, icon: FolderGit2 },
    { label: "Total Stars", value: stats.stars, icon: Star },
    { label: "Languages", value: stats.topLanguages.length, icon: Code2 },
  ];

  return (
    <div className="relative w-full">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Open Source"
          title="GitHub, by the numbers"
          description={
            stats.live
              ? "A live snapshot pulled straight from the GitHub API."
              : "A snapshot of open-source activity."
          }
        />

        <RevealGroup className="mt-12 grid grid-cols-2 gap-4 sm:mt-16 lg:grid-cols-4">
          {cards.map((c) => (
            <RevealItem key={c.label}>
              <div className="group relative h-full overflow-hidden rounded-2xl glass p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_-8px_var(--glow)]">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <c.icon className="size-6" />
                </span>
                <p className="mt-4 font-display text-[clamp(2rem,4vw,2.8rem)] font-bold text-primary">
                  <Counter value={c.value} />
                  {c.label !== "Languages" && "+"}
                </p>
                <p className="mt-1 text-sm font-medium text-tertiary">{c.label}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl glass p-6 sm:flex-row">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-medium text-secondary">Most-used languages:</span>
              {stats.topLanguages.map((lang) => (
                <span
                  key={lang}
                  className="rounded-full border border-border bg-primary/[0.03] px-3 py-1 text-xs font-medium text-primary"
                >
                  {lang}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {stats.live && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
                  <Radio className="size-3" /> Live
                </span>
              )}
              <a
                href="https://github.com/mihaduldev"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-brand-foreground transition-all hover:shadow-[var(--glow-md)]"
              >
                <Github className="size-4" /> @mihaduldev
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

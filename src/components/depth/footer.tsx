import Link from "next/link";
import { ArrowUp, Github, Linkedin, Mail, Globe } from "lucide-react";
import { navLinks, profile, socials } from "@/lib/data";

const iconMap = { Github, Linkedin, Mail, Globe } as const;

export function Footer() {
  return (
    <footer className="relative mt-10 px-4 pb-10">
      <div className="glass glow-ring mx-auto max-w-6xl overflow-hidden rounded-2xl p-8 sm:p-12">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Link href="#home" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-react-cyan text-xs font-bold text-brand-foreground">
                {profile.initials}
              </span>
              <span className="font-display text-base font-semibold text-primary">
                {profile.name}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-tertiary">
              {profile.headline}
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map((s) => {
                const Icon = iconMap[s.icon as keyof typeof iconMap] ?? Globe;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full glass text-secondary transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow-[var(--glow-sm)]"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-tertiary transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary">Connect</h3>
            <ul className="mt-4 space-y-2.5">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-tertiary transition-colors hover:text-accent"
                  >
                    {s.handle}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-tertiary">
            © {new Date().getFullYear()} {profile.fullName} · Crafted with Next.js &amp; Motion
          </p>
          <a
            href="#home"
            className="inline-flex items-center gap-2 text-xs font-medium text-secondary transition-colors hover:text-accent"
          >
            Back to top
            <span className="flex h-7 w-7 items-center justify-center rounded-full glass">
              <ArrowUp className="size-3.5" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

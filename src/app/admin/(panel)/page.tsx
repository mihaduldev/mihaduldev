import Link from "next/link";
import { FileText, FolderGit2, Briefcase, Mail, BarChart3, ArrowUpRight } from "lucide-react";
import { listAllPosts } from "@/server/db/posts";
import { listProjects } from "@/server/db/projects";
import { listExperiences } from "@/server/db/experiences";
import { listContacts, countContacts } from "@/server/db/contacts";
import { PageHeader, AdminCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function timeAgo(unix: number) {
  const s = Math.floor(Date.now() / 1000) - unix;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function Dashboard() {
  const [posts, projects, experiences, contactCount, contacts] = await Promise.all([
    listAllPosts(),
    listProjects(),
    listExperiences(),
    countContacts(),
    listContacts(),
  ]);

  const stats = [
    { label: "Blog posts", value: posts.length, icon: FileText, href: "/admin/blog" },
    { label: "Projects", value: projects.length, icon: FolderGit2, href: "/admin/projects" },
    { label: "Focus areas", value: experiences.length, icon: Briefcase, href: "/admin/experience" },
    { label: "Contacts", value: contactCount, icon: Mail, href: "/admin/contacts" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your site content and inquiries." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <AdminCard className="transition-transform hover:-translate-y-0.5">
              <s.icon className="size-5 text-accent" />
              <p className="mt-3 font-display text-3xl font-bold text-primary">{s.value}</p>
              <p className="mt-0.5 text-sm text-tertiary">{s.label}</p>
            </AdminCard>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <AdminCard>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-primary">Recent contacts</h2>
            <Link href="/admin/contacts" className="text-xs font-medium text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 divide-y divide-border">
            {contacts.length === 0 && (
              <p className="py-6 text-sm text-tertiary">No submissions yet.</p>
            )}
            {contacts.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-primary">{c.name}</p>
                  <p className="truncate text-xs text-tertiary">{c.email}</p>
                </div>
                <span className="shrink-0 text-xs text-tertiary">{timeAgo(c.createdAt)}</span>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <BarChart3 className="size-5 text-accent" />
          <h2 className="mt-3 font-semibold text-primary">Visitor analytics</h2>
          <p className="mt-1 text-sm leading-relaxed text-tertiary">
            Privacy-friendly traffic, visitors, top pages, referrers and countries
            are tracked via Cloudflare Web Analytics.
          </p>
          <a
            href="https://dash.cloudflare.com/?to=/:account/web-analytics"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-brand-foreground transition-all hover:shadow-[var(--glow-md)]"
          >
            Open analytics dashboard
            <ArrowUpRight className="size-4" />
          </a>
        </AdminCard>
      </div>
    </div>
  );
}

import { BarChart3, ArrowUpRight, Globe, Users, MousePointerClick, Map } from "lucide-react";
import { PageHeader, AdminCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const metrics = [
  { icon: MousePointerClick, label: "Page views & visits over time" },
  { icon: Users, label: "Unique visitors" },
  { icon: Globe, label: "Top pages & referrers" },
  { icon: Map, label: "Countries & devices" },
];

export default function AnalyticsAdmin() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Privacy-friendly visitor analytics via Cloudflare Web Analytics."
      />

      <AdminCard className="max-w-2xl">
        <BarChart3 className="size-6 text-accent" />
        <h2 className="mt-3 font-display text-xl font-semibold text-primary">
          Cloudflare Web Analytics
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-tertiary">
          The public site loads a lightweight, cookie-less analytics beacon. Your
          full report — traffic, visitors, top content, referrers, and geography —
          lives in the Cloudflare dashboard.
        </p>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {metrics.map((m) => (
            <li key={m.label} className="flex items-center gap-2.5 text-sm text-secondary">
              <m.icon className="size-4 text-accent" />
              {m.label}
            </li>
          ))}
        </ul>

        <a
          href="https://dash.cloudflare.com/?to=/:account/web-analytics"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-brand-foreground transition-all hover:shadow-[var(--glow-md)]"
        >
          Open Cloudflare Web Analytics
          <ArrowUpRight className="size-4" />
        </a>

        <div className="mt-6 rounded-xl border border-border bg-white/[0.03] p-4 text-xs leading-relaxed text-tertiary">
          <p className="font-medium text-secondary">Setup (one time)</p>
          <p className="mt-1">
            In Cloudflare → Analytics → Web Analytics, add this site, copy the
            <span className="font-mono text-accent"> beacon token</span>, and set
            <span className="font-mono text-accent"> NEXT_PUBLIC_CF_BEACON</span> (in
            <span className="font-mono"> .dev.vars</span> locally / Worker vars in
            production). The beacon then activates automatically.
          </p>
        </div>
      </AdminCard>
    </div>
  );
}

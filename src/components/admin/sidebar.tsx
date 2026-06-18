"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FolderGit2,
  Boxes,
  Quote,
  FileText,
  MessageSquare,
  Bot,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/projects", label: "Projects", icon: FolderGit2 },
  { href: "/admin/skills", label: "Skills", icon: Boxes },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/conversations", label: "Leads", icon: Bot },
  { href: "/admin/contacts", label: "Contacts", icon: Mail },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 z-20 flex h-auto shrink-0 flex-row items-center gap-1 overflow-x-auto border-b border-border bg-wash/80 px-3 py-3 backdrop-blur md:h-[100svh] md:w-60 md:flex-col md:items-stretch md:overflow-visible md:border-b-0 md:border-r md:px-4 md:py-6">
      <Link href="/admin" className="mb-0 flex shrink-0 items-center gap-2.5 md:mb-8 md:px-2">
        <BrandMark className="h-9 w-9" />
        <span className="hidden font-display text-sm font-semibold text-primary md:block">
          Admin Panel
        </span>
      </Link>

      <nav className="flex flex-row gap-1 md:flex-1 md:flex-col">
        {items.map((it) => {
          const active = it.href === "/admin" ? pathname === it.href : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent/15 text-accent"
                  : "text-secondary hover:bg-card hover:text-primary"
              )}
            >
              <it.icon className="size-4" />
              <span className="hidden sm:inline">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-1 md:flex-col md:items-stretch md:gap-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-card hover:text-primary"
        >
          <ExternalLink className="size-4" />
          <span className="hidden sm:inline">View site</span>
        </Link>
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-card hover:text-red-400"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

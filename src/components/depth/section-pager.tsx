"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Item = { id: string; label: string };

/** Right-margin pager — the wayfinding for the paged deck. Tracks the active
 *  panel with an IntersectionObserver and jumps on click. Hidden under md. */
export function SectionPager({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const nodes = items
      .map((i) => document.getElementById(i.id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { threshold: 0.55 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [items]);

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <nav
      aria-label="Sections"
      className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex"
    >
      {items.map((it) => {
        const on = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => go(it.id)}
            className="group flex items-center justify-end gap-2.5"
            aria-label={it.label}
            aria-current={on}
          >
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider transition-all duration-300",
                on
                  ? "translate-x-0 text-accent opacity-100"
                  : "translate-x-1 text-tertiary opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
              )}
            >
              {it.label}
            </span>
            <span
              className={cn(
                "rounded-full transition-all duration-300",
                on
                  ? "h-2 w-2 bg-accent shadow-[var(--glow-sm)]"
                  : "h-1.5 w-1.5 bg-tertiary/50 group-hover:bg-accent/70"
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}

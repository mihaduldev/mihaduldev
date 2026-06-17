"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

/** Admin list page size — first page is server-rendered, the rest stream in. */
export const ADMIN_PAGE_SIZE = 20;

/**
 * Generic infinite-scroll list for admin tables. The first page is rendered on
 * the server; further pages auto-load as a sentinel scrolls into view (with a
 * manual "Load more" fallback). `loadMore` is an admin-guarded server action
 * returning the next page; `render` produces each row.
 */
export function InfiniteList<T extends { id: number }>({
  initial,
  total,
  pageSize = ADMIN_PAGE_SIZE,
  loadMore,
  render,
}: {
  initial: T[];
  total: number;
  pageSize?: number;
  loadMore: (offset: number) => Promise<T[]>;
  render: (item: T) => React.ReactNode;
}) {
  const [items, setItems] = useState<T[]>(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initial.length >= total);
  const [err, setErr] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  async function more() {
    if (loading || done) return;
    setLoading(true);
    setErr(false);
    try {
      const next = await loadMore(items.length);
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev, ...next.filter((n) => !seen.has(n.id))];
        if (next.length < pageSize || merged.length >= total) setDone(true);
        return merged;
      });
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (done) return;
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) more();
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, items.length, loading]);

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <Fragment key={it.id}>{render(it)}</Fragment>
      ))}

      {!done && (
        <div ref={sentinel} className="flex justify-center py-3">
          <button
            type="button"
            onClick={more}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {err ? "Retry" : loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      {done && items.length > pageSize && (
        <p className="py-2 text-center text-xs text-tertiary">
          End of list · {items.length} total
        </p>
      )}
    </div>
  );
}

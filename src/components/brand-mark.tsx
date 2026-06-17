import { Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mihadul's brand logomark — a `</>` code glyph in a rounded-square gradient
 * tile (brand → react-cyan) with a soft glow. One source of truth for the logo
 * across the nav, footer, and admin panel. Pair with the "Mihadul Islam"
 * wordmark for the full lockup. Decorative tile; the link/label carries the
 * accessible name.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand to-react-cyan text-brand-foreground glow-soft",
        className
      )}
    >
      {/* subtle top sheen for depth */}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
      <Code2 className="relative size-[58%]" strokeWidth={2.4} />
    </span>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const field =
  "w-full rounded-lg border border-border bg-white/[0.03] px-3 py-2 text-sm text-primary outline-none transition-colors placeholder:text-tertiary focus:border-accent";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-tertiary">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl glass p-6", className)}>{children}</div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-tertiary">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-tertiary/80">{hint}</span>}
    </label>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-brand-foreground transition-all hover:shadow-[var(--glow-md)]"
    >
      {children}
    </button>
  );
}

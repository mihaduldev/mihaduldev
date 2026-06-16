"use client";

export function ConfirmButton({
  children,
  message = "Delete this item? This cannot be undone.",
  className,
}: {
  children: React.ReactNode;
  message?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={
        className ??
        "rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-tertiary transition-colors hover:border-red-400/40 hover:text-red-400"
      }
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

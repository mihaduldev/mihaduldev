"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/** Submit button that shows a pending spinner while the server action runs. */
export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-brand-foreground transition-all hover:shadow-[var(--glow-md)] disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Saving…
        </>
      ) : (
        children
      )}
    </button>
  );
}

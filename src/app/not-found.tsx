import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[82svh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-7xl font-bold text-gradient-cyan glow-text sm:text-9xl">
        404
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-primary sm:text-3xl">
        Lost in space
      </h1>
      <p className="mt-3 max-w-md text-tertiary">
        This page drifted out of orbit — it doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-brand-foreground transition-all hover:shadow-[var(--glow-lg)]"
        >
          <Home className="size-4" />
          Go home
        </Link>
        <Link
          href="/blog"
          className="inline-flex h-11 items-center gap-2 rounded-full glass px-6 text-sm font-semibold text-primary transition-all hover:shadow-[var(--glow-md)]"
        >
          <ArrowLeft className="size-4" />
          Read the blog
        </Link>
      </div>
    </div>
  );
}

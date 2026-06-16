"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace("/admin");
        router.refresh();
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100svh] items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl glass glow-ring p-8"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <Lock className="size-5" />
        </span>
        <h1 className="mt-5 text-center font-display text-2xl font-bold text-primary">
          Admin access
        </h1>
        <p className="mt-1 text-center text-sm text-tertiary">
          Enter your password to continue.
        </p>

        <div className="mt-6">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            className="w-full rounded-xl border border-border bg-white/[0.03] px-4 py-3 text-sm text-primary outline-none transition-colors placeholder:text-tertiary focus:border-accent"
          />
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-brand-foreground transition-all hover:shadow-[var(--glow-lg)] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Enter <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

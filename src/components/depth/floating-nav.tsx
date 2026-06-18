"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Moon, Sun, ArrowUpRight, Lock, Unlock } from "lucide-react";
import { navLinks, profile } from "@/lib/data";
import { getAdminStatus, adminLogout } from "@/app/actions/admin";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-card hover:text-accent"
    >
      {mounted ? (
        isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />
      ) : (
        <span className="size-[18px]" />
      )}
    </button>
  );
}

/** Tracks the section currently in view. Observes EVERY panel (not just the
 *  linked ones) so the highlight reflects the true current section — and clears
 *  when you're on a section with no nav link (GitHub / Praise / Ethos) instead
 *  of sticking on the previous link. */
function useActiveSection() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-panel]"));
    if (!nodes.length) return;
    // Center-line band (not a visibility %): the active section is whichever
    // crosses the viewport middle. Works for sections taller than the viewport
    // (e.g. Experience), which can never hit a 50% threshold.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return active;
}

export function FloatingNav() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const active = useActiveSection();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Detect an admin session so the lock toggles to an "unlock = log out" state.
  useEffect(() => {
    getAdminStatus().then(setLoggedIn).catch(() => {});
  }, []);

  async function handleLogout() {
    await adminLogout();
    if (typeof window !== "undefined") window.location.reload();
  }

  return (
    <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-4 sm:top-5">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        aria-label="Primary"
        className="nav-glass glow-soft flex w-full max-w-3xl items-center justify-between rounded-full py-2 pl-2.5 pr-2.5 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.55)] ring-1 ring-black/[0.03] dark:ring-white/[0.04]"
      >
        <Link
          href="#home"
          className="flex shrink-0 items-center gap-2.5 rounded-full pl-1 pr-1"
          aria-label={`${profile.name} — home`}
        >
          <BrandMark className="h-8 w-8" />
          <span className="hidden font-display text-sm font-semibold text-primary sm:block">
            {profile.name}
          </span>
        </Link>

        <ul className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((l) => {
            const on = active === l.href.slice(1);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={on ? "true" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm transition-colors",
                    on
                      ? "bg-accent/12 font-medium text-accent"
                      : "text-secondary hover:bg-card hover:text-primary"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          {loggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out of admin"
              title="Logged in — click to log out"
              className="flex h-9 w-9 items-center justify-center rounded-full text-accent transition-colors hover:bg-card hover:text-red-400"
            >
              <Unlock className="size-[17px]" />
            </button>
          ) : (
            <Link
              href="/admin"
              aria-label="Admin login"
              title="Admin"
              className="flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-card hover:text-accent"
            >
              <Lock className="size-[17px]" />
            </Link>
          )}
          <ThemeToggle />
          <Link
            href="#contact"
            className="hidden h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-semibold text-brand-foreground shadow-[var(--glow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--glow-md)] sm:inline-flex"
          >
            Connect
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-card hover:text-primary md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-wash/70 backdrop-blur-md" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              className="glass absolute inset-x-4 top-20 rounded-3xl p-3"
            >
              <ul className="flex flex-col">
                {navLinks.map((l, i) => {
                  const on = active === l.href.slice(1);
                  return (
                    <motion.li
                      key={l.href}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.04 * i }}
                    >
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        aria-current={on ? "true" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-4 py-3.5 text-base transition-colors",
                          on ? "bg-accent/12 font-medium text-accent" : "text-secondary hover:bg-card hover:text-primary"
                        )}
                      >
                        {l.label}
                        <ArrowUpRight className="size-4 text-tertiary" />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
              <Link
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-accent text-sm font-semibold text-brand-foreground"
              >
                Connect
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

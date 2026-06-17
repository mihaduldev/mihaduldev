"use client";

import { useEffect } from "react";
import type { ScrollSettings, ScrollEasing } from "@/server/db/settings";

/**
 * Paced section deck (desktop, fine-pointer, motion-on only), driven by the
 * admin scroll settings:
 *   - mode "glide": at a section edge, the next scroll glides to the next one
 *     over `durationMs` with the chosen easing curve.
 *   - mode "snap": jump instantly between sections.
 *   - mode "native": disable the deck — normal browser scrolling.
 * Touch / small screens / reduced-motion always fall back to native scrolling.
 */
const EASE: Record<ScrollEasing, (t: number) => number> = {
  // zero velocity AND acceleration at both ends → buttery, no jerk
  smootherstep: (t) => t * t * t * (t * (6 * t - 15) + 10),
  easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  linear: (t) => t,
};

export function SnapController({ settings }: { settings: ScrollSettings }) {
  useEffect(() => {
    const root = document.documentElement;
    const big = window.matchMedia("(min-width: 768px)");
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const { mode, durationMs } = settings;
    const ease = EASE[settings.easing] ?? EASE.smootherstep;

    let enabled = false;
    let animating = false;
    let lockUntil = 0;
    let raf = 0;

    const panels = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-panel], footer"));

    function currentIndex(list: HTMLElement[]) {
      const mid = window.innerHeight / 2;
      for (let i = 0; i < list.length; i++) {
        const r = list[i].getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) return i;
      }
      let idx = 0;
      let best = Infinity;
      list.forEach((el, i) => {
        const d = Math.abs(el.getBoundingClientRect().top);
        if (d < best) {
          best = d;
          idx = i;
        }
      });
      return idx;
    }

    function animateTo(y: number) {
      // Instant snap — jump immediately, no rAF glide.
      if (mode === "snap") {
        window.scrollTo({ top: y, behavior: "auto" });
        lockUntil = performance.now() + 360;
        return;
      }
      animating = true;
      // Disable CSS smooth scroll + pause paint-heavy bg animations during the
      // rAF glide so it owns the main thread (no doubled/juddery motion).
      const prevBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      root.setAttribute("data-scrolling", "");
      const startY = window.scrollY;
      const dist = y - startY;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = durationMs > 0 ? Math.min((ts - start) / durationMs, 1) : 1;
        window.scrollTo(0, startY + dist * ease(p));
        if (p < 1) raf = requestAnimationFrame(step);
        else {
          animating = false;
          lockUntil = performance.now() + 360; // cooldown so trackpad inertia can't double-advance
          root.style.scrollBehavior = prevBehavior;
          root.removeAttribute("data-scrolling");
        }
      };
      raf = requestAnimationFrame(step);
    }

    function go(dir: number) {
      const list = panels();
      const cur = currentIndex(list);
      const target = Math.max(0, Math.min(list.length - 1, cur + dir));
      if (target === cur) return;
      animateTo(list[target].getBoundingClientRect().top + window.scrollY);
    }

    function onWheel(e: WheelEvent) {
      if (!enabled) return;
      // Overlays that scroll internally (e.g. the chat widget) opt out so the
      // wheel scrolls THEM natively, not the page.
      const t = e.target as Element | null;
      if (t && t.closest("[data-scroll-isolate]")) return;
      if (animating || performance.now() < lockUntil) {
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < 4) return;
      const list = panels();
      const el = list[currentIndex(list)];
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const SLACK = 140;
      if (e.deltaY > 0) {
        if (r.bottom > vh + SLACK) return; // substantial content below → read it
        e.preventDefault();
        go(1);
      } else {
        if (r.top < -SLACK) return; // substantial content above → read it
        e.preventDefault();
        go(-1);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (!enabled || animating) return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      }
    }

    function apply() {
      enabled = mode !== "native" && big.matches && fine.matches && !reduce.matches;
      if (enabled) root.setAttribute("data-snap", "");
      else root.removeAttribute("data-snap");
    }

    apply();
    big.addEventListener("change", apply);
    fine.addEventListener("change", apply);
    reduce.addEventListener("change", apply);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      root.removeAttribute("data-snap");
      root.removeAttribute("data-scrolling");
      big.removeEventListener("change", apply);
      fine.removeEventListener("change", apply);
      reduce.removeEventListener("change", apply);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [settings]);

  return null;
}

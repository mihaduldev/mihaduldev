"use client";

import { useEffect } from "react";

/**
 * Paced section deck (desktop, fine-pointer, motion-on only).
 *
 * Instead of CSS scroll-snap (which is either too aggressive = mandatory, or
 * too loose = proximity), this gives a controlled feel:
 *   - Scroll naturally WITHIN a section — if it's taller than the screen you
 *     can read all the way to its bottom.
 *   - Once you're at the section's edge, the next scroll glides to the next
 *     section over a fixed, easeable duration (deliberate, easy to follow).
 * Touch / small screens / reduced-motion fall back to plain native scrolling.
 */
const DURATION = 1000; // ms — bump down for snappier, up for slower/calmer

export function SnapController() {
  useEffect(() => {
    const root = document.documentElement;
    const big = window.matchMedia("(min-width: 768px)");
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

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
      // fallback: nearest top to viewport top
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
      animating = true;
      // Disable CSS smooth scroll during our rAF glide, otherwise the browser
      // also smooth-scrolls to each frame's target → doubled/juddery motion.
      const prevBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      const startY = window.scrollY;
      const dist = y - startY;
      let start: number | null = null;
      const ease = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / DURATION, 1);
        window.scrollTo(0, startY + dist * ease(p));
        if (p < 1) raf = requestAnimationFrame(step);
        else {
          animating = false;
          lockUntil = performance.now() + 140; // brief cooldown vs. inertia
          root.style.scrollBehavior = prevBehavior;
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
      if (animating || performance.now() < lockUntil) {
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < 4) return;
      const list = panels();
      const el = list[currentIndex(list)];
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (e.deltaY > 0) {
        if (r.bottom > vh + 8) return; // more of this section below → read it
        e.preventDefault();
        go(1);
      } else {
        if (r.top < -8) return; // more above → read it
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
      enabled = big.matches && fine.matches && !reduce.matches;
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
      big.removeEventListener("change", apply);
      fine.removeEventListener("change", apply);
      reduce.removeEventListener("change", apply);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}

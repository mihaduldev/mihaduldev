import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * Cursor parallax for layered depth. Tracks the pointer within a container and
 * returns spring-damped, normalized motion values in [-0.5, 0.5] (0,0 at rest /
 * center). Layers drive their own translate/rotate via useTransform off these.
 *
 * Inert under prefers-reduced-motion and on coarse pointers (touch), matching
 * the rest of the site's motion gating — transform-only, so it's GPU-cheap.
 */
export function usePointerParallax<T extends HTMLElement = HTMLDivElement>() {
  const reduce = useReducedMotion();
  const ref = useRef<T>(null);
  const mxRaw = useMotionValue(0);
  const myRaw = useMotionValue(0);
  const cfg = { stiffness: 60, damping: 18, mass: 0.6 } as const;
  const mx = useSpring(mxRaw, cfg);
  const my = useSpring(myRaw, cfg);

  useEffect(() => {
    if (reduce || typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      mxRaw.set((e.clientX - r.left) / r.width - 0.5);
      myRaw.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => {
      mxRaw.set(0);
      myRaw.set(0);
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce, mxRaw, myRaw]);

  return { ref, mx, my };
}

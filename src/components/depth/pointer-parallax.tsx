"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import {
  useMotionValue,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

/**
 * A single, page-wide pointer field. One window listener feeds spring-damped,
 * normalized motion values in [-0.5, 0.5] (0,0 at center), shared via context so
 * every parallax layer — hero, ambient orbs, section numerals — reacts to the
 * same cursor with consistent depth. Transform-only and GPU-cheap; inert under
 * reduced-motion and on coarse pointers (touch).
 */
type PointerField = { mx: MotionValue<number>; my: MotionValue<number> };

const PointerCtx = createContext<PointerField | null>(null);

export function PointerParallaxProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const mxRaw = useMotionValue(0);
  const myRaw = useMotionValue(0);
  const cfg = { stiffness: 55, damping: 18, mass: 0.7 } as const;
  const mx = useSpring(mxRaw, cfg);
  const my = useSpring(myRaw, cfg);

  useEffect(() => {
    if (reduce || typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      mxRaw.set(e.clientX / window.innerWidth - 0.5);
      myRaw.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mxRaw, myRaw]);

  return <PointerCtx.Provider value={{ mx, my }}>{children}</PointerCtx.Provider>;
}

/** Shared pointer springs. Returns inert zero values outside a provider. */
export function usePointer(): PointerField {
  const ctx = useContext(PointerCtx);
  const zx = useMotionValue(0);
  const zy = useMotionValue(0);
  return ctx ?? { mx: zx, my: zy };
}

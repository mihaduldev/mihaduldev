"use client";

import {
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Counts up from 0 to `value` once it scrolls into view. */
export function Counter({
  value,
  suffix = "",
  prefix = "",
  duration = 1.6,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    // brief settle so the count-up starts after the card's reveal, not mid-slide
    const id = setTimeout(() => motionValue.set(value), 60);
    return () => clearTimeout(id);
  }, [inView, value, motionValue]);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const unsub = spring.on("change", (latest) => {
      setDisplay(Math.round(latest));
    });
    return () => unsub();
  }, [spring, reduce, value]);

  return (
    <span ref={ref}>
      {prefix}
      {(reduce ? value : display).toLocaleString()}
      {suffix}
    </span>
  );
}

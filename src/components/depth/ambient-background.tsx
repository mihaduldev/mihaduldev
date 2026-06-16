"use client";

import { useEffect, useRef } from "react";

/** Fixed depth backdrop: slow-drifting blurred orbs + a faint grain layer,
 *  with a subtle pointer parallax. Sits behind all content. */
export function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.05;
      cur.y += (target.y - cur.y) * 0.05;
      el.style.transform = `translate3d(${cur.x * 18}px, ${cur.y * 18}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div ref={ref} className="absolute inset-[-10%]">
        <span
          className="absolute left-[8%] top-[6%] h-[42rem] w-[42rem] rounded-full opacity-40 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle at center, var(--glow), transparent 62%)",
            animation: "drift 26s ease-in-out infinite",
          }}
        />
        <span
          className="absolute right-[4%] top-[34%] h-[36rem] w-[36rem] rounded-full opacity-30 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle at center, var(--brand), transparent 62%)",
            animation: "drift 32s ease-in-out infinite reverse",
          }}
        />
        <span
          className="absolute bottom-[2%] left-[40%] h-[34rem] w-[34rem] rounded-full opacity-25 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle at center, var(--react-cyan), transparent 62%)",
            animation: "drift 38s ease-in-out infinite",
          }}
        />
      </div>
      <div className="grain absolute inset-0" />
    </div>
  );
}

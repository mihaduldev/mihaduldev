"use client";

import { motion, useTransform } from "motion/react";
import { usePointer } from "@/components/depth/pointer-parallax";

/** Fixed depth backdrop: slow-drifting blurred orbs + a faint grain layer, split
 *  into two parallax depths off the shared pointer field so the whole page has a
 *  subtle sense of space behind the content. */
export function AmbientBackground() {
  const { mx, my } = usePointer();
  // two depths — far drifts less, near drifts more (with the cursor)
  const farX = useTransform(mx, (v) => v * 24);
  const farY = useTransform(my, (v) => v * 24);
  const nearX = useTransform(mx, (v) => v * 48);
  const nearY = useTransform(my, (v) => v * 48);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div className="absolute inset-[-14%]" style={{ x: farX, y: farY }}>
        <span
          className="absolute left-[8%] top-[6%] h-[42rem] w-[42rem] rounded-full opacity-40 blur-[120px]"
          style={{
            background: "radial-gradient(circle at center, var(--glow), transparent 62%)",
            animation: "drift 26s ease-in-out infinite",
          }}
        />
        <span
          className="absolute right-[4%] top-[34%] h-[36rem] w-[36rem] rounded-full opacity-30 blur-[120px]"
          style={{
            background: "radial-gradient(circle at center, var(--brand), transparent 62%)",
            animation: "drift 32s ease-in-out infinite reverse",
          }}
        />
      </motion.div>
      <motion.div className="absolute inset-[-14%]" style={{ x: nearX, y: nearY }}>
        <span
          className="absolute bottom-[2%] left-[40%] h-[34rem] w-[34rem] rounded-full opacity-25 blur-[120px]"
          style={{
            background: "radial-gradient(circle at center, var(--react-cyan), transparent 62%)",
            animation: "drift 38s ease-in-out infinite",
          }}
        />
      </motion.div>
      <div className="grain absolute inset-0" />
    </div>
  );
}

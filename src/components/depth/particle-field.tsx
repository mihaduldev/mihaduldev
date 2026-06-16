"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; tx: number; ty: number; vx: number; vy: number };

/**
 * Canvas particle field that assembles the given text (initials) out of
 * glowing points. Points spring to their target, drift gently, and scatter
 * away from the pointer — then settle back. Additive "lighter" blending of a
 * cached glow sprite keeps ~1.5k particles smooth. Static under reduced-motion.
 */
export function ParticleField({ text = "MI" }: { text?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctxMaybe = canvasEl.getContext("2d", { alpha: true });
    if (!ctxMaybe) return;
    // explicit non-null types so the nested closures below keep narrowing
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = ctxMaybe;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cyan = "rgba(97,218,251,1)";

    // cached glow sprite
    const sprite = document.createElement("canvas");
    const ss = 24;
    sprite.width = sprite.height = ss;
    const sctx = sprite.getContext("2d")!;
    const grad = sctx.createRadialGradient(ss / 2, ss / 2, 0, ss / 2, ss / 2, ss / 2);
    grad.addColorStop(0, "rgba(120,225,255,0.6)");
    grad.addColorStop(0.45, "rgba(88,196,220,0.26)");
    grad.addColorStop(1, "rgba(88,196,220,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, ss, ss);

    let particles: P[] = [];
    let w = 0;
    let h = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    function buildTargets() {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // render text to an offscreen buffer and sample opaque pixels
      const buf = document.createElement("canvas");
      buf.width = Math.floor(w);
      buf.height = Math.floor(h);
      const bctx = buf.getContext("2d")!;
      const fontSize = Math.min(w * 0.42, h * 0.82);
      bctx.fillStyle = "#fff";
      bctx.font = `800 ${fontSize}px "Space Grotesk", system-ui, sans-serif`;
      bctx.textAlign = "center";
      bctx.textBaseline = "middle";
      bctx.fillText(text, w / 2, h / 2);

      const img = bctx.getImageData(0, 0, buf.width, buf.height).data;
      const targets: { x: number; y: number }[] = [];
      const dense = w < 640 ? 7 : 5;
      for (let y = 0; y < buf.height; y += dense) {
        for (let x = 0; x < buf.width; x += dense) {
          const a = img[(y * buf.width + x) * 4 + 3];
          if (a > 128) targets.push({ x, y });
        }
      }

      // map particles to targets (reuse existing where possible)
      particles = targets.map((t, i) => {
        const prev = particles[i];
        return {
          tx: t.x,
          ty: t.y,
          x: prev ? prev.x : Math.random() * w,
          y: prev ? prev.y : Math.random() * h,
          vx: 0,
          vy: 0,
        };
      });

      if (reduce) drawStatic();
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) ctx.drawImage(sprite, p.tx - 4, p.ty - 4, 8, 8);
      ctx.globalCompositeOperation = "source-over";
    }

    let raf = 0;
    let t = 0;
    function frame() {
      t += 0.01;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const R = 110;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // spring to target (+ a touch of idle sway)
        const tx = p.tx + Math.sin(t + i) * 1.4;
        const ty = p.ty + Math.cos(t * 0.9 + i) * 1.4;
        p.vx += (tx - p.x) * 0.012;
        p.vy += (ty - p.y) * 0.012;
        // pointer repulsion
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const f = ((R - d) / R) * 5.5;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;
        const size = 5;
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    buildTargets();
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerout", onLeave);
      raf = requestAnimationFrame(frame);
    }
    const ro = new ResizeObserver(() => buildTargets());
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      ro.disconnect();
    };
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
    />
  );
}

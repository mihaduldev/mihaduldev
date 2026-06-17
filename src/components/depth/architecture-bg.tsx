import { memo } from "react";

/**
 * Abstract backend/system-architecture backdrop for the hero.
 *
 * Glowing nodes (client → gateway → services → db / queue → worker, plus cloud
 * & AI branches) connected by thin lines, with subtle "data flow" dashes and a
 * very faint "MI" monogram watermark. Deliberately abstract — no labels, no
 * literal diagram — at low opacity behind a radial fade mask so it supports the
 * hero content without competing. Purely CSS-animated (pauses under
 * prefers-reduced-motion via the global rule in globals.css). Decorative only.
 */
type Node = { id: string; x: number; y: number; s?: number };

// Positions in a 1000×600 user space, concentrated centre-right so the radial
// mask can fade them out behind the left-hand text.
const N: Record<string, Node> = {
  client: { id: "client", x: 372, y: 168 },
  gateway: { id: "gateway", x: 508, y: 300, s: 42 },
  svcA: { id: "svcA", x: 648, y: 150 },
  svcB: { id: "svcB", x: 660, y: 408 },
  db: { id: "db", x: 856, y: 236, s: 44 },
  queue: { id: "queue", x: 566, y: 472 },
  worker: { id: "worker", x: 792, y: 470 },
  cloud: { id: "cloud", x: 866, y: 96 },
  ai: { id: "ai", x: 888, y: 366, s: 42 },
};

const EDGES: [string, string][] = [
  ["client", "gateway"],
  ["gateway", "svcA"],
  ["gateway", "svcB"],
  ["svcA", "db"],
  ["svcA", "cloud"],
  ["svcB", "ai"],
  ["svcB", "queue"],
  ["queue", "worker"],
  ["worker", "db"],
];

const nodes = Object.values(N);

export const ArchitectureBackground = memo(function ArchitectureBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-40 sm:opacity-[0.55]"
      style={{
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 84% at 70% 42%, #000 0%, #000 34%, transparent 74%)",
        maskImage:
          "radial-gradient(ellipse 80% 84% at 70% 42%, #000 0%, #000 34%, transparent 74%)",
      }}
    >
      {/* faint MI monogram, combined with the architecture as a subtle watermark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="select-none font-display text-[40vw] font-bold leading-none tracking-tighter sm:text-[30vw] lg:text-[24vw]"
          style={{ color: "color-mix(in srgb, var(--glow) 5%, transparent)" }}
        >
          MI
        </span>
      </div>

      <svg
        className="h-full w-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        style={{ color: "var(--glow)" }}
      >
        <defs>
          <filter id="archGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* base connections */}
        <g stroke="currentColor" strokeOpacity={0.16} strokeWidth={1}>
          {EDGES.map(([a, b]) => (
            <line key={`b-${a}-${b}`} x1={N[a].x} y1={N[a].y} x2={N[b].x} y2={N[b].y} />
          ))}
        </g>

        {/* travelling "data flow" dashes over the connections */}
        <g stroke="currentColor" strokeOpacity={0.42} strokeWidth={1.4} strokeLinecap="round">
          {EDGES.map(([a, b], i) => (
            <line
              key={`f-${a}-${b}`}
              x1={N[a].x}
              y1={N[a].y}
              x2={N[b].x}
              y2={N[b].y}
              className="arch-flow"
              style={{ animationDelay: `${(i % 5) * 0.6}s` }}
            />
          ))}
        </g>

        {/* nodes: soft glow halo + glassy rounded chip + core dot */}
        {nodes.map((n, i) => {
          const s = n.s ?? 32;
          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={s * 0.92}
                fill="currentColor"
                fillOpacity={0.12}
                filter="url(#archGlow)"
                className="arch-pulse"
                style={{ animationDelay: `${(i % 4) * 1.1}s` }}
              />
              <rect
                x={n.x - s / 2}
                y={n.y - s / 2}
                width={s}
                height={s}
                rx={s * 0.32}
                stroke="currentColor"
                strokeOpacity={0.4}
                strokeWidth={1.2}
                style={{ fill: "var(--wash)", fillOpacity: 0.45 }}
              />
              <circle cx={n.x} cy={n.y} r={2.6} fill="currentColor" fillOpacity={0.9} />
            </g>
          );
        })}
      </svg>
    </div>
  );
});

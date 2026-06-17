import { memo } from "react";

/**
 * Abstract backend/system-architecture backdrop for the hero.
 *
 * Glowing nodes (client → gateway → services → db / queue → worker, plus cloud
 * & AI branches) connected by thin lines, with luminous "data packets" that
 * travel the connections, sonar ping rings on the hub nodes, and a soft node
 * breathe — a living-system feel without a literal diagram. Low opacity behind
 * a radial fade mask so it never competes with the hero text. Purely CSS-driven
 * (compositor-friendly transform/opacity); pauses under prefers-reduced-motion
 * and during section glides (html[data-scrolling]). Decorative only.
 */
type Node = { id: string; x: number; y: number; s?: number; ping?: boolean };

// Positions in a 1000×600 user space, concentrated centre-right so the radial
// mask can fade them out behind the left-hand text.
const N: Record<string, Node> = {
  client: { id: "client", x: 372, y: 168 },
  gateway: { id: "gateway", x: 508, y: 300, s: 42, ping: true },
  svcA: { id: "svcA", x: 648, y: 150 },
  svcB: { id: "svcB", x: 660, y: 408 },
  db: { id: "db", x: 856, y: 236, s: 44, ping: true },
  queue: { id: "queue", x: 566, y: 472 },
  worker: { id: "worker", x: 792, y: 470 },
  cloud: { id: "cloud", x: 866, y: 96 },
  ai: { id: "ai", x: 888, y: 366, s: 42, ping: true },
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
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-45 sm:opacity-[0.6]"
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
          {/* theme-aware so packets read on both the dark and light hero stage */}
          <radialGradient id="archPacket">
            <stop offset="0%" style={{ stopColor: "var(--hero-particle)", stopOpacity: 0.95 }} />
            <stop offset="45%" style={{ stopColor: "var(--glow)", stopOpacity: 0.45 }} />
            <stop offset="100%" style={{ stopColor: "var(--glow)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* connections */}
        <g stroke="currentColor" strokeOpacity={0.16} strokeWidth={1}>
          {EDGES.map(([a, b]) => (
            <line key={`b-${a}-${b}`} x1={N[a].x} y1={N[a].y} x2={N[b].x} y2={N[b].y} />
          ))}
        </g>

        {/* luminous data packets travelling each connection (A → B) */}
        {EDGES.map(([a, b], i) => {
          const dx = N[b].x - N[a].x;
          const dy = N[b].y - N[a].y;
          return (
            <circle
              key={`p-${a}-${b}`}
              cx={N[a].x}
              cy={N[a].y}
              r={6}
              fill="url(#archPacket)"
              className="arch-packet"
              style={
                {
                  "--dx": `${dx}px`,
                  "--dy": `${dy}px`,
                  "--dur": `${3.6 + (i % 4) * 0.5}s`,
                  "--delay": `${(i * 0.55) % 3.2}s`,
                } as React.CSSProperties
              }
            />
          );
        })}

        {/* sonar ping rings on hub nodes */}
        {nodes
          .filter((n) => n.ping)
          .map((n, i) => (
            <circle
              key={`ring-${n.id}`}
              cx={n.x}
              cy={n.y}
              r={(n.s ?? 32) / 2}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              className="arch-ping"
              style={
                { "--dur": `${4.5 + i * 0.6}s`, "--delay": `${i * 1.3}s` } as React.CSSProperties
              }
            />
          ))}

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
                className={n.ping ? "arch-pulse" : undefined}
                style={n.ping ? { animationDelay: `${(i % 4) * 1.1}s` } : undefined}
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

/**
 * Motion design system — the single source of truth for animation timing.
 *
 * Import these tokens instead of hand-coding cubic-beziers / durations so the
 * whole site shares one calm, premium, orchestrated feel. Keep the vocabulary
 * small on purpose: more curves would fragment the motion language.
 */

type Bezier = [number, number, number, number];

export const easing = {
  /** Canonical brand curve — the spine of the system (reveals, nav, hero). */
  smooth: [0.21, 0.47, 0.32, 0.98],
  /** Ease-in for elements leaving (AnimatePresence exits). */
  exit: [0.4, 0, 1, 1],
  /** Small interactive hover/tap feedback under ~0.3s. */
  snappy: [0.25, 0.46, 0.45, 0.94],
} satisfies Record<string, Bezier>;

export const duration = {
  fast: 0.25, // icon swaps, theme toggle, tiny state changes
  snappy: 0.3, // hover glow / opacity accents
  standard: 0.5, // nav entrance, filter-grid swap, card hover
  reveal: 0.55, // staggered grid children
  calm: 0.6, // single reveals, hero entrance steps
  deliberate: 0.7, // large featured elements (hero code window)
} as const;

export const spring = {
  /** Magnetic + TiltCard pointer tracking. */
  interactive: { stiffness: 220, damping: 18, mass: 0.4 },
  /** Scroll progress bar — feels attached to the gesture. */
  scroll: { stiffness: 180, damping: 20, mass: 0.5 },
} as const;

export const stagger = {
  tight: 0.06,
  default: 0.1,
  spaced: 0.12,
} as const;

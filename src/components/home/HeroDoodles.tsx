import type { CSSProperties } from "react";

/**
 * Hand-drawn doodles for the hero poster: a squiggle, a crown, stars, a spark burst and a
 * curl, drawn as loose ink lines. Purely decorative (hidden from assistive tech). Each slide
 * gets a different arrangement so the posters feel hand-made rather than templated.
 */
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const SHAPES = {
  squiggle: (
    <svg viewBox="0 0 80 40" {...stroke}>
      <path d="M4 30c6-14 12-14 16 0s10 14 16 0 10-14 16 0 10 14 16 0" />
    </svg>
  ),
  crown: (
    <svg viewBox="0 0 60 48" {...stroke}>
      <path d="M8 36 4 10l16 14L30 6l10 18 16-14-4 26Z" />
      <path d="M10 44h40" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 48 48" {...stroke}>
      <path d="M24 4l5 14 15 1-12 9 4 15-12-9-12 9 4-15L4 19l15-1Z" />
    </svg>
  ),
  burst: (
    <svg viewBox="0 0 60 60" {...stroke}>
      <path d="M30 6v10M30 44v10M6 30h10M44 30h10M13 13l7 7M40 40l7 7M47 13l-7 7M20 40l-7 7" />
    </svg>
  ),
  curl: (
    <svg viewBox="0 0 90 40" {...stroke}>
      <path d="M4 32c14 0 14-22 26-22s6 22 18 22 8-24 22-24 14 14 16 18" />
    </svg>
  ),
  dash: (
    <svg viewBox="0 0 60 60" {...stroke}>
      <path d="M14 10l6 10M40 8l-4 12M50 30H38M10 32h12M18 50l6-10M44 50l-6-10" />
    </svg>
  ),
} as const;

type Shape = keyof typeof SHAPES;
type Placement = { shape: Shape; top: string; left: string; size: string; rotate?: number };

/** Positions are relative to the hero's art area (the model's side). */
const LAYOUTS: Placement[][] = [
  [
    { shape: "squiggle", top: "10%", left: "6%", size: "4.5rem", rotate: -12 },
    { shape: "crown", top: "4%", left: "70%", size: "3.25rem", rotate: 10 },
    { shape: "burst", top: "62%", left: "84%", size: "3rem" },
  ],
  [
    { shape: "star", top: "8%", left: "78%", size: "2.75rem", rotate: 8 },
    { shape: "curl", top: "72%", left: "2%", size: "5rem", rotate: -6 },
    { shape: "dash", top: "18%", left: "8%", size: "3rem" },
  ],
  [
    { shape: "crown", top: "6%", left: "12%", size: "3.25rem", rotate: -10 },
    { shape: "squiggle", top: "70%", left: "80%", size: "4.5rem", rotate: 14 },
    { shape: "star", top: "30%", left: "86%", size: "2.25rem" },
  ],
  [
    { shape: "burst", top: "6%", left: "74%", size: "3.25rem" },
    { shape: "squiggle", top: "16%", left: "4%", size: "4rem", rotate: 8 },
    { shape: "star", top: "74%", left: "86%", size: "2.5rem", rotate: -12 },
  ],
];

export function HeroDoodles({ index }: { index: number }) {
  const layout = LAYOUTS[index % LAYOUTS.length];
  return (
    <span className="hero-doodles" aria-hidden="true">
      {layout.map((d, i) => (
        <span
          key={`${d.shape}-${i}`}
          className="hero-doodle"
          style={{ top: d.top, left: d.left, width: d.size, "--r": `${d.rotate ?? 0}deg`, "--i": i } as CSSProperties}
        >
          {SHAPES[d.shape]}
        </span>
      ))}
    </span>
  );
}

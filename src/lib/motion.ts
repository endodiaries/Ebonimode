/** Motion tokens. Mirrors the CSS variables in globals.css. */
export const duration = {
  micro: 150,
  ui: 250,
  section: 400,
  hero: 1100,
} as const;

export const easing = {
  entrance: "cubic-bezier(0.22, 1, 0.36, 1)",
  exit: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const heroAutoplayMs = 6500;
export const revealStaggerMs = 60;
export const revealDistancePx = 24;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Colour helpers for admin-set colours (collection themes, hero colour fields). */

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 1;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const INK = "#1A1718";
const IVORY = "#FAF6EF";

/** Picks ink or ivory text, whichever reads better on the given background (WCAG contrast). */
export function readableOn(bgHex: string): "ink" | "ivory" {
  return contrastRatio(bgHex, INK) >= contrastRatio(bgHex, IVORY) ? "ink" : "ivory";
}

/** Brand token for each colour family used in "Shop by colour". */
export const colourFamilyToken: Record<string, string> = {
  green: "var(--color-forest)",
  blue: "var(--color-indigo)",
  yellow: "var(--color-marigold)",
  orange: "var(--color-tangerine)",
  red: "var(--color-crimson)",
  purple: "var(--color-aubergine)",
  brown: "var(--color-chestnut)",
  pink: "var(--color-blush)",
};

/**
 * Colour-band divider taken from the logo's strata, top to bottom.
 * Decorative only.
 */
const bands = [
  "bg-forest",
  "bg-aubergine",
  "bg-crimson",
  "bg-sage",
  "bg-vermilion",
  "bg-marigold",
  "bg-tangerine",
  "bg-chestnut",
];

export function StrataDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex h-3 w-full ${className}`}>
      {bands.map((b, i) => (
        <span key={b} className={`${b} h-full`} style={{ flexGrow: [5, 3, 4, 2, 3, 4, 5, 2][i] }} />
      ))}
    </div>
  );
}

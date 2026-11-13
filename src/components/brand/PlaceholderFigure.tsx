/**
 * PLACEHOLDER stand-in for a model photograph: a plain robed silhouette.
 * Used until real cut-outs and campaign photos are uploaded. Decorative.
 */
export function PlaceholderFigure({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 640"
      preserveAspectRatio="xMidYMax meet"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="150" cy="62" rx="34" ry="40" />
      <path d="M150 104c-44 0-74 22-84 62L38 420c-3 12 4 20 14 20h14L50 640h200l-16-200h14c10 0 17-8 14-20l-28-254c-10-40-40-62-84-62Z" />
    </svg>
  );
}

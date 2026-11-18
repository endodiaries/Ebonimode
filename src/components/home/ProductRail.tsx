"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A horizontal row of product cards: swipe on touch, arrows and a progress line on desktop.
 * Native scroll with snap points, so it stays fast and keyboard-scrollable.
 */
export function ProductRail({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
      setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div>
      <ul ref={ref} className="rail gutter" aria-label={label} tabIndex={0}>
        {children}
      </ul>
      <div className="gutter mx-auto mt-8 flex max-w-[96rem] items-center gap-6">
        <span className="relative block h-px flex-1 bg-ink/15" aria-hidden="true">
          <span
            className="absolute inset-y-0 left-0 w-1/4 bg-ink transition-transform duration-150 ease-out"
            style={{ transform: `translateX(${progress * 300}%)` }}
          />
        </span>
        <div className="hidden gap-2 md:flex">
          <button type="button" className="rail-btn" aria-label="Previous pieces" disabled={edges.start} onClick={() => step(-1)}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M15 5 8 12l7 7" />
            </svg>
          </button>
          <button type="button" className="rail-btn" aria-label="Next pieces" disabled={edges.end} onClick={() => step(1)}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A titled, horizontal row of product cards: swipe on touch, arrows on desktop.
 * Native scroll with snap points, so it stays fast and keyboard-scrollable.
 */
export function ProductRail({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
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
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: "smooth" });
  };

  return (
    <section className="py-12 md:py-16" aria-label={title}>
      <div className="gutter mb-6 flex items-end justify-between gap-6 md:mb-8">
        <h2 className="font-display text-xl md:text-2xl">{title}</h2>
        <div className="flex items-center gap-6">
          {href && linkLabel && (
            <Link href={href} className="text-link label whitespace-nowrap">
              {linkLabel}
            </Link>
          )}
          <div className="hidden gap-2 md:flex">
            <button type="button" className="rail-btn" aria-label={`Previous: ${title}`} disabled={edges.start} onClick={() => step(-1)}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
                <path d="M15 5 8 12l7 7" />
              </svg>
            </button>
            <button type="button" className="rail-btn" aria-label={`Next: ${title}`} disabled={edges.end} onClick={() => step(1)}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <ul ref={ref} className="rail gutter" aria-label={title} tabIndex={0}>
        {children}
      </ul>
    </section>
  );
}

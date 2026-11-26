"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cloudinaryLoader } from "@/lib/cloudinary";
import { readableOn } from "@/lib/colour";
import type { HeroFigure } from "@/lib/data/home";

const STEP_MS = 3500;

/**
 * Menswear as a turntable: one piece stands centre stage, the next ones wait at either side,
 * smaller and softer, and every few seconds the line turns so the next piece steps forward.
 * Swipe, use the arrows, or tap a side piece to bring it forward; tap the centre piece to open
 * it. Pauses on hover, focus and when the tab is hidden; no autoplay with reduced motion.
 */
export function MenswearShowcase({
  figures,
  title,
  kicker,
  note,
  href,
  linkLabel,
  field,
}: {
  figures: HeroFigure[];
  title: string;
  kicker: string;
  note: string;
  href: string;
  linkLabel: string;
  field: string;
}) {
  const count = figures.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const touchX = useRef<number | null>(null);
  const tone = readableOn(field) === "ink" ? "text-ink" : "text-ivory";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    const el = ref.current;
    const io = el ? new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 }) : null;
    if (el && io) io.observe(el);
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mq.removeEventListener("change", update);
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    if (count < 2 || paused || reduce || !inView) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % count), STEP_MS);
    return () => window.clearTimeout(t);
  }, [active, count, paused, reduce, inView]);

  if (count === 0) return null;
  const go = (to: number) => setActive(((to % count) + count) % count);
  /** Position of figure i relative to the active one: 0 is centre, ±1 beside it, ±2 further out. */
  const offset = (i: number) => {
    let d = i - active;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    return d;
  };

  return (
    <section
      ref={ref}
      className={`menswear studio ${tone}`}
      style={{ "--field": field } as CSSProperties}
      aria-roledescription="carousel"
      aria-label={title}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(active + 1);
        if (e.key === "ArrowLeft") go(active - 1);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="menswear-copy">
        <p className="label opacity-85">{kicker}</p>
        <h2 className="campaign-title font-display mt-4">{title}</h2>
        <p className="font-editorial mt-4 max-w-sm text-lg text-pretty opacity-90 max-md:hidden">{note}</p>
        <Link href={href} className="text-link label mt-6 inline-block md:mt-8">
          {linkLabel}
        </Link>
        {count > 1 && (
          <div className="mt-8 flex gap-2 max-md:hidden">
            <button type="button" className="menswear-arrow" aria-label="Previous piece" onClick={() => go(active - 1)}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
                <path d="M15 5 8 12l7 7" />
              </svg>
            </button>
            <button type="button" className="menswear-arrow" aria-label="Next piece" onClick={() => go(active + 1)}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="menswear-stage">
        {figures.map((f, i) => {
          const d = offset(i);
          const centre = d === 0;
          return (
            <Link
              key={f.slug}
              href={`/product/${f.slug}`}
              className="menswear-figure"
              data-offset={Math.max(-3, Math.min(3, d))}
              aria-label={f.name}
              aria-current={centre ? "true" : undefined}
              tabIndex={Math.abs(d) <= 1 ? 0 : -1}
              onClick={(e) => {
                // A side piece first steps forward; the centre piece opens.
                if (!centre) {
                  e.preventDefault();
                  go(i);
                }
              }}
            >
              <Image
                src={f.publicId}
                alt=""
                fill
                sizes="(min-width: 768px) 24rem, 60vw"
                className="object-contain object-bottom"
                loader={cloudinaryLoader}
                loading="lazy"
              />
            </Link>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {paused || reduce ? figures[active]?.name : ""}
      </p>
    </section>
  );
}

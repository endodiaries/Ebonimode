"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useReducer, useRef, useState, type CSSProperties } from "react";
import { PlaceholderFigure } from "@/components/brand/PlaceholderFigure";
import { cloudinaryEnabled, cloudinaryLoader } from "@/lib/cloudinary";
import { readableOn } from "@/lib/colour";
import type { HeroSlide } from "@/lib/data/home";

type State = { index: number; prev: number | null };

const pad = (n: number) => String(n).padStart(2, "0");

/** "Modest by design. Bold by nature." becomes two lines that stagger in. */
const taglineLines = (t: string) => t.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [];

function Model({ slide, first }: { slide: HeroSlide; first: boolean }) {
  const isLocal = slide.model.startsWith("/");
  const isPlaceholder = slide.model.startsWith("placeholder/") || (!isLocal && !cloudinaryEnabled);
  if (isPlaceholder) {
    return <PlaceholderFigure className="h-full w-full opacity-85" />;
  }
  return (
    <Image
      src={slide.model}
      alt={slide.modelAlt}
      fill
      sizes="(min-width: 640px) 30rem, 78vw"
      className="object-contain object-bottom"
      loader={isLocal ? undefined : cloudinaryLoader}
      // The first slide's model is the LCP element; the rest load lazily.
      preload={first}
      fetchPriority={first ? "high" : "auto"}
      loading={first ? "eager" : "lazy"}
    />
  );
}

/**
 * The homepage hero: colour field, giant print-filled name, cut-out model in front.
 * Autoplay is driven by the progress line's CSS animation, so pausing the animation
 * pauses the slideshow, and reduced-motion (animation: none) switches autoplay off.
 */
export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const count = slides.length;
  const [{ index, prev }, go] = useReducer((s: State, to: number): State => {
    const next = ((to % count) + count) % count;
    return next === s.index ? s : { index: next, prev: s.index };
  }, { index: 0, prev: null });
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (count === 0) return null;
  const active = slides[index];
  const playing = count > 1 && !hover && !focus && !tabHidden;
  const fg = readableOn(active.bgHex) === "ink" ? "var(--color-ink)" : "var(--color-ivory)";

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Colour stories"
      style={{ "--hero-fg": fg, "--hero-bg": active.bgHex } as CSSProperties}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setFocus(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      {slides.map((s, i) => {
        const state = i === index ? "active" : i === prev ? "prev" : "idle";
        const tone = readableOn(s.bgHex) === "ink" ? "text-ink" : "text-ivory";
        const lines = taglineLines(s.tagline);
        return (
          <div
            key={s.id}
            className={`hero-slide ${tone}`}
            data-state={state}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}${s.storyName ? `: ${s.storyName}` : ""}`}
            inert={i !== index}
          >
            <div className="hero-backdrop" style={{ backgroundColor: s.bgHex }}>
              <span aria-hidden="true" className="print-name hero-print block w-full" data-print={s.printKey}>
                <span>EBONÍ</span>
                <span>MODE</span>
              </span>
            </div>

            <div className="hero-model">
              <span className="hero-shadow" aria-hidden="true" />
              <Model slide={s} first={i === 0} />
            </div>

            {lines.length > 0 && (
              <p className="label gutter absolute top-6 left-0 max-w-[58%] leading-relaxed sm:max-w-[40%] md:top-10">
                {lines.map((line, n) => (
                  <span key={n} className="hero-line" style={{ "--i": n } as CSSProperties}>
                    {line}
                  </span>
                ))}
                <span
                  className="hero-line mt-3 h-px w-10 bg-current"
                  style={{ "--i": lines.length } as CSSProperties}
                  aria-hidden="true"
                />
              </p>
            )}

            <p className="gutter absolute top-6 right-0 text-right sm:top-auto sm:bottom-10">
              <span className="hero-line label" style={{ "--i": 2 } as CSSProperties}>
                <span className="max-sm:sr-only">New collection </span>N°{pad(i + 1)}
              </span>
              {s.storyName && (
                <span className="hero-line mt-1 font-editorial text-2xl italic md:text-3xl" style={{ "--i": 3 } as CSSProperties}>
                  {s.storyName}
                </span>
              )}
              <span className="hero-line mt-3 ml-auto h-px w-10 bg-current" style={{ "--i": 4 } as CSSProperties} aria-hidden="true" />
            </p>
          </div>
        );
      })}

      {/* Same two buttons on every slide: the only marketing buttons on the homepage. */}
      <div className="gutter absolute inset-x-0 bottom-6 z-10 flex gap-3 sm:right-auto sm:bottom-10">
        <Link href="/women" className="hero-btn hero-btn-solid label flex-1 sm:flex-none">
          Shop Women
        </Link>
        <Link href="/men" className="hero-btn label flex-1 sm:flex-none">
          Shop Men
        </Link>
      </div>

      {count > 1 && (
        <div className="hero-progress gutter absolute bottom-[5.25rem] left-0 z-10 flex items-center gap-1 sm:bottom-[6.5rem]">
          <span className="label mr-2 tabular-nums" aria-hidden="true">
            {pad(index + 1)} / {pad(count)}
          </span>
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="flex h-11 cursor-pointer items-center px-1"
              aria-label={`Show slide ${i + 1}${s.storyName ? `: ${s.storyName}` : ""}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => go(i)}
            >
              <span className="hero-progress-track">
                <span
                  key={i === index ? `on-${index}` : "off"}
                  className="hero-progress-fill"
                  data-autoplay={i === index ? "" : undefined}
                  style={{ animationPlayState: playing ? "running" : "paused" }}
                  onAnimationEnd={() => go(index + 1)}
                />
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {playing ? "" : `Slide ${index + 1} of ${count}${active.storyName ? `: ${active.storyName}` : ""}`}
      </p>
    </section>
  );
}

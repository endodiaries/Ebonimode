"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useReducer, useRef, useState, type CSSProperties } from "react";
import { PlaceholderFigure } from "@/components/brand/PlaceholderFigure";
import { PauseIcon, PlayIcon } from "@/components/icons";
import { cloudinaryEnabled, cloudinaryLoader } from "@/lib/cloudinary";
import type { HeroFigure, HeroSlide } from "@/lib/data/home";

type State = { index: number; prev: number | null };


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
      sizes="(min-width: 768px) 36rem, 80vw"
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
 * Each slide presents its pieces like a designer's line-up, styled a little differently each
 * time: on a fine horizon line, in arched windows tinted in each piece's own colour, or in
 * thin gallery frames the model steps out of. Captions name each colour.
 */
const VARIANTS = ["lineup", "arches", "frames"] as const;

/** One piece in the line-up, with its caption underneath (never covered by the image). */
function Figure({ f, eager, n }: { f: HeroFigure; eager: boolean; n: number }) {
  return (
    <Link href={`/product/${f.slug}`} className="hero-figure" style={{ "--n": n, "--tint": f.hex ?? "var(--color-sand)" } as CSSProperties}>
      <span className="hero-figure-art">
        <span className="hero-figure-frame" aria-hidden="true" />
        <Image
          src={f.publicId}
          alt={f.alt}
          fill
          sizes="(min-width: 768px) 16rem, 30vw"
          className="hero-figure-img object-contain object-bottom"
          loader={cloudinaryLoader}
          preload={eager}
          fetchPriority={eager ? "high" : "auto"}
          loading={eager ? "eager" : "lazy"}
        />
      </span>
      <span className="hero-caption">
        {f.label && f.hex && <span className="hero-caption-dot" aria-hidden="true" />}
        {f.label}
      </span>
    </Link>
  );
}

/**
 * The homepage hero on white: the headline on the left; on the right the piece in all its
 * colours (or a group of pieces) presented like a designer's line-up, with each colour named.
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
  // "auto" follows hover and focus; an explicit Play or Pause from the visitor wins.
  const [choice, setChoice] = useState<"auto" | "play" | "pause">("auto");
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (count === 0) return null;
  const active = slides[index];
  const playing = count > 1 && !tabHidden && (choice === "auto" ? !hover && !focus : choice === "play");

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Colour stories"
      style={{ "--hero-fg": "var(--color-ink)", "--hero-bg": "var(--color-ivory)" } as CSSProperties}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      // Focus pauses autoplay, except on the play/pause control, so "Play" really plays.
      onFocusCapture={(e) => setFocus(!(e.target as HTMLElement).dataset.heroToggle)}
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
        const lines = taglineLines(s.tagline);
        const variant = VARIANTS[i % VARIANTS.length];
        return (
          <div
            key={s.id}
            className="hero-slide text-ink"
            style={{ "--accent": s.bgHex } as CSSProperties}
            data-state={state}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}${s.storyName ? `: ${s.storyName}` : ""}`}
            inert={i !== index}
          >
            <div className="hero-stage" data-variant={variant}>
              <span className="hero-horizon" aria-hidden="true" />
              {s.group.length > 1 ? (
                <div className="hero-group" data-count={s.group.length}>
                  {s.group.map((f, n) => (
                    <Figure key={f.slug} f={f} eager={i === 0} n={n} />
                  ))}
                </div>
              ) : (
                <div className="hero-model">
                  {s.productSlug ? (
                    // The model links to the piece too; the named link below is the accessible one.
                    <Link href={`/product/${s.productSlug}`} tabIndex={-1} aria-hidden="true" className="absolute inset-0 block">
                      <Model slide={s} first={i === 0} />
                    </Link>
                  ) : (
                    <Model slide={s} first={i === 0} />
                  )}
                </div>
              )}
            </div>

            <div className="hero-copy gutter">
              {s.context && (
                <p className="hero-line label" style={{ "--i": 0 } as CSSProperties}>
                  {s.context}
                </p>
              )}
              {lines.length > 0 && (
                <p className="hero-headline font-display">
                  {lines.map((line, n) => (
                    <span key={n} className="hero-line" style={{ "--i": n + 1 } as CSSProperties}>
                      {line}
                    </span>
                  ))}
                </p>
              )}
            </div>

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
        <div className="hero-progress gutter absolute bottom-[4.75rem] left-0 z-10 flex items-center sm:bottom-[6rem]">
          <button
            type="button"
            data-hero-toggle=""
            className="-ml-3 flex h-11 w-11 cursor-pointer items-center justify-center motion-reduce:hidden"
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
            onClick={() => setChoice(playing ? "pause" : "play")}
          >
            {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>
          {/* Invisible timer: its CSS animation sets the pace, so pausing it pauses the slideshow,
              and reduced motion (animation: none) turns autoplay off. */}
          <span
            key={`timer-${index}`}
            className="hero-timer"
            aria-hidden="true"
            style={{ animationPlayState: playing ? "running" : "paused" }}
            onAnimationEnd={() => go(index + 1)}
          />
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {playing ? "" : `Slide ${index + 1} of ${count}${active.storyName ? `: ${active.storyName}` : ""}`}
      </p>
    </section>
  );
}

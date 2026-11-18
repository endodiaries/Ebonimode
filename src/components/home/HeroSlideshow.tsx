"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useReducer, useRef, useState, type CSSProperties } from "react";
import { PlaceholderFigure } from "@/components/brand/PlaceholderFigure";
import { PauseIcon, PlayIcon } from "@/components/icons";
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

/** "Worn here: <piece>" for phones, as an underlined text link (not a marketing button). */
function WornHere({ slide }: { slide: HeroSlide }) {
  const name = <span className="font-editorial text-xl italic normal-case">{slide.storyName}</span>;
  return (
    <>
      <span className="label mr-2">Worn here</span>
      {slide.productSlug ? (
        <Link href={`/product/${slide.productSlug}`} className="text-link">
          {name}
        </Link>
      ) : (
        name
      )}
    </>
  );
}

/**
 * The homepage hero:a flat colour field, an editorial headline on the left, and a
 * cut-out model standing on the right.
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
  const fg = readableOn(active.bgHex) === "ink" ? "var(--color-ink)" : "var(--color-ivory)";

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Colour stories"
      style={{ "--hero-fg": fg, "--hero-bg": active.bgHex } as CSSProperties}
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
            <div className="hero-backdrop" style={{ backgroundColor: s.bgHex }} />

            <div className="hero-stage">
              <div className="hero-model">
                <span className="hero-shadow" aria-hidden="true" />
                {s.productSlug ? (
                  // The model links to the piece too; the named link below is the accessible one.
                  <Link href={`/product/${s.productSlug}`} tabIndex={-1} aria-hidden="true" className="absolute inset-0 block">
                    <Model slide={s} first={i === 0} />
                  </Link>
                ) : (
                  <Model slide={s} first={i === 0} />
                )}
              </div>
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
              {/* Wrappers carry the breakpoint visibility: .hero-line sets its own display. */}
              <div className="max-md:hidden">
                <span
                  className="hero-line mt-8 h-px w-12 bg-current"
                  style={{ "--i": lines.length + 1 } as CSSProperties}
                  aria-hidden="true"
                />
              </div>
              {/* Phones: the piece's name sits under the headline, where the eye already is. */}
              {s.storyName && (
                <div className="md:hidden">
                  <p className="hero-line mt-3" style={{ "--i": lines.length + 1 } as CSSProperties}>
                    <WornHere slide={s} />
                  </p>
                </div>
              )}
            </div>

            {s.storyName && (
              <p className="gutter absolute right-0 bottom-10 text-right max-md:hidden">
                <span className="hero-line label" style={{ "--i": 3 } as CSSProperties}>
                  Worn here
                </span>
                <span className="hero-line mt-1 font-editorial text-3xl italic lg:text-4xl" style={{ "--i": 4 } as CSSProperties}>
                  {s.productSlug ? (
                    <Link href={`/product/${s.productSlug}`} className="text-link">
                      {s.storyName}
                    </Link>
                  ) : (
                    s.storyName
                  )}
                </span>
              </p>
            )}
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
          <button
            type="button"
            data-hero-toggle=""
            className="-ml-3 flex h-11 w-11 cursor-pointer items-center justify-center motion-reduce:hidden"
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
            onClick={() => setChoice(playing ? "pause" : "play")}
          >
            {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>
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

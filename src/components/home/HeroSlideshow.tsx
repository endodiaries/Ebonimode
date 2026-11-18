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

/** "Modest by design. Bold by nature." becomes two lines that rise out of a mask. */
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
      sizes="(min-width: 768px) 44vw, 86vw"
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
 * The homepage hero, set like a magazine cover: a flat colour field, the slide's line in
 * huge Bodoni, and the cut-out model standing in front of the type.
 * On each change the new colour wipes across, the model settles in and the headline
 * rises line by line. Autoplay is driven by the progress line's CSS animation, so
 * pausing that animation pauses the slideshow; reduced motion switches it all off.
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
        const href = s.productSlug ? `/product/${s.productSlug}` : null;
        return (
          <div
            key={s.id}
            className={`hero-slide ${tone}`}
            data-state={state}
            // The very first paint keeps the model visible (it is the LCP image): it only settles.
            data-first={i === 0 && prev === null ? "" : undefined}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}${s.storyName ? `: ${s.storyName}` : ""}`}
            inert={i !== index}
          >
            <div className="hero-backdrop" style={{ backgroundColor: s.bgHex }} />

            {lines.length > 0 && (
              <p className="hero-headline font-display gutter">
                {lines.map((line, n) => (
                  <span key={n} className="hero-mask">
                    <span className="hero-rise" style={{ "--i": n } as CSSProperties}>
                      {line}
                    </span>
                  </span>
                ))}
              </p>
            )}

            <div className="hero-stage">
              <div className="hero-model">
                {href ? (
                  // The model links to the piece too; the named link is the accessible one.
                  <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0 block">
                    <Model slide={s} first={i === 0} />
                  </Link>
                ) : (
                  <Model slide={s} first={i === 0} />
                )}
              </div>
            </div>

            <div className="hero-top gutter">
              {s.context ? <p className="hero-fade label">{s.context}</p> : <span />}
              {s.storyName && (
                <p className="hero-fade text-right" style={{ "--i": 1 } as CSSProperties}>
                  <span className="label mr-3 max-md:hidden">Worn here</span>
                  {href ? (
                    <Link href={href} className="text-link font-editorial text-xl italic md:text-3xl">
                      {s.storyName}
                    </Link>
                  ) : (
                    <span className="font-editorial text-xl italic md:text-3xl">{s.storyName}</span>
                  )}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Same two buttons on every slide. */}
      <div className="hero-actions gutter">
        <Link href="/women" className="hero-btn hero-btn-solid flex-1 sm:flex-none">
          Shop women
        </Link>
        <Link href="/men" className="hero-btn flex-1 sm:flex-none">
          Shop men
        </Link>
      </div>

      {count > 1 && (
        <div className="hero-progress gutter">
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

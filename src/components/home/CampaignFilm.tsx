"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@/components/icons";

const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * A campaign film beside the collection's words. The film plays muted and looped only
 * while it is on screen; it never autoplays with reduced motion or Save-Data on, and a
 * visible button pauses it (anything moving longer than five seconds needs one).
 */
export function CampaignFilm({
  publicId,
  kicker,
  title,
  lines,
  href,
  linkLabel,
}: {
  publicId: string;
  kicker: string;
  title: string;
  lines: string[];
  href: string;
  linkLabel: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (reduce || saveData) return; // the poster shows; the play button still works
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  if (!cloud) return null;
  const base = `https://res.cloudinary.com/${cloud}/video/upload`;
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <section className="bg-sand" aria-label={title}>
      <div className="mx-auto grid max-w-[96rem] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-ink md:aspect-auto md:min-h-[44rem]">
          <video
            ref={ref}
            className="absolute inset-0 h-full w-full object-cover"
            poster={`${base}/so_18,w_900,q_auto,f_auto/${publicId}.jpg`}
            muted
            loop
            playsInline
            preload="none"
            aria-label={`Campaign film: ${title}`}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            <source src={`${base}/w_720,q_auto,vc_auto/${publicId}.mp4`} type="video/mp4" />
          </video>
          <button
            type="button"
            onClick={toggle}
            className="absolute bottom-3 left-3 flex h-11 w-11 cursor-pointer items-center justify-center bg-ivory/90 text-ink"
            aria-label={playing ? "Pause film" : "Play film"}
          >
            {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>
        </div>

        <div className="gutter flex flex-col justify-center py-14 md:px-16 md:py-20 lg:px-24" data-reveal>
          <p className="label text-ink-soft">{kicker}</p>
          <h2 className="font-display mt-5 text-3xl leading-tight md:text-5xl">{title}</h2>
          {lines.map((l, i) => (
            <p key={i} className={`max-w-xl text-pretty ${i === 0 ? "font-editorial mt-6 text-xl md:text-2xl" : "mt-4 text-ink-soft"}`}>
              {l}
            </p>
          ))}
          <Link href={href} className="text-link label mt-9 self-start">
            {linkLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

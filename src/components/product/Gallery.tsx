"use client";

import { useState, type CSSProperties, type PointerEvent } from "react";
import { CldImage } from "@/components/brand/CldImage";

type Photo = { publicId: string; alt: string };
const isCutout = (id: string) => id.startsWith("site/product-cutouts/");

/** Product photos: one large image with thumbnails. Click or tap the large image to zoom. */
export function Gallery({ images }: { images: Photo[] }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const current = images[index];
  if (!current) return <div className="aspect-[4/5] bg-sand" />;

  const follow = (e: PointerEvent<HTMLButtonElement>) => {
    if (!zoom) return;
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="grid gap-3 md:grid-cols-[5rem_minmax(0,1fr)] md:gap-4">
      <button
        type="button"
        onClick={() => setZoom((z) => !z)}
        onPointerMove={follow}
        aria-label={zoom ? "Zoom out" : "Zoom in"}
        aria-pressed={zoom}
        className={`relative aspect-[4/5] w-full overflow-hidden bg-sand md:order-2 ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
      >
        <span
          className="absolute inset-0 transition-transform duration-[var(--dur-section)] ease-entrance"
          style={{ transform: zoom ? "scale(2.2)" : "none", transformOrigin: origin } as CSSProperties}
        >
          <span className={`absolute ${isCutout(current.publicId) ? "inset-x-[6%] top-[4%] bottom-0" : "inset-0"}`}>
            <CldImage
              key={current.publicId}
              publicId={current.publicId}
              alt={current.alt}
              sizes="(min-width: 768px) 50vw, 100vw"
              priority={index === 0}
              className={isCutout(current.publicId) ? "object-contain object-bottom" : "object-cover object-top"}
            />
          </span>
        </span>
      </button>

      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto md:order-1 md:max-h-[44rem] md:flex-col md:overflow-y-auto" aria-label="More photos">
          {images.map((img, i) => (
            <li key={img.publicId} className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIndex(i);
                  setZoom(false);
                }}
                aria-label={`Photo ${i + 1} of ${images.length}`}
                aria-current={i === index ? "true" : undefined}
                className="relative block h-24 w-[4.75rem] overflow-hidden border border-transparent bg-sand aria-[current=true]:border-ink md:h-[6.25rem] md:w-20"
              >
                <CldImage
                  publicId={img.publicId}
                  alt=""
                  sizes="5rem"
                  className={isCutout(img.publicId) ? "object-contain object-bottom" : "object-cover object-top"}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

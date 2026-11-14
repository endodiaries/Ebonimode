"use client";

import Link from "next/link";
import { useState } from "react";
import { CldImage } from "@/components/brand/CldImage";
import { PlaceholderFigure } from "@/components/brand/PlaceholderFigure";
import { ProductMedia } from "@/components/product/ProductCard";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { readableOn } from "@/lib/colour";
import type { LookData } from "@/lib/data/home";

/** Campaign photo with tappable hotspots. The chosen piece shows beside it with its sizes. */
export function ShopTheLook({ look }: { look: LookData }) {
  const [selected, setSelected] = useState(0);
  const current = look.hotspots[selected];
  const field = look.themeHex ?? "#EFE6D8";
  const tone = readableOn(field) === "ink" ? "text-ink" : "text-ivory";
  const hasPhoto = cloudinaryEnabled && !look.image.startsWith("placeholder/");

  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
      <div
        className={`relative aspect-[4/5] w-full overflow-hidden md:max-w-[34rem] md:justify-self-end ${tone}`}
        style={{ backgroundColor: field }}
      >
        {hasPhoto ? (
          <CldImage
            publicId={look.image}
            alt={look.title}
            sizes="(min-width: 768px) 34rem, 100vw"
            crop={{ ratio: 5 / 4, gravity: "auto" }}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-end justify-center gap-[8%] opacity-30" aria-hidden="true">
            <PlaceholderFigure className="h-[88%] w-auto" />
            <PlaceholderFigure className="h-[92%] w-auto" />
          </div>
        )}
        {look.hotspots.map((h, i) => (
          <button
            key={h.id}
            type="button"
            aria-pressed={i === selected}
            aria-label={`Show ${h.product.name}`}
            onClick={() => setSelected(i)}
            className="group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            <span className="flex h-7 w-7 items-center justify-center border border-ink bg-ivory text-sm text-ink transition-transform duration-[var(--dur-ui)] ease-entrance group-hover:scale-110 group-aria-pressed:bg-ink group-aria-pressed:text-ivory">
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      {current && (
        <div aria-live="polite" className="flex gap-5 md:flex-col md:justify-center">
          <Link
            href={`/product/${current.product.slug}`}
            className="relative block aspect-[3/4] w-28 shrink-0 overflow-hidden bg-sand md:w-44"
            tabIndex={-1}
            aria-hidden="true"
          >
            <ProductMedia product={current.product} sizes="11rem" />
          </Link>
          <div>
            <p className="label text-ink-soft">
              Piece {selected + 1} of {look.hotspots.length}
            </p>
            <h3 className="mt-2 font-display text-2xl leading-tight md:text-3xl">{current.product.name}</h3>
            <p className="mt-5">
              <Link href={`/product/${current.product.slug}`} className="text-link label">
                View piece →
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

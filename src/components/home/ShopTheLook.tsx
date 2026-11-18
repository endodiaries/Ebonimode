"use client";

import Link from "next/link";
import { useState } from "react";
import { CldImage } from "@/components/brand/CldImage";
import { PlaceholderFigure } from "@/components/brand/PlaceholderFigure";
import { ProductMedia } from "@/components/product/ProductCard";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { readableOn } from "@/lib/colour";
import type { LookData } from "@/lib/data/home";

/**
 * Campaign photo with numbered hotspots. Every piece in the look is listed beside it;
 * tapping a hotspot highlights its piece in the list.
 */
export function ShopTheLook({ look }: { look: LookData }) {
  const [selected, setSelected] = useState(0);
  const field = look.themeHex ?? "#EFE6D8";
  const tone = readableOn(field) === "ink" ? "text-ink" : "text-ivory";
  const hasPhoto = cloudinaryEnabled && !look.image.startsWith("placeholder/");

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] md:items-center md:gap-16">
      <div className={`relative aspect-[4/5] w-full overflow-hidden ${tone}`} style={{ backgroundColor: field }}>
        {hasPhoto ? (
          <CldImage
            publicId={look.image}
            alt={look.title}
            sizes="(min-width: 768px) 36rem, 100vw"
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
            aria-label={`Highlight ${h.product.name}`}
            onClick={() => setSelected(i)}
            className="group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            <span className="flex h-8 w-8 items-center justify-center border border-ink bg-ivory text-sm font-semibold text-ink transition-transform duration-[var(--dur-ui)] ease-entrance group-hover:scale-110 group-aria-pressed:bg-ink group-aria-pressed:text-ivory">
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      <div>
        <h3 className="font-display text-2xl leading-tight md:text-3xl">{look.title}</h3>
        <ol className="mt-6 divide-y divide-ink/15 border-y border-ink/15">
          {look.hotspots.map((h, i) => {
            const href = `/product/${h.product.slug}`;
            return (
              <li
                key={h.id}
                data-selected={i === selected ? "" : undefined}
                className="flex items-center gap-5 py-4 transition-colors duration-[var(--dur-ui)] data-[selected]:bg-ivory/70 md:px-4"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center border border-ink text-sm font-semibold in-data-[selected]:bg-ink in-data-[selected]:text-ivory"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[3/4] w-20 shrink-0 overflow-hidden bg-ivory md:w-24">
                  <ProductMedia product={h.product} sizes="6rem" />
                </Link>
                <span className="min-w-0">
                  <span className="block text-[1.0625rem] leading-snug font-semibold">{h.product.name}</span>
                  <Link href={href} className="text-link label mt-2 inline-block">
                    View piece
                  </Link>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

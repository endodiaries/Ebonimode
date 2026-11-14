"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { HeartIcon } from "@/components/icons";
import { addToBag } from "@/lib/bag";
import type { ProductCardData } from "@/lib/data/home";
import type { SizeGuide } from "@/lib/data/product";
import { toggleWishlist, useWishlist } from "@/lib/wishlist";

const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
const LOW_STOCK = 3;

/** Size choice, Add to Bag (the one primary button), wishlist, WhatsApp order and the size guide. */
export function BuyBox({ product, price, sizeGuide }: { product: ProductCardData; price: string; sizeGuide: SizeGuide | null }) {
  const wanted = useSearchParams().get("size");
  const startSize = product.sizes.find((s) => s.size === wanted && s.stock > 0)?.size ?? null;
  const [size, setSize] = useState<string | null>(startSize);
  const [message, setMessage] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const saved = useWishlist().includes(product.id);
  const dialog = useRef<HTMLDialogElement>(null);

  const chosen = product.sizes.find((s) => s.size === size);
  const hasSizes = product.sizes.length > 0;
  const allSoldOut = hasSizes && product.sizes.every((s) => s.stock < 1);

  const add = () => {
    if (!chosen) {
      setMessage({ tone: "warn", text: "Choose a size first." });
      return;
    }
    const ok = addToBag(
      { productId: product.id, slug: product.slug, name: product.name, size: chosen.size, image: product.image?.publicId ?? null },
      chosen.stock,
    );
    setMessage(ok ? { tone: "ok", text: `Added to your bag: size ${chosen.size}.` } : { tone: "warn", text: "That is all we have in this size." });
  };

  const waText = encodeURIComponent(`Hello Ebonímode, I would like to order the ${product.name}${size ? `, size ${size}` : ""}.`);

  return (
    <div>
      {hasSizes && (
        <fieldset>
          <div className="flex items-baseline justify-between gap-4">
            <legend className="label">Size{size ? `: ${size}` : ""}</legend>
            {sizeGuide && (
              <button type="button" className="text-link label cursor-pointer" onClick={() => dialog.current?.showModal()}>
                Size guide
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const out = s.stock < 1;
              return (
                <label
                  key={s.size}
                  className={`flex h-12 min-w-12 items-center justify-center border px-3 text-base font-semibold transition-colors duration-[var(--dur-micro)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${
                    out
                      ? "cursor-not-allowed border-ink/10 text-ink-soft line-through"
                      : s.size === size
                        ? "cursor-pointer border-ink bg-ink text-ivory"
                        : "cursor-pointer border-ink/30 hover:border-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="size"
                    value={s.size}
                    checked={s.size === size}
                    disabled={out}
                    onChange={() => {
                      setSize(s.size);
                      setMessage(null);
                    }}
                    className="sr-only"
                  />
                  {s.size}
                  {out && <span className="sr-only"> sold out</span>}
                </label>
              );
            })}
          </div>
          {chosen && chosen.stock > 0 && chosen.stock <= LOW_STOCK && <p className="mt-3 text-base text-vermilion">Only {chosen.stock} left</p>}
          {sizeGuide?.notes && <p className="mt-3 text-base text-ink-soft">{sizeGuide.notes}</p>}
        </fieldset>
      )}

      <div className="mt-8 flex gap-3">
        <button type="button" className="btn flex-1" onClick={add} disabled={!hasSizes || allSoldOut}>
          {!hasSizes ? "Sizes to come" : allSoldOut ? "Sold out" : "Add to bag"}
        </button>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} wishlist`}
          onClick={() => toggleWishlist(product.id)}
          className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center border border-ink/30 transition-colors hover:border-ink"
        >
          <HeartIcon size={20} fill={saved ? "currentColor" : "none"} className={saved ? "text-crimson" : ""} />
        </button>
      </div>
      <p aria-live="polite" className={`mt-3 min-h-6 text-base ${message?.tone === "warn" ? "text-vermilion" : "text-emerald"}`}>
        {message?.text}
        {message?.tone === "ok" && (
          <>
            {" "}
            <Link href="/cart" className="text-link">
              View bag
            </Link>
          </>
        )}
      </p>
      {whatsapp && (
        <p className="mt-2">
          <a href={`https://wa.me/${whatsapp}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="text-link label">
            Order on WhatsApp →
          </a>
        </p>
      )}

      {/* Phones: Add to bag stays in reach above the tab bar */}
      {hasSizes && !allSoldOut && (
        <div className="gutter fixed inset-x-0 bottom-[var(--tabbar-h)] z-30 flex items-center gap-3 border-t border-ink/10 bg-ivory py-3 md:hidden">
          <p className="min-w-0 flex-1 truncate text-base font-semibold">
            {price}
            {size ? ` · size ${size}` : ""}
          </p>
          <button type="button" className="btn" onClick={add}>
            Add to bag
          </button>
        </div>
      )}

      {sizeGuide && (
        <dialog
          ref={dialog}
          aria-labelledby="size-guide-title"
          className="m-auto w-[min(56rem,calc(100vw-2rem))] bg-ivory p-0 text-ink backdrop:bg-ink/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) e.currentTarget.close();
          }}
        >
          <div className="p-6 md:p-10">
            <div className="flex items-start justify-between gap-6">
              <h2 id="size-guide-title" className="font-display text-3xl md:text-4xl">
                {sizeGuide.name}
              </h2>
              <button type="button" className="text-link label cursor-pointer" onClick={() => dialog.current?.close()}>
                Close
              </button>
            </div>
            <p className="mt-2 text-base text-ink-soft">Measurements in {sizeGuide.unit === "in" ? "inches" : sizeGuide.unit}.</p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left text-base">
                <thead>
                  <tr>
                    {sizeGuide.columns.map((c) => (
                      <th key={c} scope="col" className="label border-b border-ink py-3 pr-5 whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeGuide.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) =>
                        c === 0 ? (
                          <th key={c} scope="row" className="border-b border-ink/10 py-3 pr-5 font-semibold whitespace-nowrap">
                            {cell}
                          </th>
                        ) : (
                          <td key={c} className="border-b border-ink/10 py-3 pr-5 tabular-nums whitespace-nowrap">
                            {cell ?? "–"}
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sizeGuide.notes && <p className="mt-6 text-base text-ink-soft">{sizeGuide.notes}</p>}
          </div>
        </dialog>
      )}
    </div>
  );
}

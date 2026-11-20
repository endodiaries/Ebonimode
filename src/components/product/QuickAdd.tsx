"use client";

import { useState } from "react";
import { addToBag } from "@/lib/bag";
import type { ProductCardData } from "@/lib/data/home";

/**
 * Quick add on a product card: sizes slide up over the photo on hover (or keyboard focus);
 * on touch screens a small "+" opens them. Picking a size puts one in the bag. The bag
 * keeps no prices: checkout reprices everything from the database.
 */
export function QuickAdd({ product }: { product: ProductCardData }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  if (product.sizes.length === 0) return null;

  const add = (size: string, stock: number) => {
    const ok = addToBag(
      { productId: product.id, slug: product.slug, name: product.name, size, image: product.image?.publicId ?? null },
      stock,
    );
    setNote(ok ? `Size ${size} added to your bag` : `No more of size ${size} available`);
  };

  return (
    <div className="quick-add" data-open={open ? "" : undefined}>
      <button
        type="button"
        className="quick-add-toggle"
        aria-expanded={open}
        aria-label={open ? `Close sizes for ${product.name}` : `Quick add ${product.name}`}
        onClick={() => {
          setOpen((o) => !o);
          setNote("");
        }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d={open ? "M6 6l12 12M18 6 6 18" : "M12 5v14M5 12h14"} />
        </svg>
      </button>
      <div className="quick-add-panel">
        <p className="label mb-2" role="status">
          {note || "Quick add"}
        </p>
        <ul aria-label={`Sizes for ${product.name}`} className="flex flex-wrap gap-1">
          {product.sizes.map((s) => (
            <li key={s.size}>
              <button
                type="button"
                disabled={s.stock < 1}
                onClick={() => add(s.size, s.stock)}
                aria-label={`Add size ${s.size}${s.stock < 1 ? " (sold out)" : ""}`}
                className="flex h-9 min-w-9 cursor-pointer items-center justify-center border border-ink/25 px-2 text-sm transition-colors duration-[var(--dur-micro)] hover:border-ink hover:bg-ink hover:text-ivory disabled:cursor-not-allowed disabled:text-ink-soft disabled:line-through disabled:hover:border-ink/25 disabled:hover:bg-transparent"
              >
                {s.size}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

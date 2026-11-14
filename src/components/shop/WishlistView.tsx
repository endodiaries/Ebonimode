"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCardData } from "@/lib/data/home";
import { useWishlist } from "@/lib/wishlist";

/** Saved pieces, newest heart first. Works for guests; signed-in customers get the same list on every device. */
export function WishlistView({ products }: { products: ProductCardData[] }) {
  const ids = useWishlist();
  const saved = [...ids].reverse().flatMap((id) => products.filter((p) => p.id === id));
  if (saved.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-editorial text-2xl italic">Nothing saved yet. Tap the heart on any piece to keep it here.</p>
        <p className="mt-8">
          <Link href="/shop" className="text-link label">
            Shop all →
          </Link>
        </p>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
      {saved.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} index={i} reveal={false} />
        </li>
      ))}
    </ul>
  );
}

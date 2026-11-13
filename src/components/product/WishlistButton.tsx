"use client";

import { HeartIcon } from "@/components/icons";
import { toggleWishlist, useWishlist } from "@/lib/wishlist";

export function WishlistButton({ productId, productName }: { productId: string; productName: string }) {
  const saved = useWishlist().includes(productId);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`${saved ? "Remove" : "Save"} ${productName} ${saved ? "from" : "to"} wishlist`}
      onClick={() => toggleWishlist(productId)}
      className="absolute top-1 right-1 flex h-11 w-11 cursor-pointer items-center justify-center text-ink transition-transform duration-[var(--dur-micro)] active:scale-90"
    >
      <span className="flex h-8 w-8 items-center justify-center bg-ivory/90">
        <HeartIcon size={18} fill={saved ? "currentColor" : "none"} className={saved ? "text-crimson" : ""} />
      </span>
    </button>
  );
}

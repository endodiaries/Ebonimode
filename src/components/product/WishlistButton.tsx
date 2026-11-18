"use client";

import { useRef, useState } from "react";
import { saveWishlistChange } from "@/app/actions";
import { HeartIcon } from "@/components/icons";
import { toggleWishlist, useWishlist } from "@/lib/wishlist";

export function WishlistButton({ productId, productName }: { productId: string; productName: string }) {
  const saved = useWishlist().includes(productId);
  // A short "Saved" / "Removed" note beside the heart, so the change is seen, not just the fill.
  const [note, setNote] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <>
      <button
        type="button"
        aria-pressed={saved}
        aria-label={`${saved ? "Remove" : "Save"} ${productName} ${saved ? "from" : "to"} wishlist`}
        onClick={() => {
          toggleWishlist(productId);
          void saveWishlistChange(productId, !saved);
          setNote(saved ? "Removed" : "Saved");
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setNote(null), 1800);
        }}
        className="absolute top-1 right-1 z-[1] flex h-11 w-11 cursor-pointer items-center justify-center text-ink transition-transform duration-[var(--dur-micro)] active:scale-90"
      >
        <span className="flex h-8 w-8 items-center justify-center bg-ivory/90">
          <HeartIcon size={18} fill={saved ? "currentColor" : "none"} className={saved ? "text-crimson" : ""} />
        </span>
      </button>
      <span
        role="status"
        className={`label pointer-events-none absolute top-2.5 right-12 bg-ink px-2 py-1.5 text-ivory transition-opacity duration-[var(--dur-ui)] ${
          note ? "opacity-100" : "opacity-0"
        }`}
      >
        {note}
      </span>
    </>
  );
}

"use client";

import { useEffect } from "react";
import { mergeWishlist } from "@/app/actions";
import { readWishlist, setWishlist } from "@/lib/wishlist";

/**
 * Once per visit: if the visitor is signed in, merge this device's hearts into their
 * account and bring back anything saved on other devices. Guests are left alone.
 */
export function WishlistSync() {
  useEffect(() => {
    if (window.sessionStorage.getItem("ebonimode:wishlist-synced")) return;
    let cancelled = false;
    mergeWishlist([...readWishlist()])
      .then((ids) => {
        if (cancelled || ids === null) return;
        setWishlist(ids);
        window.sessionStorage.setItem("ebonimode:wishlist-synced", "1");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}

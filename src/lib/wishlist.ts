"use client";

import { useSyncExternalStore } from "react";

/** Wishlist kept in local storage, and merged with the account when signed in (see WishlistSync). */
const KEY = "ebonimode:wishlist";
const EVENT = "ebonimode:wishlist-change";
const EMPTY: readonly string[] = [];
let cache: { raw: string | null; ids: readonly string[] } = { raw: null, ids: EMPTY };

function read(): readonly string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.ids;
  let ids: readonly string[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) ids = parsed.filter((v): v is string => typeof v === "string");
  } catch {
    ids = EMPTY;
  }
  cache = { raw, ids };
  return ids;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function toggleWishlist(productId: string): void {
  const ids = read();
  const next = ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return; // private mode or storage full: nothing to save
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Replaces the saved list, for example after merging with the signed-in account. */
export function setWishlist(ids: readonly string[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(EVENT));
}

export function readWishlist(): readonly string[] {
  return read();
}

export function useWishlist(): readonly string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

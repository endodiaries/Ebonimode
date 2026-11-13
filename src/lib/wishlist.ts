"use client";

import { useSyncExternalStore } from "react";

/** Guest wishlist kept in local storage. Phase 5 merges it into the account on sign-in. */
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

export function useWishlist(): readonly string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

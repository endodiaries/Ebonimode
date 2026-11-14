"use client";

import { useSyncExternalStore } from "react";

/**
 * Guest shopping bag kept in local storage. It stores what was chosen, never a price:
 * the server reprices every line from the database at checkout (Phase 6).
 * The bag page and account merge arrive in Phase 5.
 */
export type BagLine = { productId: string; slug: string; name: string; size: string; qty: number; image: string | null };

const KEY = "ebonimode:bag";
const EVENT = "ebonimode:bag-change";
const EMPTY: readonly BagLine[] = [];
let cache: { raw: string | null; lines: readonly BagLine[] } = { raw: null, lines: EMPTY };

function read(): readonly BagLine[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.lines;
  let lines: readonly BagLine[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      lines = parsed.filter(
        (v): v is BagLine =>
          typeof v === "object" && v !== null && typeof v.productId === "string" && typeof v.size === "string" && typeof v.qty === "number",
      );
    }
  } catch {
    lines = EMPTY;
  }
  cache = { raw, lines };
  return lines;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Adds one of a size, up to `max` (the stock for that size). Returns false if the limit is reached. */
export function addToBag(line: Omit<BagLine, "qty">, max: number): boolean {
  const lines = [...read()];
  const i = lines.findIndex((l) => l.productId === line.productId && l.size === line.size);
  if (i >= 0) {
    if (lines[i].qty >= max) return false;
    lines[i] = { ...lines[i], qty: lines[i].qty + 1 };
  } else {
    if (max < 1) return false;
    lines.push({ ...line, qty: 1 });
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(EVENT));
  return true;
}

export function useBag(): readonly BagLine[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useBagCount(): number {
  return useBag().reduce((n, l) => n + l.qty, 0);
}

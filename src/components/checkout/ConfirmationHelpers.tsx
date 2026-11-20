"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { clearBag } from "@/lib/bag";

/** Empties the bag once the payment is confirmed. */
export function ClearBag() {
  useEffect(() => {
    clearBag();
  }, []);
  return null;
}

/** While the payment is still being confirmed, checks again every few seconds (up to about a minute). */
export function RecheckSoon({ attempt }: { attempt: number }) {
  const router = useRouter();
  useEffect(() => {
    if (attempt >= 15) return;
    const t = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("attempt", String(attempt + 1));
      router.replace(url.pathname + url.search, { scroll: false });
    }, 4000);
    return () => window.clearTimeout(t);
  }, [attempt, router]);
  return null;
}

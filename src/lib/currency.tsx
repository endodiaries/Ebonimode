"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { Currency } from "@/lib/data/home";
import { PRICE_PLACEHOLDER } from "@/lib/price";

/**
 * Display currency. Prices are stored and charged in naira; other currencies are shown
 * converted (and rounded to the currency's step) once an admin enables them with a real rate.
 * The visitor's choice is remembered on the device.
 */
const KEY = "ebonimode:currency";
const EVENT = "ebonimode:currency-change";
const NGN: Currency = { code: "NGN", symbol: "₦", decimals: 0, ratePerNgn: 1, roundingStep: 1 };
const Ctx = createContext<Currency[]>([NGN]);

export function CurrencyProvider({ currencies, children }: { currencies: Currency[]; children: ReactNode }) {
  return <Ctx.Provider value={currencies}>{children}</Ctx.Provider>;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
function readCode(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "NGN";
  } catch {
    return "NGN";
  }
}

export function setCurrency(code: string): void {
  try {
    window.localStorage.setItem(KEY, code);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useCurrencies(): Currency[] {
  return useContext(Ctx);
}

export function useCurrency(): Currency {
  const list = useContext(Ctx);
  const code = useSyncExternalStore(subscribe, readCode, () => "NGN");
  return list.find((c) => c.code === code) ?? list[0] ?? NGN;
}

/** Converts a naira amount for display, rounded to the currency's step. */
export function convert(ngn: number, c: Currency): number {
  return c.code === "NGN" ? ngn : Math.round((ngn * c.ratePerNgn) / c.roundingStep) * c.roundingStep;
}

export function formatIn(ngn: number, c: Currency): string {
  const digits = c.code === "NGN" ? 0 : c.decimals;
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: c.code, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(convert(ngn, c));
}

const list0 = (c: Currency): Currency => (c.code === "NGN" ? c : NGN);

/** A price in the visitor's currency, or the placeholder while a piece has no price yet. */
export function Price({ ngn, tags = [] }: { ngn: number; tags?: readonly string[] }) {
  const c = useCurrency();
  if (tags.includes("sample") || tags.includes("price-pending")) return <>{PRICE_PLACEHOLDER}</>;
  // Other currencies are a guide: we charge in naira, so mark them as approximate.
  if (c.code !== "NGN")
    return (
      <span title={`About ${formatIn(ngn, c)}. You pay ${formatIn(ngn, list0(c))} in naira at checkout.`}>
        <span aria-hidden="true">≈ </span>
        <span className="sr-only">about </span>
        {formatIn(ngn, c)}
      </span>
    );
  return <>{formatIn(ngn, c)}</>;
}

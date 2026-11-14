/** Shown instead of a number until real prices exist. */
export const PRICE_PLACEHOLDER = "[₦ PRICE]";

const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/**
 * Formats a price in naira. Products tagged `sample` carry test values, and real products
 * tagged `price-pending` have no price entered yet, so both show the placeholder.
 * Other currencies arrive with the switcher in Phase 5.
 */
export function formatPrice(priceNgn: number, tags: readonly string[] = []): string {
  if (tags.includes("sample") || tags.includes("price-pending")) return PRICE_PLACEHOLDER;
  return ngn.format(priceNgn);
}

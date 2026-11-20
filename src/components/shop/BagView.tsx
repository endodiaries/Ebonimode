"use client";

import Link from "next/link";
import { CldImage } from "@/components/brand/CldImage";
import { setBagQty, useBag } from "@/lib/bag";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { formatIn, Price, useCurrency } from "@/lib/currency";
import type { ProductCardData } from "@/lib/data/home";

const priced = (p: ProductCardData) => !p.tags.includes("price-pending") && !p.tags.includes("sample");

/**
 * The bag. Lines come from this device; names, photos, prices and stock always come from
 * the live catalogue, so a stale or edited bag can never show the wrong price.
 */
export function BagView({ products }: { products: ProductCardData[] }) {
  const lines = useBag();
  const currency = useCurrency();
  const rows = lines.flatMap((l) => {
    const product = products.find((p) => p.id === l.productId);
    return product ? [{ line: l, product, stock: product.sizes.find((s) => s.size === l.size)?.stock ?? 0 }] : [];
  });
  const gone = lines.length - rows.length;

  if (rows.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-editorial text-2xl">Your bag is empty.</p>
        {gone > 0 && <p className="mt-3 text-ink-soft">Some pieces you added are no longer available.</p>}
        <p className="mt-8 flex flex-wrap justify-center gap-8">
          <Link href="/women" className="text-link label">
            Shop women
          </Link>
          <Link href="/men" className="text-link label">
            Shop men
          </Link>
        </p>
      </div>
    );
  }

  const subtotal = rows.reduce((sum, r) => sum + (priced(r.product) ? r.product.priceNgn * Math.min(r.line.qty, Math.max(r.stock, 0)) : 0), 0);
  const unpriced = rows.some((r) => !priced(r.product));
  const short = rows.some((r) => r.stock < r.line.qty);
  const count = rows.reduce((n, r) => n + r.line.qty, 0);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
      <ul className="border-t border-ink/15">
        {rows.map(({ line, product, stock }) => (
          <li key={`${line.productId}-${line.size}`} className="flex gap-4 border-b border-ink/15 py-6 md:gap-6">
            <Link href={`/product/${product.slug}`} className="relative block h-36 w-28 shrink-0 overflow-hidden bg-sand md:h-44 md:w-36" tabIndex={-1} aria-hidden="true">
              {product.image && cloudinaryEnabled && (
                <span className="absolute inset-x-[6%] top-[5%] bottom-0">
                  <CldImage publicId={product.image.publicId} alt="" sizes="9rem" className="object-contain object-bottom" />
                </span>
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className="text-lg leading-snug font-semibold">
                <Link href={`/product/${product.slug}`} className="hover:underline">
                  {product.name}
                </Link>
              </h2>
              <p className="mt-1 text-ink-soft">Size {line.size}</p>
              <p className="mt-1 font-semibold">
                <Price ngn={product.priceNgn} tags={product.tags} />
              </p>
              {stock < 1 ? (
                <p className="mt-2 text-vermilion">This size has sold out.</p>
              ) : stock < line.qty ? (
                <p className="mt-2 text-vermilion">Only {stock} left in this size.</p>
              ) : null}
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-4">
                <div className="flex items-center border border-ink/30" role="group" aria-label={`Quantity of ${product.name}, size ${line.size}`}>
                  <button type="button" className="h-11 w-11 cursor-pointer text-xl" aria-label="One fewer" onClick={() => setBagQty(line.productId, line.size, line.qty - 1)}>
                    −
                  </button>
                  <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
                    {line.qty}
                  </span>
                  <button
                    type="button"
                    className="h-11 w-11 cursor-pointer text-xl disabled:cursor-not-allowed disabled:text-ink/25"
                    aria-label="One more"
                    disabled={line.qty >= stock}
                    onClick={() => setBagQty(line.productId, line.size, line.qty + 1)}
                  >
                    +
                  </button>
                </div>
                <button type="button" className="text-link label cursor-pointer" onClick={() => setBagQty(line.productId, line.size, 0)}>
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit bg-sand p-6 md:p-8 lg:sticky lg:top-28">
        <h2 className="font-display text-3xl">Summary</h2>
        <dl className="mt-6 space-y-3">
          <div className="flex justify-between gap-4">
            <dt>
              Subtotal ({count} {count === 1 ? "piece" : "pieces"})
            </dt>
            <dd className="font-semibold tabular-nums">{formatIn(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-ink-soft">
            <dt>Delivery</dt>
            <dd>Chosen at checkout</dd>
          </div>
        </dl>
        {currency.code !== "NGN" && <p className="mt-4 text-sm text-ink-soft">Shown in {currency.code} for reference. You will be charged in naira.</p>}
        {unpriced && <p className="mt-4 text-vermilion">One of these pieces has no price yet, so it is not in the subtotal.</p>}
        {short && <p className="mt-4 text-vermilion">Please adjust the pieces marked above before checking out.</p>}
        {unpriced || short ? (
          <button type="button" className="btn mt-6 w-full" disabled>
            Checkout
          </button>
        ) : (
          <Link href="/checkout" className="btn mt-6 w-full">
            Checkout
          </Link>
        )}
        <p className="mt-3 text-sm text-ink-soft">Delivery across Nigeria. Pay by card, bank transfer or USSD.</p>
        <p className="mt-6">
          <Link href="/shop" className="text-link label">
            Keep shopping
          </Link>
        </p>
      </aside>
    </div>
  );
}

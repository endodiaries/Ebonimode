"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { CldImage } from "@/components/brand/CldImage";
import { placeOrder, type CheckoutResult } from "@/app/checkout/actions";
import { useBag } from "@/lib/bag";
import { formatIn, useCurrency } from "@/lib/currency";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import type { ShippingRate } from "@/lib/data/checkout";
import type { ProductCardData } from "@/lib/data/home";
import { contact } from "@/lib/site";

const naira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const REASONS: Record<string, string> = {
  unavailable: "No longer available",
  size_unavailable: "This size is no longer available",
  sold_out: "This size has just sold out",
  low_stock: "Fewer left than you chose",
  no_price: "Not available to order yet",
};

/** Which delivery options fit the chosen state (owner's fees: Lagos Mainland/Island, Abuja, rest of Nigeria). */
function ratesFor(state: string, rates: ShippingRate[]) {
  const ng = rates.filter((r) => r.countries.includes("NG"));
  const pick = state === "Lagos" ? ng.filter((r) => /lagos/i.test(r.name))
    : state.startsWith("FCT") ? ng.filter((r) => /abuja/i.test(r.name))
    : state ? ng.filter((r) => /rest/i.test(r.name)) : [];
  return pick.length ? pick : state ? ng : [];
}

const priced = (p: ProductCardData) => p.priceNgn > 0 && !p.tags.includes("price-pending") && !p.tags.includes("sample");

export function CheckoutForm({
  products,
  rates,
  states,
  defaultEmail,
  defaultName,
}: {
  products: ProductCardData[];
  rates: ShippingRate[];
  states: string[];
  defaultEmail: string;
  defaultName: string;
}) {
  const lines = useBag();
  const currency = useCurrency();
  const [state, setState] = useState("");
  const [rateId, setRateId] = useState("");
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [pending, startTransition] = useTransition();

  const rows = useMemo(
    () =>
      lines.flatMap((l) => {
        const product = products.find((p) => p.id === l.productId);
        return product ? [{ line: l, product }] : [];
      }),
    [lines, products],
  );
  const options = ratesFor(state, rates);
  const rate = options.find((r) => r.id === rateId) ?? (options.length === 1 ? options[0] : undefined);
  const subtotal = rows.reduce((s, r) => s + (priced(r.product) ? r.product.priceNgn * r.line.qty : 0), 0);
  const blocked = rows.some((r) => !priced(r.product));
  const bad = new Set(result?.fields ?? []);

  if (rows.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-editorial text-2xl">Your bag is empty.</p>
        <Link href="/shop" className="text-link label mt-8 inline-block">
          Continue shopping
        </Link>
      </div>
    );
  }

  const submit = (form: FormData) => {
    const get = (k: string) => String(form.get(k) ?? "").trim();
    setResult(null);
    startTransition(async () => {
      const r = await placeOrder({
        lines: rows.map(({ line }) => ({ productId: line.productId, size: line.size, qty: line.qty })),
        email: get("email"),
        fullName: get("fullName"),
        phone: get("phone"),
        line1: get("line1"),
        line2: get("line2"),
        city: get("city"),
        state,
        country: "NG",
        shippingRateId: rate?.id ?? "",
        promoCode: get("promoCode"),
        notes: get("notes"),
      });
      // placeOrder redirects to Paystack on success, so a value here is always an error.
      if (r) setResult(r);
    });
  };

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="label mb-2 block">
        {label}
      </label>
      <input id={name} name={name} className="field" aria-invalid={bad.has(name === "fullName" ? "full_name" : name) || undefined} {...props} />
    </div>
  );

  return (
    <form action={submit} className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16" noValidate>
      <div className="space-y-12">
        <fieldset className="space-y-5">
          <legend className="font-display mb-6 text-xl">Contact</legend>
          {field("email", "Email", { type: "email", autoComplete: "email", required: true, defaultValue: defaultEmail })}
          {field("phone", "Phone number", { type: "tel", autoComplete: "tel", required: true, placeholder: "080…" })}
          <p className="text-base text-ink-soft">We use these only for your order: the receipt and delivery updates.</p>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-display mb-6 text-xl">Delivery address</legend>
          {field("fullName", "Full name", { autoComplete: "name", required: true, defaultValue: defaultName })}
          {field("line1", "Street address", { autoComplete: "address-line1", required: true })}
          {field("line2", "Apartment, landmark (optional)", { autoComplete: "address-line2" })}
          <div className="grid gap-5 sm:grid-cols-2">
            {field("city", "Town or city", { autoComplete: "address-level2", required: true })}
            <div>
              <label htmlFor="state" className="label mb-2 block">
                State
              </label>
              <select
                id="state"
                className="field"
                value={state}
                required
                aria-invalid={bad.has("state") || undefined}
                onChange={(e) => {
                  setState(e.target.value);
                  setRateId("");
                }}
              >
                <option value="">Choose a state</option>
                {states.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-base text-ink-soft">
            We deliver across Nigeria. Ordering from abroad?{" "}
            <a href={contact.whatsappHref} className="text-link" target="_blank" rel="noopener">
              Message us on WhatsApp
            </a>{" "}
            and we will arrange international delivery with you.
          </p>
        </fieldset>

        <fieldset>
          <legend className="font-display mb-6 text-xl">Delivery</legend>
          {options.length === 0 ? (
            <p className="text-ink-soft">Choose your state to see delivery options.</p>
          ) : (
            <ul className="space-y-3">
              {options.map((r) => (
                <li key={r.id}>
                  <label className="flex min-h-14 cursor-pointer items-center gap-4 border border-ink/20 px-4 has-[:checked]:border-ink">
                    <input
                      type="radio"
                      name="rate"
                      value={r.id}
                      checked={rate?.id === r.id}
                      onChange={() => setRateId(r.id)}
                      className="h-4 w-4 accent-[var(--color-ink)]"
                    />
                    <span className="flex-1">
                      {r.name}
                      {r.minDays && r.maxDays && (
                        <span className="block text-base text-ink-soft">
                          {r.minDays} to {r.maxDays} working days after dispatch
                        </span>
                      )}
                    </span>
                    <span className="tabular-nums">{naira(r.priceNgn)}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-base text-ink-soft">Orders are prepared within 1 to 3 working days.</p>
        </fieldset>

        <div>
          <label htmlFor="notes" className="label mb-2 block">
            Note for us (optional)
          </label>
          <textarea id="notes" name="notes" rows={3} maxLength={500} className="field min-h-24" />
        </div>
      </div>

      <aside className="h-fit bg-sand p-6 md:p-8 lg:sticky lg:top-28">
        <h2 className="font-display text-xl">Your order</h2>
        <ul className="mt-6 space-y-4">
          {rows.map(({ line, product }) => {
            const problem = result?.problems?.find((p) => p.product_id === line.productId && p.size === line.size);
            return (
              <li key={`${line.productId}-${line.size}`} className="flex gap-4">
                <span className="card-studio relative block h-20 w-14 shrink-0 overflow-hidden">
                  {product.image && cloudinaryEnabled && (
                    <CldImage publicId={product.image.publicId} alt="" sizes="3.5rem" className="object-contain object-bottom" />
                  )}
                </span>
                <span className="min-w-0 flex-1 text-base">
                  <span className="block leading-snug">{product.name}</span>
                  <span className="block text-ink-soft">
                    Size {line.size} · Qty {line.qty}
                  </span>
                  {problem && <span className="block text-vermilion">{REASONS[problem.reason] ?? "Please check this piece"}</span>}
                </span>
                <span className="text-base tabular-nums">{priced(product) ? naira(product.priceNgn * line.qty) : "—"}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-ink/15 pt-5">
          <label htmlFor="promoCode" className="label mb-2 block">
            Promo code (optional)
          </label>
          <input id="promoCode" name="promoCode" className="field uppercase" autoComplete="off" maxLength={40} />
        </div>

        <dl className="mt-6 space-y-2 border-t border-ink/15 pt-5">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{naira(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd className="tabular-nums">{rate ? naira(rate.priceNgn) : state ? "Choose an option" : "Choose a state"}</dd>
          </div>
          <div className="flex justify-between border-t border-ink/15 pt-3 text-lg font-medium">
            <dt>Total</dt>
            <dd className="tabular-nums">{naira(subtotal + (rate?.priceNgn ?? 0))}</dd>
          </div>
        </dl>
        {currency.code !== "NGN" && (
          <p className="mt-3 text-sm">
            You will be charged {naira(subtotal + (rate?.priceNgn ?? 0))}, about {formatIn(subtotal + (rate?.priceNgn ?? 0), currency)}. Your bank sets the exact
            conversion.
          </p>
        )}
        <p className="mt-2 text-sm text-ink-soft">Prices are checked again when you pay. Any promo code is applied on the payment page total.</p>

        {result?.error && (
          <p role="alert" className="mt-5 text-vermilion">
            {result.error}
          </p>
        )}
        {blocked && <p className="mt-5 text-vermilion">One of these pieces cannot be ordered yet. Please remove it from your bag.</p>}

        <button type="submit" className="btn mt-6 w-full" disabled={pending || blocked || !rate}>
          {pending ? "Taking you to payment…" : `Pay ${naira(subtotal + (rate?.priceNgn ?? 0))}`}
        </button>
        <p className="mt-3 text-sm text-ink-soft">
          You will pay securely with Paystack: card, bank transfer or USSD. By paying you agree to our{" "}
          <Link href="/terms" className="text-link">
            terms of sale
          </Link>
          ,{" "}
          <Link href="/shipping-returns" className="text-link">
            delivery and returns policy
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-link">
            privacy policy
          </Link>
          .
        </p>
        <Link href="/cart" className="text-link label mt-6 inline-block">
          Back to bag
        </Link>
      </aside>
    </form>
  );
}

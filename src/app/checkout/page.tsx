import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getCurrentUser } from "@/lib/auth";
import { getShippingRates, NIGERIAN_STATES } from "@/lib/data/checkout";
import { getCatalogueCards } from "@/lib/data/home";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return (
    <div className="gutter pt-8 pb-24 md:pt-14">
      <div className="mx-auto max-w-[80rem]">
        <h1 className="font-display mb-8 text-3xl md:mb-12 md:text-5xl">Checkout</h1>
        {/* The signed-in shopper (if any) is request-time data, so it streams in. */}
        <Suspense fallback={<div className="h-[40rem] animate-pulse bg-sand" aria-hidden="true" />}>
          <Checkout />
        </Suspense>
      </div>
    </div>
  );
}

async function Checkout() {
  const [products, rates, user] = await Promise.all([getCatalogueCards(), getShippingRates(), getCurrentUser()]);
  return (
    <CheckoutForm
      products={products}
      rates={rates}
      states={NIGERIAN_STATES}
      defaultEmail={user?.email ?? ""}
      defaultName={user?.fullName ?? ""}
    />
  );
}

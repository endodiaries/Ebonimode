import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { isAdmin, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <section className="gutter mx-auto w-full max-w-3xl py-16 md:py-24">
      <p className="label text-ink-soft">Your account</p>
      {/* The session is request-time data, so it streams in behind this boundary. */}
      <Suspense fallback={<div className="mt-4 h-64 animate-pulse bg-sand" aria-hidden="true" />}>
        <AccountDetails />
      </Suspense>
    </section>
  );
}

async function AccountDetails() {
  const user = await requireUser("/account");
  const admin = await isAdmin();
  const firstName = user.fullName?.split(" ")[0];

  return (
    <>
      <h1 className="mt-4 font-display text-3xl text-balance md:text-5xl">{firstName ? `Hello, ${firstName}.` : "Hello."}</h1>
      <dl className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
        <div className="flex flex-wrap justify-between gap-2 py-4">
          <dt className="label self-center text-ink-soft">Name</dt>
          <dd>{user.fullName ?? "Not set yet"}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2 py-4">
          <dt className="label self-center text-ink-soft">Email</dt>
          <dd className="break-all">{user.email}</dd>
        </div>
      </dl>
      <Suspense fallback={<div className="mt-12 h-40 animate-pulse bg-sand" aria-hidden="true" />}>
        <Orders />
      </Suspense>
      <p className="mt-8">
        <Link href="/wishlist" className="text-link label">
          Your wishlist
        </Link>
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-8">
        {admin && (
          <Link href="/admin" className="text-link label">
            Open admin
          </Link>
        )}
        <form action={signOut}>
          <button type="submit" className="text-link label min-h-11 cursor-pointer">
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}

const STATUS: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  processing: "Being prepared",
  shipped: "On its way",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};
const naira = (n: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

/** The shopper's own orders (RLS: only their rows are visible). Unpaid attempts are left out. */
async function Orders() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id,order_number,status,total_ngn,created_at,tracking_number,order_items(product_name,size,quantity)")
    .neq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);
  const orders = data ?? [];
  return (
    <section className="mt-12" aria-labelledby="orders-title">
      <h2 id="orders-title" className="font-display text-xl">
        Your orders
      </h2>
      {orders.length === 0 ? (
        <p className="mt-4 text-ink-soft">You have not placed an order yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
          {orders.map((o) => (
            <li key={o.id} className="py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">Order {o.order_number}</p>
                <p className="label text-ink-soft">{STATUS[o.status] ?? o.status}</p>
              </div>
              <p className="mt-1 text-base text-ink-soft">
                {new Date(o.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })} · {naira(Number(o.total_ngn))}
              </p>
              <p className="mt-2 text-base">
                {(o.order_items ?? []).map((i) => `${i.product_name} (${i.size}) × ${i.quantity}`).join(", ")}
              </p>
              {o.tracking_number && <p className="mt-1 text-base text-ink-soft">Tracking: {o.tracking_number}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

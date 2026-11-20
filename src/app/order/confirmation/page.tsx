import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClearBag, RecheckSoon } from "@/components/checkout/ConfirmationHelpers";
import { contact } from "@/lib/site";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

type Verify = { status?: string; orderNumber?: number; error?: string };

/** Asks our server to confirm the payment with Paystack. The browser's word is never enough. */
async function verify(provider: string, reference: string): Promise<Verify> {
  try {
    const url = `${supabaseUrl}/functions/v1/payment-verify?provider=${encodeURIComponent(provider)}&reference=${encodeURIComponent(reference)}`;
    const res = await fetch(url, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: "no-store" });
    return (await res.json()) as Verify;
  } catch {
    return { error: "unreachable" };
  }
}

export default function ConfirmationPage({ searchParams }: PageProps<"/order/confirmation">) {
  return (
    <section className="gutter mx-auto w-full max-w-2xl py-20 text-center md:py-28">
      <Suspense fallback={<p className="text-ink-soft">Checking your payment…</p>}>
        <Result searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Result({ searchParams }: { searchParams: PageProps<"/order/confirmation">["searchParams"] }) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const provider = one(sp.provider) || "paystack";
  const reference = one(sp.reference) || one(sp.trxref);
  const attempt = Number(one(sp.attempt)) || 0;

  if (!/^EBM-[\w-]{1,40}$/.test(reference)) {
    return <Message title="We could not find that order." body="If you have just paid, please check your email for a receipt, or contact us." />;
  }

  const r = await verify(provider, reference);

  if (r.status === "paid" || r.status === "already_paid") {
    return (
      <>
        <ClearBag />
        <p className="label text-ink-soft">Order confirmed</p>
        <h1 className="font-display mt-5 text-3xl md:text-5xl">Thank you.</h1>
        <p className="font-editorial mt-6 text-xl">
          {r.orderNumber ? `Your order number is ${r.orderNumber}.` : "Your payment is confirmed."} We will prepare it within 1 to 3 working days and let you know when it is on its way.
        </p>
        <p className="mt-4 text-ink-soft">Your payment reference: {reference}</p>
        <p className="mt-10 flex flex-wrap justify-center gap-8">
          <Link href="/account" className="text-link label">
            Your account
          </Link>
          <Link href="/shop" className="text-link label">
            Continue shopping
          </Link>
        </p>
      </>
    );
  }

  if (r.status === "pending" || r.error) {
    return (
      <>
        {attempt < 15 && <RecheckSoon attempt={attempt} />}
        <p className="label text-ink-soft">One moment</p>
        <h1 className="font-display mt-5 text-3xl md:text-4xl">Confirming your payment</h1>
        <p className="mt-6 text-ink-soft" role="status">
          {attempt < 15
            ? "Paystack is still confirming your payment. This page will update by itself."
            : "This is taking longer than usual. If money has left your account, your order is safe: we will confirm it by email. Questions? Contact us below."}
        </p>
        <Contact reference={reference} />
      </>
    );
  }

  if (r.status === "failed" || r.status === "abandoned") {
    return (
      <>
        <p className="label text-ink-soft">Payment not completed</p>
        <h1 className="font-display mt-5 text-3xl md:text-4xl">Your payment did not go through</h1>
        <p className="mt-6 text-ink-soft">Nothing has been charged, and your bag is just as you left it.</p>
        <p className="mt-10 flex flex-wrap justify-center gap-8">
          <Link href="/checkout" className="text-link label">
            Try again
          </Link>
          <Link href="/cart" className="text-link label">
            Back to bag
          </Link>
        </p>
      </>
    );
  }

  return <Message title="We need to check this order." body="Something did not match on your payment, so we will review it and contact you. You do not need to pay again." reference={reference} />;
}

function Message({ title, body, reference }: { title: string; body: string; reference?: string }) {
  return (
    <>
      <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
      <p className="mt-6 text-ink-soft">{body}</p>
      <Contact reference={reference} />
    </>
  );
}

function Contact({ reference }: { reference?: string }) {
  return (
    <p className="mt-8 text-base text-ink-soft">
      Email{" "}
      <a href={`mailto:${contact.email}${reference ? `?subject=Order ${reference}` : ""}`} className="text-link">
        {contact.email}
      </a>{" "}
      or WhatsApp{" "}
      <a href={contact.whatsappHref} className="text-link" target="_blank" rel="noopener">
        {contact.phone}
      </a>
      {reference ? ` with reference ${reference}.` : "."}
    </p>
  );
}

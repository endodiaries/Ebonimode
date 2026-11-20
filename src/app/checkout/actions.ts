"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/env";

export type CheckoutInput = {
  lines: { productId: string; size: string; qty: number }[];
  email: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  shippingRateId: string;
  promoCode: string;
  notes: string;
};

export type CheckoutResult = {
  error: string;
  fields?: string[];
  problems?: { product_id: string; size: string; reason: string }[];
};

const MESSAGES: Record<string, string> = {
  empty_bag: "Your bag is empty.",
  missing_fields: "Please complete the highlighted details.",
  bag_changed: "Something in your bag has changed. Please check the pieces marked below.",
  delivery_unavailable: "That delivery option is not available for this address. Please choose another.",
  promo_invalid: "That code is not valid.",
  promo_min_spend: "Your bag does not reach the minimum spend for that code.",
  promo_not_applicable: "That code does not apply to the pieces in your bag.",
  currency_not_supported_by_provider: "Payment in this currency is not available yet.",
};
const FALLBACK = "We could not start your payment just now. Nothing has been charged. Please try again.";

/** Calls one of our Supabase Edge Functions from the server, as the signed-in shopper if there is one. */
async function callFunction(name: string, body: unknown, accessToken?: string) {
  const res = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken ?? supabaseKey}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, data };
}

/**
 * Places the order and sends the shopper to Paystack. The server reprices the bag from the
 * database (create-order) and asks Paystack for a payment page (payment-initiate); neither
 * trusts a price from the browser. The order becomes paid only after verification.
 */
export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;

  const created = await callFunction(
    "create-order",
    {
      lines: input.lines.map((l) => ({ product_id: l.productId, size: l.size, qty: l.qty })),
      email: input.email,
      full_name: input.fullName,
      phone: input.phone,
      address: { line1: input.line1, line2: input.line2, city: input.city, state: input.state, country: input.country },
      shipping_rate_id: input.shippingRateId,
      promo_code: input.promoCode,
      notes: input.notes,
    },
    token,
  );
  if (!created.ok) {
    const code = String(created.data.error ?? "");
    return {
      error: MESSAGES[code] ?? FALLBACK,
      fields: Array.isArray(created.data.fields) ? (created.data.fields as string[]) : undefined,
      problems: Array.isArray(created.data.problems) ? (created.data.problems as CheckoutResult["problems"]) : undefined,
    };
  }

  const started = await callFunction(
    "payment-initiate",
    { order_id: created.data.order_id, provider: "paystack", access_token: created.data.access_token },
    token,
  );
  const url = typeof started.data.redirect_url === "string" ? started.data.redirect_url : "";
  // Only ever send shoppers to Paystack's own checkout.
  if (!started.ok || !url.startsWith("https://checkout.paystack.com/")) {
    return { error: MESSAGES[String(started.data.error ?? "")] ?? FALLBACK };
  }
  redirect(url);
}

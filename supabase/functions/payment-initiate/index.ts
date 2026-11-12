// POST { order_id, provider: "paystack" | "flutterwave" | "installment", payment_type?: "full" | "installment", access_token? }
// Returns { redirect_url }. The order must already exist with status "pending"; the price is read
// from the database, NEVER from the browser.
import { adminClient, corsHeaders, json } from "../_shared/supabase.ts";
import { getProvider } from "../_shared/providers/index.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const body = await req.json().catch(() => null);
  if (!body?.order_id || !body?.provider) return json({ error: "order_id and provider are required" }, 400);

  const provider = getProvider(body.provider);
  if (!provider) return json({ error: "unknown_provider" }, 400);
  const paymentType = body.payment_type === "installment" ? "installment" : "full";

  const admin = adminClient();
  const { data: order } = await admin.from("orders").select("*").eq("id", body.order_id).single();
  if (!order) return json({ error: "order_not_found" }, 404);
  if (order.status !== "pending") return json({ error: "order_not_payable" }, 409);

  // Authorise: signed-in owner OR guest holding the order's access_token
  let allowed = false;
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (bearer) {
    const { data: { user } } = await admin.auth.getUser(bearer);
    allowed = !!user && order.user_id === user.id;
  }
  if (!allowed && body.access_token && body.access_token === order.access_token) allowed = true;
  if (!allowed) return json({ error: "forbidden" }, 403);

  // Installments: NGN + Nigeria + within admin-set limits (enforced here, not just in the UI)
  if (paymentType === "installment") {
    const { data: setting } = await admin.from("site_settings").select("value").eq("key", "bnpl_limits").maybeSingle();
    const { min_ngn = 0, max_ngn = Number.MAX_SAFE_INTEGER } = setting?.value ?? {};
    const due = Number(order.total_ngn) - Number(order.gift_card_ngn);
    if (order.currency !== "NGN" || order.shipping_address?.country !== "NG" || due < min_ngn || due > max_ngn) {
      return json({ error: "installment_not_available" }, 422);
    }
  }

  const dueNgn = Number(order.total_ngn) - Number(order.gift_card_ngn);
  if (dueNgn <= 0) return json({ error: "nothing_to_pay" }, 422); // fully covered by gift card: settle in create-order flow

  // The currency must be chargeable through THIS provider (admin-controlled in the currencies table)
  const { data: cur } = await admin.from("currencies").select("*").eq("code", order.currency).maybeSingle();
  if (!cur || !cur.charge_enabled || !(cur.charge_providers ?? []).includes(provider.name)) {
    return json({ error: "currency_not_supported_by_provider", currency: order.currency, provider: provider.name }, 422);
  }

  // Single source of truth for the amount: computed in the database from the order's snapshot rate
  const { data: amountMinor, error: amtErr } = await admin.rpc("set_order_amount_due", { p_order: order.id });
  if (amtErr || !amountMinor) return json({ error: "amount_failed" }, 500);

  const reference = `EBM-${order.order_number}-${crypto.randomUUID().slice(0, 8)}`;
  const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

  try {
    const result = await provider.initiate({
      reference,
      email: order.email,
      amountMinor: Number(amountMinor),
      decimals: cur.decimals,
      currency: order.currency,
      callbackUrl: `${siteUrl}/order/confirmation?provider=${provider.name}&reference=${reference}`,
      metadata: { order_id: order.id, order_number: order.order_number },
    });

    await admin.from("orders").update({
      payment_provider: provider.name,
      payment_type: paymentType,
      payment_reference: reference,
      last_payment_status: "initiated",
    }).eq("id", order.id);

    return json({ redirect_url: result.redirectUrl });
  } catch (err) {
    console.error("payment-initiate failed", err);
    return json({ error: "initiate_failed" }, 502);
  }
});

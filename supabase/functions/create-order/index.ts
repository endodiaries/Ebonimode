// POST {
//   lines: [{ product_id, size, qty }],
//   email, full_name, phone,
//   address: { line1, line2?, city, state, country },
//   shipping_rate_id, promo_code?, notes?
// }
// Optional header Authorization: Bearer <user access token> links the order to the signed-in shopper.
// Returns { order_id, order_number, access_token, total_ngn }.
//
// Every price, the delivery fee and any discount are read from the database here. The browser
// only says WHAT was chosen, never what it costs. The order is created "pending"; it becomes
// paid only after payment-verify / payment-webhook confirm with the provider.
import { adminClient, corsHeaders, json } from "../_shared/supabase.ts";

type Line = { product_id: string; size: string; qty: number };
const MAX_LINES = 30;
const MAX_QTY = 10;
const isUuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);
const text = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.lines)) return json({ error: "invalid_request" }, 400);

  // ---- Validate the shopper's input (shape only; values come from the database) ----
  const lines: Line[] = body.lines
    .slice(0, MAX_LINES)
    .filter((l: Line) => isUuid(l?.product_id) && typeof l?.size === "string" && Number.isInteger(l?.qty) && l.qty > 0)
    .map((l: Line) => ({ product_id: l.product_id, size: l.size.slice(0, 12), qty: Math.min(l.qty, MAX_QTY) }));
  if (lines.length === 0) return json({ error: "empty_bag" }, 422);

  const email = text(body.email, 254).toLowerCase();
  const fullName = text(body.full_name, 120);
  const phone = text(body.phone, 32);
  const address = {
    full_name: fullName,
    phone,
    line1: text(body.address?.line1),
    line2: text(body.address?.line2) || null,
    city: text(body.address?.city, 80),
    state: text(body.address?.state, 80),
    country: text(body.address?.country, 2).toUpperCase(),
  };
  const missing = [
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && "email",
    !fullName && "full_name",
    phone.replace(/\D/g, "").length < 7 && "phone",
    !address.line1 && "line1",
    !address.city && "city",
    !address.state && "state",
    !address.country && "country",
    !isUuid(body.shipping_rate_id) && "shipping_rate_id",
  ].filter(Boolean);
  if (missing.length) return json({ error: "missing_fields", fields: missing }, 422);

  const admin = adminClient();

  // ---- Who is ordering (optional) ----
  let userId: string | null = null;
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (bearer && bearer.split(".").length === 3) {
    const { data } = await admin.auth.getUser(bearer);
    userId = data.user?.id ?? null;
  }

  // ---- Reprice every line from the database ----
  const ids = [...new Set(lines.map((l) => l.product_id))];
  const { data: products, error: pErr } = await admin
    .from("products")
    .select("id,name,price_ngn,status,tags,product_variants(id,size,stock,colour,sku,price_override_ngn),product_images(cloudinary_public_id,sort_order),product_collections(collection_id)")
    .in("id", ids);
  if (pErr) return json({ error: "catalogue_unavailable" }, 500);

  type Variant = { id: string; size: string | null; stock: number; colour: string | null; sku: string | null; price_override_ngn: number | null };
  const items: {
    variant_id: string; product_id: string; collection_ids: string[]; product_name: string; colour: string | null;
    size: string; sku: string | null; image_public_id: string | null; unit_price_ngn: number; quantity: number;
  }[] = [];
  const problems: { product_id: string; size: string; reason: string }[] = [];

  for (const l of lines) {
    const p = products?.find((x) => x.id === l.product_id);
    if (!p || p.status !== "published") { problems.push({ ...l, reason: "unavailable" }); continue; }
    const variant = (p.product_variants as Variant[]).find((v) => v.size === l.size);
    if (!variant) { problems.push({ ...l, reason: "size_unavailable" }); continue; }
    if (variant.stock < l.qty) { problems.push({ ...l, reason: variant.stock > 0 ? "low_stock" : "sold_out" }); continue; }
    const price = Number(variant.price_override_ngn ?? p.price_ngn);
    if (!(price > 0) || (p.tags ?? []).includes("price-pending") || (p.tags ?? []).includes("sample")) {
      problems.push({ ...l, reason: "no_price" });
      continue;
    }
    const image = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
    items.push({
      variant_id: variant.id,
      product_id: p.id,
      collection_ids: (p.product_collections ?? []).map((c: { collection_id: string }) => c.collection_id),
      product_name: p.name,
      colour: variant.colour,
      size: l.size,
      sku: variant.sku,
      image_public_id: image?.cloudinary_public_id ?? null,
      unit_price_ngn: price,
      quantity: l.qty,
    });
  }
  // Never charge for a different bag than the shopper saw: any problem stops the order.
  if (problems.length) return json({ error: "bag_changed", problems }, 409);

  const subtotal = items.reduce((s, i) => s + i.unit_price_ngn * i.quantity, 0);

  // ---- Delivery: the rate must be active and serve the address's country ----
  const { data: rate } = await admin
    .from("shipping_rates")
    .select("id,name,price_ngn,is_active,shipping_zones(countries,is_active)")
    .eq("id", body.shipping_rate_id)
    .maybeSingle();
  const zone = rate?.shipping_zones as { countries: string[]; is_active: boolean } | null;
  if (!rate || !rate.is_active || !zone?.is_active || !zone.countries.includes(address.country)) {
    return json({ error: "delivery_unavailable" }, 422);
  }
  const shipping = Number(rate.price_ngn);

  // ---- Promo code (optional) ----
  let discount = 0;
  let promoId: string | null = null;
  const code = text(body.promo_code, 40).toUpperCase();
  if (code) {
    const { data: promo } = await admin.from("promo_codes").select("*").ilike("code", code).maybeSingle();
    const now = Date.now();
    const valid = promo && promo.is_active
      && (!promo.starts_at || Date.parse(promo.starts_at) <= now)
      && (!promo.ends_at || Date.parse(promo.ends_at) >= now)
      && (promo.usage_limit == null || promo.times_used < promo.usage_limit);
    if (!valid) return json({ error: "promo_invalid" }, 422);
    // Restricted codes apply only to the matching pieces.
    const restricted = promo.applies_to_product_ids.length > 0 || promo.applies_to_collection_ids.length > 0;
    const eligible = items
      .filter((i) => !restricted || promo.applies_to_product_ids.includes(i.product_id) || i.collection_ids.some((c) => promo.applies_to_collection_ids.includes(c)))
      .reduce((s, i) => s + i.unit_price_ngn * i.quantity, 0);
    if (promo.min_spend_ngn && subtotal < Number(promo.min_spend_ngn)) return json({ error: "promo_min_spend", min_spend_ngn: Number(promo.min_spend_ngn) }, 422);
    if (eligible <= 0) return json({ error: "promo_not_applicable" }, 422);
    discount = promo.discount_type === "percentage" ? Math.round((eligible * Number(promo.value)) / 100) : Math.min(Number(promo.value), eligible);
    promoId = promo.id;
  }

  const total = subtotal - discount + shipping;

  // ---- Create the pending order and its line snapshots ----
  const { data: order, error: oErr } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      email,
      status: "pending",
      currency: "NGN",
      exchange_rate: 1,
      subtotal_ngn: subtotal,
      discount_ngn: discount,
      gift_card_ngn: 0,
      shipping_ngn: shipping,
      total_ngn: total,
      promo_code_id: promoId,
      shipping_address: address,
      shipping_rate_name: rate.name,
      notes: text(body.notes, 500) || null,
    })
    .select("id,order_number,access_token")
    .single();
  if (oErr || !order) return json({ error: "order_failed" }, 500);

  const { error: iErr } = await admin.from("order_items").insert(
    items.map(({ product_id: _p, collection_ids: _c, ...i }) => ({ ...i, order_id: order.id })),
  );
  if (iErr) {
    await admin.from("orders").update({ status: "cancelled", notes: "Could not save the items" }).eq("id", order.id);
    return json({ error: "order_failed" }, 500);
  }

  // Lock the order to its currency and rate (NGN only for now).
  const { error: cErr } = await admin.rpc("snapshot_order_currency", { p_order: order.id, p_currency: "NGN" });
  if (cErr) return json({ error: "currency_failed" }, 500);

  return json({ order_id: order.id, order_number: order.order_number, access_token: order.access_token, total_ngn: total });
});

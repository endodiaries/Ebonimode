// Called by the order-confirmation page after the shopper returns from the provider.
// GET/POST ?provider=paystack&reference=EBM-1001-ab12cd34
// Gives instant feedback without waiting for the webhook; both paths share settlePayment() so it is safe.
import { adminClient, corsHeaders, json } from "../_shared/supabase.ts";
import { getProvider } from "../_shared/providers/index.ts";
import { settlePayment } from "../_shared/settle.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const provider = getProvider(url.searchParams.get("provider"));
  const reference = url.searchParams.get("reference");
  if (!provider || !reference) return json({ error: "provider and reference are required" }, 400);

  try {
    const admin = adminClient();
    const result = await settlePayment(admin, provider, reference);
    // Minimal response on purpose: no personal data leaves this endpoint.
    return json({ status: result.status, orderNumber: "orderNumber" in result ? result.orderNumber : undefined });
  } catch (err) {
    console.error("payment-verify failed", err);
    return json({ error: "verification_failed" }, 500);
  }
});

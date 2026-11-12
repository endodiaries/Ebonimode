// Webhook endpoint. Register per provider in each dashboard:
//   https://<project-ref>.supabase.co/functions/v1/payment-webhook?provider=paystack
//   https://<project-ref>.supabase.co/functions/v1/payment-webhook?provider=flutterwave
//   https://<project-ref>.supabase.co/functions/v1/payment-webhook?provider=installment
import { adminClient } from "../_shared/supabase.ts";
import { getProvider } from "../_shared/providers/index.ts";
import { settlePayment } from "../_shared/settle.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const provider = getProvider(new URL(req.url).searchParams.get("provider"));
  if (!provider) return new Response("Unknown provider", { status: 400 });

  // 1. Raw body is required for signature verification. Do not parse before verifying.
  const raw = await req.text();
  if (!(await provider.verifyWebhookSignature(raw, req.headers))) {
    console.warn(`[${provider.name}] invalid webhook signature`);
    return new Response("Invalid signature", { status: 401 });
  }

  let parsed;
  try {
    parsed = provider.parseWebhook(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const admin = adminClient();

  // 2. Idempotency: record the event; skip if we already processed it.
  const { data: row, error: insertError } = await admin
    .from("webhook_events")
    .insert({ provider: provider.name, event_id: parsed.eventId, payload: JSON.parse(raw) })
    .select("id")
    .single();

  let eventRowId: string;
  if (insertError) {
    if (insertError.code !== "23505") {
      console.error("webhook_events insert failed", insertError);
      return new Response("Server error", { status: 500 }); // provider will retry
    }
    const { data: existing } = await admin
      .from("webhook_events").select("id, processed_at")
      .eq("provider", provider.name).eq("event_id", parsed.eventId).single();
    if (existing?.processed_at) return new Response("ok (duplicate)", { status: 200 });
    eventRowId = existing!.id; // earlier attempt crashed before finishing: process again
  } else {
    eventRowId = row.id;
  }

  // 3. Process payment events only; acknowledge everything else.
  try {
    if (parsed.reference && provider.isPaymentEvent(parsed.eventType)) {
      const result = await settlePayment(admin, provider, parsed.reference);
      console.log(`[${provider.name}] ${parsed.reference} -> ${result.status}`);
      // TODO (emails): when result.status === "paid", enqueue the order confirmation + receipt email
      //   and an admin alert if result.needsAttention is true.
    }
    await admin.from("webhook_events").update({ processed_at: new Date().toISOString() }).eq("id", eventRowId);
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error(`[${provider.name}] processing failed`, err);
    return new Response("Processing error", { status: 500 }); // non-2xx makes the provider retry
  }
});

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import type { PaymentProvider } from "./providers/types.ts";

export type SettleResult =
  | { status: "paid"; orderNumber?: number; needsAttention?: boolean }
  | { status: "already_paid" }
  | { status: "pending" | "failed" | "abandoned" }
  | { status: "mismatch" | "not_found" };

/**
 * The single place where an order becomes paid. Used by BOTH the webhook and the return-page verify call,
 * so whichever arrives first wins and the second is a harmless no-op (finalize_order_payment is idempotent).
 */
export async function settlePayment(
  admin: SupabaseClient,
  provider: PaymentProvider,
  reference: string,
): Promise<SettleResult> {
  const { data: ord } = await admin.from("orders").select("currency").eq("payment_reference", reference).maybeSingle();
  if (!ord) return { status: "not_found" };
  const { data: cur } = await admin.from("currencies").select("decimals").eq("code", ord.currency).maybeSingle();
  const verified = await provider.verify(reference, cur?.decimals ?? 2); // always confirm with the provider API

  if (verified.status !== "success") {
    await admin.rpc("record_payment_attempt", { p_reference: reference, p_status: verified.status });
    return { status: verified.status };
  }

  const { data, error } = await admin.rpc("finalize_order_payment", {
    p_reference: reference,
    p_provider: provider.name,
    p_paid_minor: verified.amountMinor,
    p_currency: verified.currency,
  });
  if (error) throw new Error(`finalize_order_payment failed: ${error.message}`);

  switch (data.result) {
    case "paid": return { status: "paid", orderNumber: data.order_number, needsAttention: data.needs_attention };
    case "already_processed": return { status: "already_paid" };
    case "amount_mismatch": return { status: "mismatch" };
    default: return { status: "not_found" };
  }
}

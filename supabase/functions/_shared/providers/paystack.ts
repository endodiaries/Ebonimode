import { hmac, safeEqual, toHex } from "../crypto.ts";
import type { PaymentProvider } from "./types.ts";

const BASE = "https://api.paystack.co";
const secret = () => {
  const s = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!s) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return s;
};
const authHeaders = () => ({ Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" });

export const paystack: PaymentProvider = {
  name: "paystack",

  async initiate(i) {
    const res = await fetch(`${BASE}/transaction/initialize`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        email: i.email,
        amount: i.amountMinor,
        currency: i.currency,
        reference: i.reference,
        callback_url: i.callbackUrl,
        metadata: i.metadata,
      }),
    });
    const j = await res.json();
    if (!res.ok || !j.status) throw new Error(`Paystack initialize failed: ${j.message ?? res.status}`);
    return { redirectUrl: j.data.authorization_url, providerReference: j.data.reference };
  },

  // Paystack: HMAC-SHA512 of the raw body with your secret key, hex, in x-paystack-signature
  async verifyWebhookSignature(rawBody, headers) {
    const sig = headers.get("x-paystack-signature");
    if (!sig) return false;
    return safeEqual(toHex(await hmac("SHA-512", secret(), rawBody)), sig);
  },

  parseWebhook(rawBody) {
    const e = JSON.parse(rawBody);
    const ref = e?.data?.reference ?? null;
    return { eventId: `${e.event}:${e?.data?.id ?? ref}`, eventType: e.event, reference: ref };
  },

  isPaymentEvent: (t) => t === "charge.success",

  async verify(reference) {
    const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, { headers: authHeaders() });
    const j = await res.json();
    if (!res.ok || !j.status) throw new Error(`Paystack verify failed: ${j.message ?? res.status}`);
    const d = j.data;
    const status = d.status === "success" ? "success"
      : d.status === "abandoned" ? "abandoned"
      : d.status === "failed" || d.status === "reversed" ? "failed"
      : "pending";
    return { reference: d.reference, status, amountMinor: Number(d.amount), currency: d.currency, raw: d };
  },
};

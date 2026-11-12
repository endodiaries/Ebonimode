import { hmac, safeEqual, toBase64 } from "../crypto.ts";
import type { PaymentProvider } from "./types.ts";

// Flutterwave has two API generations. Set FLUTTERWAVE_API_VERSION=v3 or v4 to match your account.
// Webhook signatures are handled for both; initiate/verify are implemented for v3 only.
// For v4 (OAuth + new endpoints) ask Claude Code to implement initiate/verify from the current docs
// at https://developer.flutterwave.com/docs
const version = () => Deno.env.get("FLUTTERWAVE_API_VERSION") ?? "v3";
const secretKey = () => {
  const s = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
  if (!s) throw new Error("FLUTTERWAVE_SECRET_KEY is not set");
  return s;
};
const secretHash = () => {
  const s = Deno.env.get("FLUTTERWAVE_SECRET_HASH");
  if (!s) throw new Error("FLUTTERWAVE_SECRET_HASH is not set");
  return s;
};
const needV3 = () => {
  if (version() !== "v3") throw new Error("Flutterwave v4 initiate/verify not implemented yet. See comment at top of flutterwave.ts");
};

export const flutterwave: PaymentProvider = {
  name: "flutterwave",

  // v3: plain secret-hash equality in `verif-hash`.
  // v4: base64(HMAC-SHA256(rawBody, secretHash)) in `flutterwave-signature`.
  async verifyWebhookSignature(rawBody, headers) {
    const v4 = headers.get("flutterwave-signature");
    if (v4) return safeEqual(toBase64(await hmac("SHA-256", secretHash(), rawBody)), v4);
    const v3 = headers.get("verif-hash");
    return v3 ? safeEqual(secretHash(), v3) : false;
  },

  parseWebhook(rawBody) {
    const e = JSON.parse(rawBody);
    const d = e.data ?? {};
    const ref = d.tx_ref ?? d.reference ?? null;
    const type = e.event ?? e.type ?? "unknown";
    return { eventId: `${type}:${d.id ?? ref}`, eventType: type, reference: ref };
  },

  isPaymentEvent: (t) => t === "charge.completed",

  async initiate(i) {
    needV3();
    const res = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_ref: i.reference,
        amount: i.amountMinor / 10 ** i.decimals,   // v3 uses major units
        currency: i.currency,
        redirect_url: i.callbackUrl,
        customer: { email: i.email },
        customizations: { title: "Ebonímode" },
        meta: i.metadata,
      }),
    });
    const j = await res.json();
    if (!res.ok || j.status !== "success") throw new Error(`Flutterwave initiate failed: ${j.message ?? res.status}`);
    return { redirectUrl: j.data.link, providerReference: i.reference };
  },

  async verify(reference, decimals = 2) {
    needV3();
    const res = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey()}` } },
    );
    const j = await res.json();
    if (!res.ok) throw new Error(`Flutterwave verify failed: ${j.message ?? res.status}`);
    const d = j.data;
    if (!d) return { reference, status: "pending", amountMinor: 0, currency: "", raw: j };
    const status = d.status === "successful" ? "success" : d.status === "failed" ? "failed" : "pending";
    return { reference, status, amountMinor: Math.round(Number(d.amount) * 10 ** decimals), currency: d.currency, raw: d };
  },
};

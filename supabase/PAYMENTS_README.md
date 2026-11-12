# EBONIMODE: Payments & Installment Webhooks

Supabase Edge Functions (Deno) plus one SQL migration. Drop the `supabase/` contents into your project.

## How it works
```
Checkout page
  1. create-order (server)  -> prices cart FROM THE DATABASE, creates order status "pending"   [Claude Code builds this, prompt below]
  2. payment-initiate       -> creates a unique reference, asks the provider for a payment page, returns redirect_url
  3. Shopper pays on Paystack / Flutterwave / installment provider
  4. Two things happen, in either order, and both are safe:
       a. provider -> payment-webhook   (signature checked, event de-duplicated)
       b. shopper returns to /order/confirmation -> payment-verify
     Both call settlePayment(): ask the provider's API if the payment really succeeded, then call the SQL function
     finalize_order_payment(), which in ONE transaction checks the amount, decrements stock, redeems the gift card,
     counts the promo and marks the order paid. A second call is a no-op.
```
Security rules baked in: prices never come from the browser; webhook payloads are never trusted (we re-verify with the provider API); amounts and currency are compared before an order is marked paid; webhook events are stored once (`webhook_events`); the finalize function can only be run by the service role.

Edge cases it flags for you instead of hiding: underpaid or wrong-currency payments (order stays pending, `needs_attention = true`), oversold stock, changed gift card balance. The admin dashboard should show a "Needs attention" badge on those orders.

Stock design: pending orders do NOT hold stock; stock is taken when payment is confirmed. This is simple and avoids stuck reservations. If two shoppers pay for the last item, the second order is marked paid but flagged "insufficient stock" for you to resolve (refund or restock).

## Files
- `migrations/0002_payments.sql`: extra order columns, `finalize_order_payment()`, `record_payment_attempt()`, `cancel_stale_pending_orders()`
- `migrations/0003_inventory.sql`: inventory system (suppliers, purchase orders, stock movement ledger, reorder levels, back-in-stock requests, admin stock functions, low-stock view)
- `migrations/0004_looks.sql`: "Shop the Look" lookbooks with product hotspots on campaign photos
- `migrations/0005_hero_slides.sql`: admin-editable homepage hero slides (colour, batik fill, model image)
- `migrations/0005_currencies.sql`: multi-currency (currencies table, per-provider charge rules, exact amount computed once per order, zero-decimal currencies, updated `finalize_order_payment`)
- `functions/_shared/`: crypto helpers, Supabase client, `settle.ts`, and provider adapters (`paystack.ts`, `flutterwave.ts`, `installment.ts`)
- `functions/payment-initiate`, `payment-webhook`, `payment-verify`
- `config.toml.snippet`: turns off JWT checks for these three functions (they do their own authentication)

## Setup
1. Run the migrations in order (`supabase db push`): 0001 (main schema, in the parent folder), then 0002, 0003, 0004 and 0005.
2. Set secrets: `supabase secrets set PAYSTACK_SECRET_KEY=sk_test_... SITE_URL=https://yourdomain.com` and, if using Flutterwave, `FLUTTERWAVE_SECRET_KEY=... FLUTTERWAVE_SECRET_HASH=... FLUTTERWAVE_API_VERSION=v3`. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically in deployed functions.
3. Merge `config.toml.snippet` into `supabase/config.toml`, then `supabase functions deploy payment-initiate payment-webhook payment-verify`.
4. In the Paystack dashboard (Settings > API Keys & Webhooks) set the webhook URL to `https://<project-ref>.supabase.co/functions/v1/payment-webhook?provider=paystack`. For Flutterwave, set the same URL with `provider=flutterwave` and enter the same secret hash you put in `FLUTTERWAVE_SECRET_HASH`.
5. Add the `bnpl_limits` setting for installments: `insert into site_settings (key, value) values ('bnpl_limits', '{"min_ngn": 20000, "max_ngn": 500000}');` (use the limits your installment provider actually gives you).
6. Use TEST keys first. Run a test payment, confirm the order flips to `paid`, stock drops, and a replayed webhook does nothing.

## Tested here
Migrations 0001 to 0003 were run end-to-end in an in-memory Postgres: payment finalisation (underpaid rejected, paid once, replay ignored), automatic stock ledger, admin adjustments (cannot go negative, non-admins blocked), and purchase-order receiving. Row Level Security was not exercised there, so test RLS on a real Supabase project. Edge Functions were type-checked with Deno and the signature checks run successfully (Paystack HMAC-SHA512 valid/invalid/missing; Flutterwave v3 and v4 styles). NOT tested against live provider APIs or a real database; do the sandbox run in step 6 before going live.

## Currencies (launch set: NGN, USD, GBP, EUR, CAD, GHS)
Run `0005`, then set a **real rate** per currency (`rate_per_ngn`: how many units of that currency one naira buys), a rounding step, and turn on `display_enabled`. Turn on `charge_enabled` only after confirming the currency is active on that provider account. The first provider in `charge_providers` is the default at checkout.
```sql
update currencies set rate_per_ngn = <rate>, display_enabled = true, charge_enabled = true where code = 'GBP';
```
Who can charge what:
- NGN: Paystack (default) or Flutterwave; installments NGN only.
- USD: Paystack (needs USD enabled, and a domiciliary account for USD payouts) or Flutterwave.
- GBP, EUR, CAD: Flutterwave. A Nigerian Paystack account cannot charge these.
- GHS: Flutterwave; Paystack only if the business is registered in Ghana.
Add more currencies later by inserting a row into `currencies`.
Tested in an in-memory Postgres: amounts compute correctly, an order settles once, underpayment and the wrong currency are rejected, and a disabled currency is blocked.

## Things you must confirm
- **Flutterwave version:** their docs currently describe two generations (older `verif-hash` header; newer `flutterwave-signature`). Signature checking supports both, but initiate/verify here are written for **v3**. If your account is on v4, have Claude Code implement those two methods from the current docs.
- **Installment provider:** `installment.ts` is intentionally a template. I have not seen CredPal's or Easybuy's merchant API, so I did not invent one. Ask the provider for merchant API docs, webhook signing details and what "success" means (approved vs. down payment received). If they only offer payment links, mark those orders paid manually from the admin dashboard instead.
- Rates are manual. Update them regularly, or add a scheduled rate refresh. Orders keep the rate they were created with.
- Fully gift-card-covered orders (nothing left to pay) skip the provider; settle them inside your create-order function.

## Claude Code prompts

### A. Server-side order creation
```
Read CLAUDE.md and supabase/functions/_shared. Plan, then build a `create-order` Edge Function. Input: cart items (variant_id, quantity), email, shipping address, shipping rate id, optional promo code and gift card code, display currency. It must recompute EVERYTHING from the database (variant prices, shipping rate, promo validity and limits, gift card balance, exchange rate from site_settings) and ignore any prices from the browser. Create the order and order_items (name, colour, size, sku, image and unit price snapshots) with status "pending", gift_card_ngn and discount_ngn calculated, and return order_id and access_token. If the amount due after gift card is zero, settle the order immediately via a SQL path instead of a provider. Reject out-of-stock variants and unpublished products. Add tests for pricing, promo rules and the zero-due case.
```

### B. Checkout and confirmation pages
```
Plan, then wire the checkout UI: call create-order, then payment-initiate with the chosen provider (full payment via Paystack/Flutterwave, or "pay in installments" only when the cart is eligible per site_settings.bnpl_limits), and redirect to redirect_url. Build /order/confirmation that reads provider and reference from the query string, calls payment-verify, polls every 3 seconds for up to 60 seconds while status is "pending", and shows paid / pending / failed states with a retry-payment button (calls payment-initiate again for the same order) and a clear message if it takes longer. Never mark anything as paid in the browser.
```

### C. Emails and admin alerts
```
Plan, then add: (1) a Resend-based order confirmation + receipt email sent from the payment-webhook / payment-verify path when settlePayment returns "paid" (make sending idempotent with an emails_sent column or table so replays do not email twice); (2) an admin alert email when needs_attention is true; (3) a "Needs attention" filter and badge in the admin Orders list showing attention_reason; (4) schedule cancel_stale_pending_orders (pg_cron or a scheduled function).
```

### D. Installment provider adapter
```
I will paste the installment provider's merchant API documentation below. Plan, then implement supabase/functions/_shared/providers/installment.ts against it (initiate, verifyWebhookSignature, parseWebhook, isPaymentEvent, verify), following the pattern in paystack.ts. Use only what the docs say; if anything about authentication, signing, statuses or refunds is unclear, stop and ask me. Map provider statuses to success | failed | pending | abandoned conservatively: only "success" when EBONIMODE is guaranteed settlement. Add a local test that signs a sample payload and verifies it.
```

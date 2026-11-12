import type { PaymentProvider } from "./types.ts";

/**
 * TEMPLATE for the Nigerian installment / BNPL provider (CredPal, Easybuy, or other).
 * Do NOT guess the provider's API. Obtain their merchant API docs and implement each method:
 *  - initiate():  create the installment application/checkout and return the hosted redirect URL
 *  - verifyWebhookSignature(): per their docs (header name + algorithm)
 *  - parseWebhook(): extract a unique event id and OUR reference
 *  - verify(): call their status endpoint and map to success | failed | pending | abandoned
 * Decide with the provider what "success" means (e.g. down payment received vs. approved) and only
 * report "success" when the merchant is guaranteed settlement for the order.
 * If the provider offers only payment links with no API, set status manually from the admin dashboard
 * instead and skip this adapter.
 */
const notConfigured = (): never => {
  throw new Error("Installment provider is not configured. Implement functions/_shared/providers/installment.ts");
};

export const installment: PaymentProvider = {
  name: "installment",
  initiate: () => notConfigured(),
  verifyWebhookSignature: () => notConfigured(),
  parseWebhook: () => notConfigured(),
  isPaymentEvent: () => false,
  verify: () => notConfigured(),
};

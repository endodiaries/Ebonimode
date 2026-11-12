export type PaymentType = "full" | "installment";

export interface InitiateInput {
  reference: string;
  email: string;
  amountMinor: number;      // smallest unit (kobo, cents, pence...)
  decimals: number;         // currency decimals (2 for most, 0 for UGX/XOF/XAF/RWF)
  currency: string;         // ISO code, must be enabled for this provider
  callbackUrl: string;      // where the shopper returns after paying
  metadata?: Record<string, unknown>;
}

export interface InitiateResult {
  redirectUrl: string;
  providerReference: string;
}

export interface VerifiedPayment {
  reference: string;
  status: "success" | "failed" | "pending" | "abandoned";
  amountMinor: number;
  currency: string;
  raw: unknown;
}

export interface ParsedWebhook {
  eventId: string;          // unique per provider event, for idempotency
  eventType: string;
  reference: string | null; // our payment_reference
}

export interface PaymentProvider {
  name: string;
  initiate(input: InitiateInput): Promise<InitiateResult>;
  verifyWebhookSignature(rawBody: string, headers: Headers): Promise<boolean>;
  parseWebhook(rawBody: string): ParsedWebhook;
  isPaymentEvent(eventType: string): boolean;
  /** Always confirm with the provider's API. Never trust webhook payload amounts. */
  verify(reference: string, decimals?: number): Promise<VerifiedPayment>;
}

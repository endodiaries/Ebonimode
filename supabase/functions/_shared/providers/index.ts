import type { PaymentProvider } from "./types.ts";
import { paystack } from "./paystack.ts";
import { flutterwave } from "./flutterwave.ts";
import { installment } from "./installment.ts";

const registry: Record<string, PaymentProvider> = { paystack, flutterwave, installment };

export const getProvider = (name: string | null): PaymentProvider | null => (name ? registry[name] ?? null : null);
export type { PaymentProvider, PaymentType } from "./types.ts";

"use server";

import { createClient } from "@/lib/supabase/server";

export type NotifyState = { ok?: boolean; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Notify me when it's back": saves the shopper's email against a sold-out size. Anyone may
 * sign up (RLS allows inserts only); only the admin can read the list.
 */
export async function requestRestockAlert(_prev: NotifyState, form: FormData): Promise<NotifyState> {
  if (String(form.get("company") ?? "")) return { ok: true }; // honeypot: quietly ignore bots
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const productId = String(form.get("productId") ?? "");
  const size = String(form.get("size") ?? "").slice(0, 12);
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (!/^[0-9a-f-]{36}$/i.test(productId) || !size) return { error: "Please choose a size." };

  const supabase = await createClient();
  const { data: variant } = await supabase.from("product_variants").select("id").eq("product_id", productId).eq("size", size).maybeSingle();
  if (!variant) return { error: "Please choose a size." };

  const { error } = await supabase.from("stock_notifications").insert({ variant_id: variant.id, email });
  // Already signed up for this size: that is fine.
  if (error && error.code !== "23505") return { error: "We could not save that just now. Please try again." };
  return { ok: true };
}

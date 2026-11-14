"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

export type NewsletterState = { ok?: boolean; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Adds an email to the newsletter list. RLS lets anyone insert; only admins can read the list. */
export async function subscribeToNewsletter(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  // Honeypot: real visitors never see or fill this field.
  if (formData.get("company")) return { ok: true };

  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim().toLowerCase().slice(0, 254) : "";
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };

  const { error } = await createPublicClient().from("newsletter_subscribers").insert({ email, source: "homepage" });
  // 23505 = already subscribed. Treated as success so we never reveal who is on the list.
  if (error && error.code !== "23505") return { error: "We could not sign you up just now. Please try again." };
  return { ok: true };
}

export type ReviewState = { ok?: boolean; error?: string; signIn?: boolean };

/**
 * Saves a review as "pending". Only signed-in customers can write one (RLS enforces it),
 * and it appears on the site only after an admin approves it.
 */
export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  if (formData.get("company")) return { ok: true }; // honeypot
  const text = (key: string, max: number) => {
    const v = formData.get(key);
    return typeof v === "string" ? v.trim().slice(0, max) : "";
  };
  const productId = text("productId", 36);
  const rating = Number(text("rating", 1));
  const title = text("title", 120);
  const body = text("body", 2000);
  if (!/^[0-9a-f-]{36}$/.test(productId)) return { error: "Something went wrong. Please reload the page." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Choose a star rating." };
  if (body.length < 10) return { error: "Tell us a little more: at least 10 characters." };

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { signIn: true, error: "Sign in to leave a review." };

  const existing = await db.from("reviews").select("id").eq("product_id", productId).eq("user_id", user.id).limit(1);
  if ((existing.data ?? []).length > 0) return { error: "You have already reviewed this piece." };

  const { error } = await db.from("reviews").insert({ product_id: productId, user_id: user.id, rating, title: title || null, body, status: "pending" });
  if (error) return { error: "We could not save your review just now. Please try again." };
  return { ok: true };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Merges this device's wishlist into the signed-in account and returns the combined list.
 * Returns null for guests, whose list simply stays on the device.
 */
export async function mergeWishlist(localIds: string[]): Promise<string[] | null> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const ids = [...new Set(localIds.filter((id) => UUID_RE.test(id)))].slice(0, 200);
  if (ids.length > 0) {
    await db.from("wishlists").upsert(ids.map((product_id) => ({ user_id: user.id, product_id })), { onConflict: "user_id,product_id", ignoreDuplicates: true });
  }
  const { data } = await db.from("wishlists").select("product_id").eq("user_id", user.id);
  return (data ?? []).map((r) => r.product_id as string);
}

/** Saves one heart tap to the account. Does nothing for guests. */
export async function saveWishlistChange(productId: string, saved: boolean): Promise<void> {
  if (!UUID_RE.test(productId)) return;
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return;
  if (saved) await db.from("wishlists").upsert({ user_id: user.id, product_id: productId }, { onConflict: "user_id,product_id", ignoreDuplicates: true });
  else await db.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
}

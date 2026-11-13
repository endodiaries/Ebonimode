"use server";

import { createPublicClient } from "@/lib/supabase/public";

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

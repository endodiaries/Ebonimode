"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth";
import { siteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
  /** Echoed back so the form keeps what was typed (never the password). */
  email?: string;
  fullName?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

function text(formData: FormData, key: string, max = 200): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Where Supabase should send people back to. Supabase also checks it against its allow-list. */
async function origin(): Promise<string> {
  const h = await headers();
  return h.get("origin") ?? siteUrl;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address.", email };
  if (!password) return { error: "Enter your password.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Please confirm your email first. Check your inbox for our link.", email };
    }
    return { error: "That email or password is not right. Please try again.", email };
  }
  redirect(next);
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = text(formData, "fullName", 120);
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!fullName) return { error: "Enter your name.", email, fullName };
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address.", email, fullName };
  if (password.length < MIN_PASSWORD) {
    return { error: `Choose a password with at least ${MIN_PASSWORD} characters.`, email, fullName };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    if (error.code === "weak_password") {
      return { error: "That password is too easy to guess. Please choose a stronger one.", email, fullName };
    }
    return { error: "We could not create your account just now. Please try again.", email, fullName };
  }
  if (data.session) redirect(next);
  // Same message whether or not the email already has an account, so we never reveal who is registered.
  return { message: "Almost there. Check your email and tap the link to confirm your account." };
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNextPath(formData.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/account/sign-in?error=google");
  redirect(data.url);
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address.", email };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent("/account/update-password")}`,
  });
  return { message: "If that email has an account, a reset link is on its way." };
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD) {
    return { error: `Choose a password with at least ${MIN_PASSWORD} characters.` };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Your reset link has expired. Please request a new one." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      error:
        error.code === "same_password"
          ? "Please choose a password you have not used here before."
          : "We could not update your password. Please try again.",
    };
  }
  redirect("/account");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

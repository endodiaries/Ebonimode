import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** The narrow user shape the app passes around. Never the raw session. */
export type CurrentUser = {
  id: string;
  email: string;
  fullName: string | null;
};

/**
 * The signed-in user, verified with Supabase Auth on the server (not just read from a cookie).
 * Deduplicated per request. Returns null for guests.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const meta = data.user.user_metadata as { full_name?: string; name?: string } | null;
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    fullName: meta?.full_name ?? meta?.name ?? null,
  };
});

/** True only when the database says this user has the admin role. */
export const isAdmin = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
});

/** For account pages: guests are sent to sign in, then returned to `next`. */
export async function requireUser(next = "/account"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/sign-in?next=${encodeURIComponent(next)}`);
  return user;
}

/** For admin pages: anyone who is not an admin sees a 404, so the area is not advertised. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !(await isAdmin())) notFound();
  return user;
}

/** Only allow same-site paths as post-login destinations (blocks open redirects). */
export function safeNextPath(next: unknown, fallback = "/account"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}

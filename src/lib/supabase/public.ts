import "server-only";
import { createClient } from "@supabase/supabase-js";
import { assertSupabaseEnv, supabaseKey, supabaseUrl } from "./env";

/**
 * Cookie-less Supabase client for public catalogue reads. It always acts as an anonymous
 * visitor under RLS, so its results are safe to cache and share between visitors.
 */
export function createPublicClient() {
  assertSupabaseEnv();
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseEnv, supabaseKey, supabaseUrl } from "./env";

/** Supabase client for Client Components. Acts as the signed-in visitor (or anon) under RLS. */
export function createClient() {
  assertSupabaseEnv();
  return createBrowserClient(supabaseUrl, supabaseKey);
}

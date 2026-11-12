-- EBONIMODE: security hardening from the Supabase advisor (run after 0001-0006)

-- Pin the search_path on the one function that was missing it.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- Trigger and internal helper functions must not be callable through the REST API.
-- Triggers keep firing: EXECUTE is checked when a trigger is created, not when it runs.
-- refresh_product_rating is only called from reviews_after_change (SECURITY DEFINER, runs as owner).
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.log_stock_movement() from public, anon, authenticated;
revoke all on function public.reviews_after_change() from public, anon, authenticated;
revoke all on function public.refresh_product_rating(uuid) from public, anon, authenticated;

-- Left callable on purpose:
--   is_admin()                      used inside RLS policies, returns only a boolean about the caller
--   admin_adjust_stock / admin_set_stock / receive_purchase_order_item
--                                   signed-in users only, and each one checks is_admin() itself

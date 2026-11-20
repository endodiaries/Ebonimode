-- EBONIMODE: run this ONCE in the Supabase dashboard (SQL Editor → New query → paste → Run).
-- It is the payment-settling function from migration 0005_currencies.sql. Everything else from
-- 0002 and 0005 is already applied; this one step must be applied by a person.
-- What it does: when Paystack confirms a payment, it checks the amount against the order,
-- marks the order paid, takes the pieces out of stock, and flags anything odd for review.

-- finalize_order_payment now compares against the stored amount_due_minor (works for any currency)
create or replace function public.finalize_order_payment(
  p_reference  text,
  p_provider   text,
  p_paid_minor bigint,   -- amount the provider says was paid, in minor units (kobo/cents)
  p_currency   text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  o public.orders%rowtype;
  it record;
  gc public.gift_cards%rowtype;
  expected_minor bigint;
  reasons text[] := '{}';
  v_stock int;
begin
  select * into o from public.orders where payment_reference = p_reference for update;
  if not found then
    return jsonb_build_object('result', 'order_not_found');
  end if;

  if o.status <> 'pending' then
    return jsonb_build_object('result', 'already_processed', 'order_id', o.id, 'status', o.status);
  end if;

  -- Amount due = order total minus any gift card portion, in the currency charged
  expected_minor := coalesce(o.amount_due_minor, public.set_order_amount_due(o.id));

  if upper(p_currency) <> upper(o.currency) or p_paid_minor < expected_minor then
    update public.orders set
      needs_attention = true,
      attention_reason = format('payment mismatch: paid %s %s, expected %s %s', p_paid_minor, p_currency, expected_minor, o.currency),
      last_payment_status = 'mismatch'
    where id = o.id;
    return jsonb_build_object('result', 'amount_mismatch', 'order_id', o.id);
  end if;

  if p_paid_minor > expected_minor then
    reasons := reasons || format('overpaid by %s minor units', p_paid_minor - expected_minor);
  end if;

  -- Decrement stock (oversell is flagged, never silently ignored). The 0003 trigger logs these as 'sale' movements.
  perform set_config('app.stock_reason', 'sale', true);
  perform set_config('app.stock_order_id', o.id::text, true);
  for it in select * from public.order_items where order_id = o.id and variant_id is not null loop
    select stock into v_stock from public.product_variants where id = it.variant_id for update;
    if v_stock is null then
      reasons := reasons || format('variant missing for %s', it.product_name);
    elsif v_stock < it.quantity then
      reasons := reasons || format('insufficient stock for %s (%s/%s)', it.product_name, v_stock, it.quantity);
      update public.product_variants set stock = 0 where id = it.variant_id;
    else
      update public.product_variants set stock = stock - it.quantity where id = it.variant_id;
    end if;
  end loop;

  -- Redeem gift card
  if o.gift_card_id is not null and o.gift_card_ngn > 0 then
    select * into gc from public.gift_cards where id = o.gift_card_id for update;
    if found and gc.is_active and gc.balance_ngn >= o.gift_card_ngn then
      update public.gift_cards set balance_ngn = balance_ngn - o.gift_card_ngn where id = gc.id;
      insert into public.gift_card_transactions (gift_card_id, order_id, amount_ngn, note)
      values (gc.id, o.id, -o.gift_card_ngn, 'Redeemed at checkout');
    else
      reasons := reasons || 'gift card balance insufficient at settlement';
    end if;
  end if;

  -- Count promo usage
  if o.promo_code_id is not null then
    update public.promo_codes set times_used = times_used + 1 where id = o.promo_code_id;
  end if;

  update public.orders set
    status = 'paid',
    paid_at = now(),
    payment_provider = p_provider,
    last_payment_status = 'success',
    needs_attention = coalesce(array_length(reasons, 1), 0) > 0,
    attention_reason = nullif(array_to_string(reasons, '; '), '')
  where id = o.id;

  return jsonb_build_object(
    'result', 'paid',
    'order_id', o.id,
    'order_number', o.order_number,
    'needs_attention', coalesce(array_length(reasons, 1), 0) > 0
  );
end $$;

revoke all on function public.finalize_order_payment(text, text, bigint, text) from public, anon, authenticated;
grant execute on function public.finalize_order_payment(text, text, bigint, text) to service_role;

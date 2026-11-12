-- EBONIMODE: multi-currency (run after 0001 to 0004)
-- Two ideas:
--   DISPLAY currency: what a visitor sees prices in (any enabled currency, converted from NGN).
--   CHARGE currency:  what we can really collect, per payment provider. Admin turns this on per currency
--                     only after confirming it is enabled on that provider account.
-- Prices stay stored in NGN. Each order snapshots the rate used, and the exact amount to collect is computed
-- ONCE in the database (amount_due_minor) so initiate, webhook and verify can never disagree.

create table public.currencies (
  code text primary key check (code ~ '^[A-Z]{3}$'),
  name text not null,
  symbol text not null,
  decimals int not null default 2 check (decimals between 0 and 3),   -- 0 for UGX, XOF, XAF, RWF
  rate_per_ngn numeric(24,10) not null check (rate_per_ngn > 0),       -- 1 NGN = this many units
  rounding_step numeric(12,4) not null default 0.01 check (rounding_step > 0),  -- e.g. 1 = whole units, 0.05
  display_enabled boolean not null default false,
  charge_enabled boolean not null default false,
  charge_providers text[] not null default '{}',                       -- providers that may charge this currency
  countries text[] not null default '{}',                              -- ISO country codes that default to it
  sort_order int not null default 0,
  rate_updated_at timestamptz not null default now()
);

-- Seed: the six launch currencies. Rates are PLACEHOLDERS (1) and everything but NGN is OFF: the admin must
-- enter a real rate and confirm provider support before turning a currency on.
-- charge_providers is ORDERED: the first provider listed is the default at checkout.
--   NGN: Paystack first (cards, bank transfer, USSD); Flutterwave as backup; installments NGN only.
--   USD: Paystack or Flutterwave (a Nigerian Paystack account needs USD enabled).
--   GBP, EUR, CAD: Flutterwave only (a Nigerian Paystack account cannot charge these).
--   GHS: Flutterwave (Paystack only if the business is registered in Ghana).
-- Availability depends on your own provider accounts, so confirm each in its dashboard.
-- To add more currencies later (KES, ZAR, UGX, ...), insert a row; nothing else needs to change.
insert into public.currencies (code, name, symbol, decimals, rate_per_ngn, rounding_step, display_enabled, charge_enabled, charge_providers, countries, sort_order) values
 ('NGN','Nigerian Naira','₦',2,1,1,true,true,'{paystack,flutterwave,installment}','{NG}',1),
 ('USD','US Dollar','$',2,1,0.01,false,false,'{paystack,flutterwave}','{US}',2),
 ('GBP','British Pound','£',2,1,0.01,false,false,'{flutterwave}','{GB}',3),
 ('EUR','Euro','€',2,1,0.01,false,false,'{flutterwave}','{DE,FR,IT,ES,NL,IE,PT,BE,AT,FI,GR,LU}',4),
 ('CAD','Canadian Dollar','CA$',2,1,0.01,false,false,'{flutterwave}','{CA}',5),
 ('GHS','Ghanaian Cedi','GH₵',2,1,0.01,false,false,'{flutterwave,paystack}','{GH}',6);

alter table public.currencies enable row level security;
create policy "public read enabled currencies" on public.currencies for select using (display_enabled or public.is_admin());
create policy "admin write currencies" on public.currencies for all using (public.is_admin()) with check (public.is_admin());

alter table public.orders add column if not exists amount_due_minor bigint;

-- Lock the order to a currency and rate at checkout (only enabled currencies, only while pending)
create or replace function public.snapshot_order_currency(p_order uuid, p_currency text)
returns void language plpgsql security definer set search_path = public as $$
declare c public.currencies%rowtype;
begin
  select * into c from public.currencies where code = upper(p_currency) and display_enabled;
  if not found then raise exception 'currency not available'; end if;
  update public.orders set currency = c.code, exchange_rate = c.rate_per_ngn, amount_due_minor = null
  where id = p_order and status = 'pending';
end $$;

-- The one place the amount to collect is calculated. Rounds to the currency's step, then to minor units.
create or replace function public.set_order_amount_due(p_order uuid)
returns bigint language plpgsql security definer set search_path = public as $$
declare o public.orders%rowtype; c public.currencies%rowtype; v_due numeric; v_conv numeric; v_minor bigint;
begin
  select * into o from public.orders where id = p_order for update;
  if not found then raise exception 'order not found'; end if;
  select * into c from public.currencies where code = o.currency;
  if not found then raise exception 'unknown currency %', o.currency; end if;
  v_due := o.total_ngn - o.gift_card_ngn;
  v_conv := round((v_due * o.exchange_rate) / c.rounding_step) * c.rounding_step;
  v_minor := round(v_conv * power(10, c.decimals))::bigint;
  update public.orders set amount_due_minor = v_minor where id = p_order;
  return v_minor;
end $$;

revoke all on function public.snapshot_order_currency(uuid, text), public.set_order_amount_due(uuid) from public, anon, authenticated;
grant execute on function public.snapshot_order_currency(uuid, text), public.set_order_amount_due(uuid) to service_role;

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

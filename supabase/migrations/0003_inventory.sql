-- EBONIMODE: inventory system (run after 0001 and 0002)
-- Storefront stock stays on product_variants.stock. Everything below is ADMIN-ONLY.

-- ============ TABLES ============
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  lead_time_days int,
  notes text,
  created_at timestamptz not null default now()
);

-- Private per-variant inventory data (kept out of product_variants because that table is publicly readable)
create table public.variant_inventory (
  variant_id uuid primary key references public.product_variants(id) on delete cascade,
  cost_price_ngn numeric(12,2) check (cost_price_ngn >= 0),
  reorder_level int not null default 3 check (reorder_level >= 0),
  reorder_qty int not null default 10 check (reorder_qty >= 0),
  barcode text unique,
  bin_location text,
  supplier_id uuid references public.suppliers(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  change int not null,                 -- +/- units
  stock_after int not null,
  reason text not null check (reason in ('sale','restock','return','damage','adjustment','stocktake','initial')),
  note text,
  order_id uuid references public.orders(id) on delete set null,
  purchase_order_id uuid,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index stock_movements_variant_idx on public.stock_movements(variant_id, created_at desc);
create index stock_movements_order_idx on public.stock_movements(order_id);

create sequence public.po_number_seq start 1;
create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number bigint not null unique default nextval('public.po_number_seq'),
  supplier_id uuid references public.suppliers(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft','ordered','partially_received','received','cancelled')),
  expected_at date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  qty_ordered int not null check (qty_ordered > 0),
  qty_received int not null default 0 check (qty_received >= 0),
  unit_cost_ngn numeric(12,2) check (unit_cost_ngn >= 0)
);
create index po_items_po_idx on public.purchase_order_items(purchase_order_id);

alter table public.stock_movements
  add constraint stock_movements_po_fk foreign key (purchase_order_id) references public.purchase_orders(id) on delete set null;

-- "Notify me when back in stock" (public can sign up; only admin can read)
create table public.stock_notifications (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  email text not null,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (variant_id, email)
);

-- ============ AUTOMATIC MOVEMENT LOG ============
-- Any change to product_variants.stock writes a ledger row. Callers set the reason with
--   perform set_config('app.stock_reason', 'sale', true);   (transaction-local)
-- If nothing is set, the reason is 'adjustment'.
create or replace function public.log_stock_movement()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_reason text := coalesce(nullif(current_setting('app.stock_reason', true), ''), 'adjustment');
  v_note text := nullif(current_setting('app.stock_note', true), '');
  v_order uuid := nullif(current_setting('app.stock_order_id', true), '')::uuid;
  v_po uuid := nullif(current_setting('app.stock_po_id', true), '')::uuid;
begin
  if tg_op = 'INSERT' then
    if new.stock <> 0 then
      insert into public.stock_movements (variant_id, change, stock_after, reason, note, user_id)
      values (new.id, new.stock, new.stock, 'initial', v_note, auth.uid());
    end if;
  elsif new.stock is distinct from old.stock then
    insert into public.stock_movements (variant_id, change, stock_after, reason, note, order_id, purchase_order_id, user_id)
    values (new.id, new.stock - old.stock, new.stock, v_reason, v_note, v_order, v_po, auth.uid());
  end if;
  return new;
end $$;

create trigger variant_stock_log
after insert or update of stock on public.product_variants
for each row execute function public.log_stock_movement();

-- ============ ADMIN FUNCTIONS (checked by is_admin(); stock can never go negative) ============
create or replace function public.admin_adjust_stock(p_variant uuid, p_delta int, p_reason text, p_note text default null)
returns int language plpgsql security definer set search_path = public as $$
declare v_new int;
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  if p_reason not in ('restock','return','damage','adjustment','stocktake') then raise exception 'invalid reason %', p_reason; end if;
  perform set_config('app.stock_reason', p_reason, true);
  perform set_config('app.stock_note', coalesce(p_note, ''), true);
  update public.product_variants set stock = stock + p_delta
  where id = p_variant and stock + p_delta >= 0
  returning stock into v_new;
  if v_new is null then raise exception 'variant not found or stock would go negative'; end if;
  return v_new;
end $$;

create or replace function public.admin_set_stock(p_variant uuid, p_new int, p_reason text default 'stocktake', p_note text default null)
returns int language plpgsql security definer set search_path = public as $$
declare v_old int;
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  if p_new < 0 then raise exception 'stock cannot be negative'; end if;
  select stock into v_old from public.product_variants where id = p_variant for update;
  if not found then raise exception 'variant not found'; end if;
  return public.admin_adjust_stock(p_variant, p_new - v_old, p_reason, p_note);
end $$;

-- Receive units against a purchase order line: adds stock, logs it, updates PO status
create or replace function public.receive_purchase_order_item(p_item uuid, p_qty int)
returns text language plpgsql security definer set search_path = public as $$
declare it public.purchase_order_items%rowtype; v_status text;
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  if p_qty <= 0 then raise exception 'quantity must be positive'; end if;
  select * into it from public.purchase_order_items where id = p_item for update;
  if not found then raise exception 'line not found'; end if;
  if it.qty_received + p_qty > it.qty_ordered then raise exception 'cannot receive more than ordered'; end if;

  perform set_config('app.stock_po_id', it.purchase_order_id::text, true);
  perform public.admin_adjust_stock(it.variant_id, p_qty, 'restock', 'PO receiving');
  update public.purchase_order_items set qty_received = qty_received + p_qty where id = p_item;

  select case
    when bool_and(qty_received >= qty_ordered) then 'received'
    else 'partially_received' end
  into v_status from public.purchase_order_items where purchase_order_id = it.purchase_order_id;

  update public.purchase_orders set status = v_status where id = it.purchase_order_id;
  return v_status;
end $$;

revoke all on function public.admin_adjust_stock(uuid, int, text, text), public.admin_set_stock(uuid, int, text, text),
  public.receive_purchase_order_item(uuid, int) from public, anon;
grant execute on function public.admin_adjust_stock(uuid, int, text, text), public.admin_set_stock(uuid, int, text, text),
  public.receive_purchase_order_item(uuid, int) to authenticated;   -- is_admin() is enforced inside

-- ============ LOW-STOCK VIEW (admin only through RLS on underlying tables) ============
create or replace view public.low_stock_variants with (security_invoker = true) as
select v.id as variant_id, p.id as product_id, p.name as product_name, p.department,
       v.colour, v.size, v.sku, v.stock,
       coalesce(i.reorder_level, 3) as reorder_level, coalesce(i.reorder_qty, 10) as reorder_qty, i.supplier_id,
       case when v.stock = 0 then 'out' else 'low' end as status
from public.product_variants v
join public.products p on p.id = v.product_id
left join public.variant_inventory i on i.variant_id = v.id
where p.status = 'published' and v.stock <= coalesce(i.reorder_level, 3);

-- ============ RLS ============
alter table public.suppliers enable row level security;
alter table public.variant_inventory enable row level security;
alter table public.stock_movements enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.stock_notifications enable row level security;

do $$
declare t text;
begin
  foreach t in array array['suppliers','variant_inventory','stock_movements','purchase_orders','purchase_order_items'] loop
    execute format('create policy "admin all %1$s" on public.%1$I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

create policy "anyone can request restock alert" on public.stock_notifications for insert with check (true);
create policy "admin reads restock alerts" on public.stock_notifications for select using (public.is_admin());
create policy "admin manages restock alerts" on public.stock_notifications for update using (public.is_admin());

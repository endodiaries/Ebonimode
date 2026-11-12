-- EBONIMODE: initial schema + RLS
-- Save as supabase/migrations/0001_ebonimode_schema.sql and apply with `supabase db push`.
-- Prices are stored in NGN (base currency). Orders snapshot the currency and rate used.

-- ============ HELPERS ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ============ USERS & ROLES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  primary key (user_id, role)
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  country text not null default 'NG',
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============ CATALOGUE ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_public_id text,          -- Cloudinary
  parent_id uuid references public.categories(id) on delete set null,
  department text check (department in ('women','men','unisex')),  -- null = shared (e.g. Accessories)
  sort_order int not null default 0,
  show_in_menu boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  banner_public_id text,         -- Cloudinary image
  banner_video_public_id text,   -- Cloudinary video (muted looping banner)
  theme_hex text,                -- collection colour story, e.g. #1D3714
  is_published boolean not null default false,
  show_in_menu boolean not null default true,
  sort_order int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  fabric_care text,
  category_id uuid references public.categories(id) on delete set null,
  department text not null default 'women' check (department in ('women','men','unisex')),
  price_ngn numeric(12,2) not null check (price_ngn >= 0),
  compare_at_price_ngn numeric(12,2) check (compare_at_price_ngn >= 0),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  is_featured boolean not null default false,
  tryon_enabled boolean not null default true,
  colour_family text,            -- e.g. 'yellow', 'emerald': drives colour browsing
  colourway_group_id uuid,       -- same style in other colours shares this id
  sleeve_length text,            -- modest attributes for filtering
  hem_length text,
  video_public_id text,          -- optional product video (Cloudinary)
  artisan_id uuid,
  tags text[] not null default '{}',
  seo_title text,
  seo_description text,
  avg_rating numeric(3,2) not null default 0,
  review_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_status_idx on public.products(status);
create index products_department_idx on public.products(department);
create index products_colour_family_idx on public.products(colour_family);
create index products_colourway_group_idx on public.products(colourway_group_id);
create index products_price_idx on public.products(price_ngn);
create index products_created_idx on public.products(created_at desc);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_collections (
  product_id uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  sort_order int not null default 0,
  primary key (product_id, collection_id)
);
create index product_collections_collection_idx on public.product_collections(collection_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text unique,
  colour text,
  colour_hex text,
  size text,
  stock int not null default 0 check (stock >= 0),
  price_override_ngn numeric(12,2) check (price_override_ngn >= 0),
  created_at timestamptz not null default now(),
  unique (product_id, colour, size)
);
create index product_variants_product_idx on public.product_variants(product_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  cloudinary_public_id text not null,
  colour text,                   -- optional: link image to a colour variant
  alt text,
  sort_order int not null default 0
);
create index product_images_product_idx on public.product_images(product_id, sort_order);

-- ============ CUSTOMER FEATURES ============
create table public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  image_public_ids text[] not null default '{}',   -- Cloudinary
  is_verified_purchase boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_reply text,
  created_at timestamptz not null default now()
);
create index reviews_product_status_idx on public.reviews(product_id, status);

-- ============ CART ============
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,                         -- captured at checkout for abandoned-cart emails
  abandoned_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger carts_updated_at before update on public.carts
  for each row execute function public.set_updated_at();

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity int not null check (quantity > 0),
  unique (cart_id, variant_id)
);

-- ============ SHIPPING, PROMOS, GIFT CARDS ============
create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- e.g. Lagos, Rest of Nigeria, International
  countries text[] not null default '{}',
  states text[] not null default '{}',
  free_shipping_threshold_ngn numeric(12,2),
  is_active boolean not null default true
);

create table public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.shipping_zones(id) on delete cascade,
  name text not null,                 -- e.g. Standard, Express
  price_ngn numeric(12,2) not null check (price_ngn >= 0),
  min_days int,
  max_days int,
  is_active boolean not null default true
);

create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  value numeric(12,2) not null check (value > 0),
  min_spend_ngn numeric(12,2),
  usage_limit int,
  times_used int not null default 0,
  applies_to_product_ids uuid[] not null default '{}',
  applies_to_collection_ids uuid[] not null default '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  initial_amount_ngn numeric(12,2) not null check (initial_amount_ngn > 0),
  balance_ngn numeric(12,2) not null check (balance_ngn >= 0),
  recipient_name text,
  recipient_email text,
  message text,
  purchaser_id uuid references auth.users(id) on delete set null,
  deliver_at timestamptz,
  delivered_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============ ORDERS & PAYMENTS ============
create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint not null unique default nextval('public.order_number_seq'),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status text not null default 'pending'
    check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  currency text not null default 'NGN',
  exchange_rate numeric(14,6) not null default 1,   -- NGN -> charged currency
  subtotal_ngn numeric(12,2) not null,
  discount_ngn numeric(12,2) not null default 0,
  gift_card_ngn numeric(12,2) not null default 0,
  shipping_ngn numeric(12,2) not null default 0,
  total_ngn numeric(12,2) not null,
  promo_code_id uuid references public.promo_codes(id) on delete set null,
  gift_card_id uuid references public.gift_cards(id) on delete set null,
  payment_provider text,              -- paystack | flutterwave | credpal | easybuy ...
  payment_type text check (payment_type in ('full','installment')),
  payment_reference text unique,
  paid_at timestamptz,
  shipping_address jsonb not null,
  shipping_rate_name text,
  tracking_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,          -- snapshots, so history survives edits/deletes
  colour text,
  size text,
  sku text,
  image_public_id text,
  unit_price_ngn numeric(12,2) not null,
  quantity int not null check (quantity > 0)
);
create index order_items_order_idx on public.order_items(order_id);

create table public.gift_card_transactions (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references public.gift_cards(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  amount_ngn numeric(12,2) not null,   -- negative = redemption, positive = load/refund
  note text,
  created_at timestamptz not null default now()
);

-- Idempotency for payment/BNPL webhooks
create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

-- ============ CONTENT ============
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null,
  cover_public_id text,
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,               -- e.g. announcement_bar, exchange_rate_usd, social_links, bnpl_limits
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.artisans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  craft text,
  location text,
  story text,
  photo_public_id text,
  is_published boolean not null default true,
  sort_order int not null default 0
);

alter table public.products
  add constraint products_artisan_fk foreign key (artisan_id) references public.artisans(id) on delete set null;

create table public.size_guides (
  id uuid primary key default gen_random_uuid(),
  department text not null check (department in ('women','men','unisex')),
  name text not null,                 -- e.g. Women's tops, Men's trousers
  unit text not null default 'cm',
  table_data jsonb not null,          -- rows of size -> measurements
  notes text,
  sort_order int not null default 0
);

create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  type text not null,                 -- hero | categories | new_arrivals | collection_row | featured | story | reviews | blog | social | newsletter
  config jsonb not null default '{}',
  sort_order int not null default 0,
  is_visible boolean not null default true
);

-- ============ ROW LEVEL SECURITY ============
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_collections enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.wishlists enable row level security;
alter table public.reviews enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.promo_codes enable row level security;
alter table public.gift_cards enable row level security;
alter table public.gift_card_transactions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.webhook_events enable row level security;
alter table public.blog_posts enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.site_settings enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.size_guides enable row level security;
alter table public.artisans enable row level security;

-- Profiles / addresses / wishlists: own rows only (+ admin read of profiles)
create policy "own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "update own profile" on public.profiles for update using (id = auth.uid());
create policy "own addresses" on public.addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wishlist" on public.wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin reads roles" on public.user_roles for select using (public.is_admin());

-- Public catalogue reads
create policy "public read categories" on public.categories for select using (true);
create policy "public read collections" on public.collections for select using (is_published or public.is_admin());
create policy "public read products" on public.products for select using (status = 'published' or public.is_admin());
create policy "public read product_collections" on public.product_collections for select using (true);
create policy "public read variants" on public.product_variants for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.status = 'published' or public.is_admin())));
create policy "public read images" on public.product_images for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.status = 'published' or public.is_admin())));
create policy "public read shipping zones" on public.shipping_zones for select using (is_active or public.is_admin());
create policy "public read shipping rates" on public.shipping_rates for select using (is_active or public.is_admin());
create policy "public read published posts" on public.blog_posts for select using (status = 'published' or public.is_admin());
create policy "public read settings" on public.site_settings for select using (true);
create policy "public read artisans" on public.artisans for select using (is_published or public.is_admin());
create policy "public read size guides" on public.size_guides for select using (true);
create policy "public read homepage" on public.homepage_sections for select using (is_visible or public.is_admin());

-- Reviews: approved are public; users create their own (pending); admin moderates
create policy "read approved reviews" on public.reviews for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy "create own review" on public.reviews for insert with check (user_id = auth.uid() and status = 'pending');

-- Carts: owner only (guest carts are handled through server routes with the service role)
create policy "own cart" on public.carts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own cart items" on public.cart_items for all using (
  exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

-- Orders: customers read their own. All writes go through Edge Functions (service role).
create policy "own orders" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "own order items" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

-- Newsletter: anyone may subscribe; only admin reads
create policy "subscribe" on public.newsletter_subscribers for insert with check (true);
create policy "admin reads subscribers" on public.newsletter_subscribers for select using (public.is_admin());

-- Promo codes, gift cards, transactions, webhooks: admin only (checkout validates via service role)
create policy "admin promo" on public.promo_codes for select using (public.is_admin());
create policy "admin gift cards" on public.gift_cards for select using (public.is_admin());
create policy "admin gift tx" on public.gift_card_transactions for select using (public.is_admin());
create policy "admin webhooks" on public.webhook_events for select using (public.is_admin());

-- Admin full write access on managed content tables
do $$
declare t text;
begin
  foreach t in array array[
    'categories','collections','products','product_collections','product_variants','product_images',
    'reviews','shipping_zones','shipping_rates','promo_codes','gift_cards','gift_card_transactions',
    'orders','order_items','blog_posts','newsletter_subscribers','site_settings','homepage_sections','size_guides','artisans','user_roles'
  ] loop
    execute format('create policy "admin write %1$s" on public.%1$I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ============ KEEP REVIEW AGGREGATES IN SYNC ============
create or replace function public.refresh_product_rating(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.products p set
    avg_rating = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where product_id = p_id and status = 'approved'), 0),
    review_count = (select count(*) from public.reviews where product_id = p_id and status = 'approved')
  where p.id = p_id;
$$;

create or replace function public.reviews_after_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.refresh_product_rating(coalesce(new.product_id, old.product_id));
  return null;
end $$;

create trigger reviews_rating_sync
after insert or update or delete on public.reviews
for each row execute function public.reviews_after_change();

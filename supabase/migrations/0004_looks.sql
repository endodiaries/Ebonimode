-- EBONIMODE: "Shop the Look" lookbooks (run after 0001-0003)
create table public.looks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  image_public_id text not null,        -- Cloudinary campaign photo
  collection_id uuid references public.collections(id) on delete set null,
  department text check (department in ('women','men','unisex')),
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.look_hotspots (
  id uuid primary key default gen_random_uuid(),
  look_id uuid not null references public.looks(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  x_pct numeric(5,2) not null check (x_pct between 0 and 100),   -- position on the image, percent
  y_pct numeric(5,2) not null check (y_pct between 0 and 100),
  sort_order int not null default 0
);
create index look_hotspots_look_idx on public.look_hotspots(look_id);

alter table public.looks enable row level security;
alter table public.look_hotspots enable row level security;

create policy "public read published looks" on public.looks for select using (is_published or public.is_admin());
create policy "public read hotspots of published looks" on public.look_hotspots for select using (
  exists (select 1 from public.looks l where l.id = look_id and (l.is_published or public.is_admin())));
create policy "admin write looks" on public.looks for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write hotspots" on public.look_hotspots for all using (public.is_admin()) with check (public.is_admin());

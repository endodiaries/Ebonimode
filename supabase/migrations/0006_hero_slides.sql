-- EBONIMODE: admin-editable homepage hero slides (run after 0001-0004)
create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 0,
  bg_hex text not null default '#F2C21B',            -- colour field behind the name
  print_key text not null default 'a' check (print_key in ('a','b','c')),  -- which batik fill the giant name uses
  model_public_id text not null,                      -- Cloudinary transparent-background model image
  model_alt text,
  collection_id uuid references public.collections(id) on delete set null,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.hero_slides enable row level security;
create policy "public read active hero slides" on public.hero_slides for select using (
  (is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now())) or public.is_admin());
create policy "admin write hero slides" on public.hero_slides for all using (public.is_admin()) with check (public.is_admin());

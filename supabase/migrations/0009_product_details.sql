-- EBONIMODE: structured product copy for the product page tabs (run after 0008)
alter table public.products
  add column if not exists details text[] not null default '{}',     -- bullet points for the Details tab
  add column if not exists occasions text[] not null default '{}',   -- "Where to wear"
  add column if not exists fabric text,                              -- e.g. 100% Cotton Crepe
  add column if not exists fabric_weight text,                       -- e.g. Lightweight and sheer
  add column if not exists lining text,                              -- e.g. Lined
  add column if not exists care text[] not null default '{}';        -- care instructions, one per line

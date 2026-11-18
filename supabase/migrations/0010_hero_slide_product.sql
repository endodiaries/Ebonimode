-- Each hero slide can name the piece the model is wearing, so "Worn here" links to it.
alter table public.hero_slides
  add column if not exists product_id uuid references public.products(id) on delete set null;

create index if not exists hero_slides_product_id_idx on public.hero_slides(product_id);

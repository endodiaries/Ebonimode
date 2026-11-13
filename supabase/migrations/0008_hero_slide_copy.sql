-- EBONIMODE: per-slide copy for the homepage hero (run after 0006)
-- The brief asks for an admin-set tagline and colour-story name on every slide.
alter table public.hero_slides
  add column if not exists tagline text,       -- tiny uppercase line, top-left; sentences become separate lines
  add column if not exists story_name text;    -- e.g. Indigo, Leaf, Marigold; falls back to the linked collection's name

comment on column public.hero_slides.model_public_id is
  'Cloudinary public_id of a transparent cut-out. A value starting with "/" is a file in public/ (e.g. /cutouts/indigo.webp); "placeholder/..." draws a stand-in figure.';

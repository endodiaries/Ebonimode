-- EBONIMODE: SAMPLE seed data for development (run after the migrations).
-- Everything here is a PLACEHOLDER, not real catalogue data:
--   * every product carries the tag 'sample' and site_settings.sample_data is true
--   * prices and stock are round test values so sorting, filters and checkout can be exercised;
--     the storefront must show the "[₦ PRICE]" placeholder for 'sample' products
--   * descriptions and size-guide measurements are left as placeholders or null
--   * no images are seeded; ids starting with 'placeholder/' mean "draw a colour field instead"
-- Safe to run twice: it does nothing if sample products already exist.
-- To remove: delete from products where 'sample' = any(tags); then the sample collections, categories and look.

do $$
declare
  r record;
  v_product uuid;
  v_n int := 0;
  v_size text;
  v_sizes text[];
  v_look uuid;
begin
  if exists (select 1 from public.products where 'sample' = any(tags)) then
    raise notice 'Sample data already present, nothing to do.';
    return;
  end if;

  insert into public.site_settings (key, value) values ('sample_data', 'true'::jsonb)
  on conflict (key) do update set value = excluded.value, updated_at = now();

  -- Categories (department null = shared)
  insert into public.categories (name, slug, department, sort_order) values
    ('Dresses',          'dresses',         'women', 1),
    ('Abayas & Kaftans', 'abayas-kaftans',  'women', 2),
    ('Tops',             'women-tops',      'women', 3),
    ('Skirts',           'skirts',          'women', 4),
    ('Trousers',         'women-trousers',  'women', 5),
    ('Kaftans',          'men-kaftans',     'men',   1),
    ('Shirts',           'men-shirts',      'men',   2),
    ('Agbada Sets',      'agbada-sets',     'men',   3),
    ('Trousers',         'men-trousers',    'men',   4),
    ('Accessories',      'accessories',     null,    9)
  on conflict (slug) do nothing;

  -- Collections: one colour story each (theme colours from the brand palette)
  insert into public.collections (name, slug, description, theme_hex, is_published, sort_order) values
    ('Indigo',    'indigo',    '[COLLECTION DESCRIPTION]', '#243B8F', true, 1),
    ('Leaf',      'leaf',      '[COLLECTION DESCRIPTION]', '#1D3714', true, 2),
    ('Marigold',  'marigold',  '[COLLECTION DESCRIPTION]', '#F2C21B', true, 3),
    ('Aubergine', 'aubergine', '[COLLECTION DESCRIPTION]', '#591D2E', true, 4)
  on conflict (slug) do nothing;

  -- Size guides: structure only. Measurements are null until entered in admin.
  insert into public.size_guides (department, name, unit, table_data, notes, sort_order) values
    ('women', 'Women''s clothing', 'cm',
     '{"columns":["Size","Bust","Waist","Hips"],"rows":[["XS",null,null,null],["S",null,null,null],["M",null,null,null],["L",null,null,null],["XL",null,null,null],["XXL",null,null,null]]}'::jsonb,
     '[PLACEHOLDER] Measurements to be entered in admin.', 1),
    ('men', 'Men''s clothing', 'cm',
     '{"columns":["Size","Chest","Waist","Sleeve"],"rows":[["S",null,null,null],["M",null,null,null],["L",null,null,null],["XL",null,null,null],["XXL",null,null,null]]}'::jsonb,
     '[PLACEHOLDER] Measurements to be entered in admin.', 2);

  -- 24 products: 11 women, 10 men, 3 unisex. Each colour of a style is its own product,
  -- and colours of the same style share a colourway_group_id.
  for r in
    select * from (values
      -- style, style_slug, department, category, colour, hex, family, collection, sample price, sleeve, hem, featured
      ('Batik Maxi Dress',        'batik-maxi-dress',        'women',  'dresses',        'GREEN',     '#1D3714', 'green',  'leaf',      85000,  'long',          'maxi',  true),
      ('Batik Maxi Dress',        'batik-maxi-dress',        'women',  'dresses',        'INDIGO',    '#243B8F', 'blue',   'indigo',    85000,  'long',          'maxi',  true),
      ('Batik Maxi Dress',        'batik-maxi-dress',        'women',  'dresses',        'MARIGOLD',  '#F2C21B', 'yellow', 'marigold',  85000,  'long',          'maxi',  false),
      ('Adire Wrap Abaya',        'adire-wrap-abaya',        'women',  'abayas-kaftans', 'INDIGO',    '#243B8F', 'blue',   'indigo',    120000, 'long',          'maxi',  true),
      ('Adire Wrap Abaya',        'adire-wrap-abaya',        'women',  'abayas-kaftans', 'AUBERGINE', '#591D2E', 'purple', 'aubergine', 120000, 'long',          'maxi',  false),
      ('Ankara Tiered Skirt',     'ankara-tiered-skirt',     'women',  'skirts',         'MARIGOLD',  '#F2C21B', 'yellow', 'marigold',  55000,  null,            'maxi',  false),
      ('Ankara Tiered Skirt',     'ankara-tiered-skirt',     'women',  'skirts',         'TANGERINE', '#EE8720', 'orange', 'marigold',  55000,  null,            'maxi',  true),
      ('Long-Sleeve Tunic Top',   'long-sleeve-tunic-top',   'women',  'women-tops',     'SAGE',      '#648B53', 'green',  'leaf',      45000,  'long',          'hip',   false),
      ('Long-Sleeve Tunic Top',   'long-sleeve-tunic-top',   'women',  'women-tops',     'CRIMSON',   '#8E161F', 'red',    'aubergine', 45000,  'long',          'hip',   false),
      ('Wide-Leg Trousers',       'wide-leg-trousers',       'women',  'women-trousers', 'FOREST',    '#1D3714', 'green',  'leaf',      50000,  null,            'full',  false),
      ('Wide-Leg Trousers',       'wide-leg-trousers',       'women',  'women-trousers', 'INDIGO',    '#243B8F', 'blue',   'indigo',    50000,  null,            'full',  false),
      ('Embroidered Kaftan',      'embroidered-kaftan',      'men',    'men-kaftans',    'INDIGO',    '#243B8F', 'blue',   'indigo',    95000,  'long',          'knee',  true),
      ('Embroidered Kaftan',      'embroidered-kaftan',      'men',    'men-kaftans',    'FOREST',    '#1D3714', 'green',  'leaf',      95000,  'long',          'knee',  true),
      ('Embroidered Kaftan',      'embroidered-kaftan',      'men',    'men-kaftans',    'CHESTNUT',  '#782503', 'brown',  'aubergine', 95000,  'long',          'knee',  false),
      ('Batik Long-Sleeve Shirt', 'batik-long-sleeve-shirt', 'men',    'men-shirts',     'MARIGOLD',  '#F2C21B', 'yellow', 'marigold',  48000,  'long',          'hip',   true),
      ('Batik Long-Sleeve Shirt', 'batik-long-sleeve-shirt', 'men',    'men-shirts',     'COBALT',    '#2F6FD0', 'blue',   'indigo',    48000,  'long',          'hip',   false),
      ('Agbada Set',              'agbada-set',              'men',    'agbada-sets',    'AUBERGINE', '#591D2E', 'purple', 'aubergine', 180000, 'long',          'full',  true),
      ('Agbada Set',              'agbada-set',              'men',    'agbada-sets',    'INDIGO',    '#243B8F', 'blue',   'indigo',    180000, 'long',          'full',  false),
      ('Tailored Trousers',       'tailored-trousers',       'men',    'men-trousers',   'FOREST',    '#1D3714', 'green',  'leaf',      52000,  null,            'full',  false),
      ('Tailored Trousers',       'tailored-trousers',       'men',    'men-trousers',   'CHESTNUT',  '#782503', 'brown',  'aubergine', 52000,  null,            'full',  false),
      ('Adire Tunic',             'adire-tunic',             'men',    'men-shirts',     'INDIGO',    '#243B8F', 'blue',   'indigo',    60000,  'three-quarter', 'hip',   false),
      ('Batik Tote Bag',          'batik-tote-bag',          'unisex', 'accessories',    'MARIGOLD',  '#F2C21B', 'yellow', 'marigold',  30000,  null,            null,    false),
      ('Batik Tote Bag',          'batik-tote-bag',          'unisex', 'accessories',    'INDIGO',    '#243B8F', 'blue',   'indigo',    30000,  null,            null,    true),
      ('Print Headwrap',          'print-headwrap',          'unisex', 'accessories',    'TANGERINE', '#EE8720', 'orange', 'marigold',  15000,  null,            null,    false)
    ) as t(style, style_slug, department, category, colour, hex, family, collection, price, sleeve, hem, featured)
  loop
    v_n := v_n + 1;

    insert into public.products (
      name, slug, description, fabric_care, category_id, department, price_ngn, status, is_featured,
      tryon_enabled, colour_family, colourway_group_id, sleeve_length, hem_length, tags, created_at
    ) values (
      r.style || ' in ' || r.colour,
      r.style_slug || '-' || lower(r.colour),
      '[PRODUCT DESCRIPTION] Sample product for development.',
      '[FABRIC AND CARE]',
      (select id from public.categories where slug = r.category),
      r.department, r.price, 'published', r.featured,
      r.department <> 'unisex',
      r.family,
      md5('ebonimode-sample-' || r.style_slug)::uuid,
      r.sleeve, r.hem,
      array['sample'],
      now() - make_interval(days => v_n)
    ) returning id into v_product;

    insert into public.product_collections (product_id, collection_id, sort_order)
    select v_product, id, v_n from public.collections where slug = r.collection;

    v_sizes := case r.department
      when 'women' then array['XS','S','M','L','XL','XXL']
      when 'men'   then array['S','M','L','XL','XXL']
      else array['One size'] end;

    -- Stock 0 to 8 per size, so sold-out and "Only X left" states both appear.
    foreach v_size in array v_sizes loop
      insert into public.product_variants (product_id, sku, colour, colour_hex, size, stock)
      values (
        v_product,
        'SMP-' || lpad(v_n::text, 3, '0') || '-' || upper(replace(v_size, ' ', '')),
        initcap(r.colour), r.hex, v_size,
        abs(hashtext(r.style_slug || r.colour || v_size)) % 9
      );
    end loop;
  end loop;

  -- One sample lookbook with three hotspots (placeholder image)
  insert into public.looks (title, slug, description, image_public_id, collection_id, is_published, sort_order)
  values ('Sample look: Indigo', 'sample-look-indigo', '[LOOK DESCRIPTION]', 'placeholder/look-01',
          (select id from public.collections where slug = 'indigo'), true, 1)
  returning id into v_look;

  insert into public.look_hotspots (look_id, product_id, x_pct, y_pct, sort_order)
  select v_look, p.id, h.x, h.y, h.n
  from (values ('batik-maxi-dress-indigo', 30, 45, 1),
               ('embroidered-kaftan-indigo', 68, 50, 2),
               ('batik-tote-bag-indigo', 48, 72, 3)) as h(slug, x, y, n)
  join public.products p on p.slug = h.slug;
end $$;

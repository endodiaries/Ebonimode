# Ebonímode

Afrocentric modest fashion for women and men. A luxury storefront built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Supabase and Cloudinary.

The project brief lives in [CLAUDE.md](CLAUDE.md). Build phases are in its section 11.

## Requirements
- Node.js 20.9 or newer (developed on 22 LTS)
- A Supabase project and the Supabase CLI (from Phase 1)
- A Cloudinary account

## Getting started
```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev                  # http://localhost:3000
npm run lint
npm run build
```

## Project layout
```
src/app/               routes (App Router)
src/components/brand/  PrintName (the batik-filled wordmark), StrataDivider
src/components/layout/ AnnouncementBar, SiteHeader, MobileTabBar, SiteFooter, CurrencySwitcher
src/lib/               site copy and nav, motion tokens, Cloudinary helpers, auth, Supabase clients
src/app/globals.css    design tokens (colour, type, motion) as CSS variables + Tailwind theme
public/prints/         batik fills for the wordmark (PLACEHOLDER tiles for now)
assets/                source brand assets (logo, prints, cut-outs, sample photos)
supabase/              migrations and payment Edge Functions
```

## Design tokens
All colours, fonts and easings are defined once in `src/app/globals.css` under `@theme`, so Tailwind classes like `bg-ivory`, `text-emerald`, `font-display` and `ease-entrance` work everywhere. Do not hardcode hex values in components.

Fonts (via `next/font`, self-hosted at build): Abril Fatface (display), Cormorant Garamond Italic (editorial), Archivo (UI and body).

### The print-filled name
`<PrintName print="a|b|c" />` renders EBONÍMODE filled with a batik texture through `background-clip: text`. The `print` keys match `hero_slides.print_key`. The textures are set in `globals.css` as `--print-a`, `--print-b` and `--print-c`. To swap in the real prints, upload them to Cloudinary (or put them in `public/prints/`) and point those variables at them. If a texture fails to load, the letters fall back to solid ink.

## Supabase
Migrations are in `supabase/migrations/`. Apply them in order:

| File | Purpose |
|---|---|
| 0001_ebonimode_schema.sql | core catalogue, orders, users, RLS |
| 0002_payments.sql | payment columns, `finalize_order_payment()` |
| 0003_inventory.sql | inventory ledger, suppliers, purchase orders |
| 0004_looks.sql | Shop the Look lookbooks and hotspots |
| 0005_currencies.sql | multi-currency display and charge |
| 0006_hero_slides.sql | admin-editable hero slides (renamed from a second `0005_` file so versions stay unique) |
| 0007_hardening.sql | advisor fixes: pinned `search_path`, internal functions not callable over the API |

Payment Edge Functions and their setup notes are in `supabase/functions/` and [supabase/PAYMENTS_README.md](supabase/PAYMENTS_README.md).

### Sample data
`supabase/seed.sql` adds development data: 24 sample products (11 women, 10 men, 3 unisex) across 12 styles and 4 colour-story collections, 10 categories, two size-guide shells and one sample look. It is all placeholder data: every product is tagged `sample`, `site_settings.sample_data` is `true`, prices and stock are round test values, and no images are seeded. The storefront must show `[₦ PRICE]` for `sample` products. Remove it before launch (instructions at the top of the file).

### Auth
Email and password plus Google, using `@supabase/ssr` with cookie sessions.

| Path | What it does |
|---|---|
| `src/lib/supabase/client.ts`, `server.ts` | browser and server clients (both act as the visitor under RLS) |
| `src/proxy.ts` | refreshes the session on `/account`, `/admin`, `/checkout`, `/auth`; sends guests to sign in |
| `src/lib/auth.ts` | `getCurrentUser()`, `requireUser()`, `isAdmin()`, `requireAdmin()` |
| `src/app/account/actions.ts` | sign in, create account, Google, password reset, sign out (Server Actions) |
| `src/app/auth/callback/route.ts` | landing route for Google, email confirmation and reset links |

One-time setup in the Supabase dashboard:
1. **Authentication → URL Configuration:** set the Site URL, and add `http://localhost:3000/auth/callback` and the production `/auth/callback` URL to Redirect URLs.
2. **Authentication → Providers → Google:** turn it on and paste the Google OAuth client ID and secret.
3. **Make yourself an admin** (after creating your account on the site), in the SQL editor:
   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'you@example.com';
   ```

## Cloudinary
Store each asset's `public_id` in the database. Deliver with `f_auto,q_auto` through `cldImage()` / `cldVideo()` in `src/lib/cloudinary.ts`, or pass `loader={cloudinaryLoader}` to `next/image`. The API secret stays server-side.

## Environment variables
See [.env.example](.env.example). `NEXT_PUBLIC_*` values reach the browser, so never put secrets in them.

## Deployment
To be documented in Phase 9 (Vercel is recommended for Next.js 16).

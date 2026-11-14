# EBONÍMODE: Project Guide for Claude Code

This file is loaded automatically every session. It is the standing brief for the whole project. Follow it, and re-read the relevant section before starting any task.

## 0. How to work
Act as a principal full-stack engineer and senior product designer in one. Build an e-commerce site that looks like a luxury fashion house and is effortless to use. Luxury here means restraint, craft and clarity. When taste and usability conflict, usability wins, then find the elegant way to have both.
- Work in the phases in section 11. For each phase: plan first, build, run `npm run lint` and `npm run build`, fix errors, commit, then stop and summarise what you built and what you assumed. Wait for my go-ahead before the next phase.
- If something is ambiguous, ask one short question or choose the best option and say why.
- Never invent data. Prices, reviews, product names, counts and statistics are clearly marked placeholders (for example `[₦ PRICE]`) until real data exists.
- Assets are in `assets/`: logo (`ebonimode-logo.svg`, `.png`), African print textures (`assets/prints/`), transparent model cut-outs (`assets/cutouts/`) and sample photos (`assets/sample/`, placeholders only).
- Ready-made backend files: SQL migrations `0001` to `0004` and the payment Edge Functions in `supabase/` (see section 6 and 9). Use and extend them; do not rewrite them from scratch.

## 1. Brand
**Ebonímode** (copy) / **ebonimode** (logo wordmark). Afrocentric modest fashion for **women and men**, plus unisex pieces and accessories. Menswear is a first-class department with its own landing page, categories, size guide, filters and photography.

Use verbatim on About, the footer blurb and the meta description:
> At Ebonímode, we believe that modest fashion can be elegant, culturally expressive, and deeply responsible. Our brand blends timeless Afrocentric design with ethical, sustainable practices, creating clothing that cares for both people and the planet.

Use verbatim on About and Our Impact:
> Our mission is to craft timeless, Afrocentric modest fashion that celebrates culture, champions sustainability, empowers women, and uplifts the next generation of artisans while honouring both our heritage and the earth.

Voice: warm, confident, short sentences, no jargon.

## 2. Design direction: neat, colourful, confident
Feel: a clean, modern luxury storefront with a bold African identity. Spacious and calm in structure, vivid in colour. Colour comes from the clothes, the print and flat colour fields, not from decorating the interface.

**Inspiration (take structure and mood, never branding or imagery):**
- ofuure.com: collection rows with quick-add cards, colour in the product name, themed drops, category rows with product counts, reviews and journal.
- Minimal modern fashion homepages: a hero with the **brand name set huge behind a cut-out model who overlaps the lettering**, a tiny tagline top-left, actions bottom-left, a "new collection" note bottom-right; a department strip with small thumbnails and "Shop women →" links; a split promo banner with a big headline beside a model; a row of trust points (fast delivery, easy returns, quality, secure payment); a clean "Best of" product grid; a simple newsletter.
- Ebonímode's own twist: the brand name is written in African print, scenes are built from colour fields, and every collection is a colour story.

### 2.1 The brand name (updated by the owner, November 2026)
- The brand name is **not** set in batik print anywhere, and there is **no giant name in the hero**. No batik print is used as decoration.
- The header shows the **handwritten wordmark from the logo, in a very bold weight** (`src/assets/ebonimode-wordmark.png`), centred, in ink, with accessible text.
- The full logo (mark plus wordmark) appears in the footer.
- Do not invent colour-story names such as "Indigo" or "Leaf". Use the real collections and piece names.

### 2.2 Colour tokens (define once as CSS variables and Tailwind theme, never hardcode hex in components)
- Paper ivory `#FAF6EF`, sand `#EFE6D8`, ink `#1A1718`.
- Emerald `#0B6B4F` (primary), deep emerald `#064734`, burnt orange `#C2571A` (accent), antique gold `#B8923A` (hairlines only).
- Colour-story palette from the logo and fabrics: forest `#1D3714`, sage `#648B53`, aubergine `#591D2E`, crimson `#8E161F`, vermilion `#C23302`, tangerine `#EE8720`, marigold `#F2C21B`, chestnut `#782503`, indigo `#243B8F`, cobalt `#2F6FD0`, blush `#E9808F`.
- Each collection has an admin-set `theme_hex`. Check WCAG AA contrast for any text on colour.

### 2.3 Typography
- Display: **Abril Fatface** (name, big headlines). Editorial: **Cormorant Garamond Italic** (decks, quotes, captions). UI and body: **Archivo** (small uppercase, 0.2em tracking for nav and labels; 16px body).
- Square corners, 1px rules, no pill buttons, no card shadows. Generous white space.

### 2.4 Hero: modern, chic slideshow (the centrepiece)
A full-width, landscape hero (about 1440 x 760 on desktop) with 4 to 5 slides. Each slide is composed like this:
- A flat **colour field** background (ivory, sand, marigold, tangerine, etc.) and nothing else behind the model.
- Left, vertically centred: a small "New collection N°01" label, then the slide's tagline as a large Abril headline, then a short rule.
- Right: a large **transparent cut-out model** with a soft ground shadow.
- Bottom-left: **exactly two buttons: "Shop Women" and "Shop Men"** (same on every slide), with the progress lines above them.
- Bottom-right: "Worn here" with the name of the piece in Cormorant italic.
- On phones the copy sits at the top and the model is centred beneath it.

**Transition (neat and calm):**
- Autoplay about 6.5s per slide; transition 1.1s with `cubic-bezier(0.22, 1, 0.36, 1)`.
- The colour field crossfades; the outgoing model slides 40px left and fades out while the incoming model slides in 40px from the right and fades up; headline lines stagger in (80ms apart).
- Tiny thin progress lines with the numerals "01 / 05" (non-CTA indicators). Click to jump; swipe on touch; left and right arrow keys; pause on hover and focus; pause when the tab is hidden.
- `prefers-reduced-motion`: no autoplay, simple crossfade only, no drift.
- Performance: the first slide's model is a preloaded high-priority image (it is the LCP element); the other slides lazy-load; animate only `transform` and `opacity`; no layout shift.
- **Only two marketing call-to-action buttons exist on the whole homepage, both in the hero.** Everything else is an underlined text link or a clickable image. Functional controls (size chips, quick add, newsletter submit) are small and understated.

### 2.5 Homepage sections, in order (restructured by the owner, November 2026)
1. Thin announcement bar: "Free delivery in Lagos over [₦ AMOUNT] · Pay in installments"; right side: Track order, Help.
2. Header: left Women, Men, Collections; centre the bold handwritten wordmark; right Search, Account, Wishlist, Bag (0), currency switcher. Hides on scroll down, returns on scroll up. Mega-menu with colour swatches and a featured image.
3. Hero slideshow (2.4).
4. **Departments:** two large photo tiles, Women and Men, each with one line of copy and an underlined link.
5. **New in / Best of Ebonímode:** product grid (4 columns desktop). Each card: image, wishlist heart, name with colour in capitals where a style has colours, price, colour swatches linking to sibling colourways, and size chips with quick add.
6. **Collections:** one tall colour tile per real collection (Chronicles of Africa: Eko, Eid Luxe) with a cut-out model.
7. **Shop the Look:** a campaign photo with tappable hotspots opening a mini product card.
8. **Our story:** the verbatim brand story beside a photo, three craft notes from the product descriptions, links to Our Impact and Artisans.
9. **Trust row:** fast delivery, easy returns, quality assured, secure payment.
10. **Reviews** and **Journal:** shown only when real reviews or posts exist. No placeholders.
11. Newsletter with one underlined email field and a consent line.
12. Colour-band divider, then the footer: **logo on an ivory card**, Shop, Explore, Policies, social links, payment methods.

### 2.6 Motion (subtle and expensive-feeling)
Motion tokens: 150ms micro, 250ms UI, 400ms page and sections, 700 to 1100ms hero. Entrance easing `cubic-bezier(0.22, 1, 0.36, 1)`. Soft route crossfade with a 12 to 16px upward slide (View Transitions API with a fallback), header persistent. Product card image morphs into the product page gallery. Scroll reveals (fade up 24px, 60ms stagger, once). Cart badge bump and fly-to-cart. Skeletons shimmer in the logo's strata colours. Only `transform` and `opacity`, lazy-loaded animation code, honour reduced motion, never hurt LCP, CLS or INP.

## 3. Pages and navigation
Home, Women, Men, Collections, Collection, Shop All, Category, Product, Search, Lookbook (Shop the Look), Cart, Checkout, Order Confirmation, Account (orders, wishlist, addresses), About, Our Impact, Artisans, Journal (blog), Reviews, Contact, FAQs, Size Guide (separate women's and men's tables, admin-editable), Shipping & Returns, Privacy and Terms, Gift Cards, 404.
Navigation rules: any category within 2 taps; plain labels; breadcrumbs; sticky filter bar with live counts, active chips and "clear all", scroll position preserved on return; mobile bottom tab bar (Home, Shop, Search, Wishlist, Bag); search with suggestions, recent searches and typo tolerance.

## 4. Shop and product experience
- Product page: gallery with zoom, optional short video, colour and size variants with per-variant stock, size guide link, "model is wearing size X" note, delivery estimate, Add to Bag as the single primary button, wishlist, WhatsApp order button (pre-filled), Craft & Care accordion (fabric, artisan, care, sustainability), reviews with photo upload (admin-moderated), "Complete the look", "You may also like".
- Colourways: each colour of a style is its own card sharing a `colourway_group_id`; browse by colour is a first-class path ("Shop by colour").
- Filters: department, colour, size, price, category, availability, modest attributes (sleeve and hem length). Sorting and pagination.
- Fit finder: height, usual size and fit preference recommend a size using the admin size guides.
- Accounts, guest checkout, wishlist (guest local storage merged on login), gift cards, gift message and wrap option.
- Sold-out sizes disable Add to Bag; low stock shows "Only X left"; "Notify me when back in stock".

## 5. Virtual try-on (Genlook)
Use Genlook's standalone Virtual Try-On API and `@genlook/api` TypeScript SDK; read their docs and example repo (`github.com/genlookLabs/virtual-try-on-api-example`) before coding and ask me if anything is unclear. Server-only API key behind Next.js route handlers with validation and rate limiting; a lazy-loaded TryOnButton and modal on product pages (photo tips, loading state, result with Add to Bag, privacy note, graceful failure); per-product toggle and a site-wide kill switch; analytics events. No try-on code in the initial bundle. See `GENLOOK_INTEGRATION.md`.

## 6. Payments
- Providers behind a `PaymentProvider` interface: Paystack (cards, bank transfer, USSD) first, Flutterwave optional (adapter written for v3; implement v4 from current docs if my account needs it), and a Nigerian installment provider (CredPal, Easybuy or similar; adapter is a template, implement from their merchant docs and ask me if unclear).
- Installments only for NGN orders in Nigeria within admin-set limits, enforced server-side; teaser on product and cart pages.
- Use the existing Edge Functions: `payment-initiate`, `payment-webhook`, `payment-verify`, and the SQL function `finalize_order_payment`. Prices come from the database, never the browser. Orders become paid only after server-side, idempotent verification. Mismatches and oversells are flagged `needs_attention`, never hidden.
- Still to build: the `create-order` function (reprices the cart from the database, validates promo and gift card, creates a pending order, handles fully gift-card-covered orders), checkout UI, confirmation page that polls `payment-verify`, and emails.

### Currencies (display vs charge)
**Launch currencies: NGN, USD, GBP, EUR, CAD, GHS.**
- **Display currency** is what the visitor sees (converted from the NGN price). **Charge currency** is what we can really collect. They are tracked separately in the `currencies` table (migration `0005_currencies.sql`): rate per NGN, symbol, decimals, rounding step, `display_enabled`, `charge_enabled`, and an ordered `charge_providers` list (the first provider is the default at checkout). Only NGN is on at first; no rate is invented (placeholder 1, disabled) until the admin enters a real rate and confirms the provider.
- **Provider routing (confirm in each dashboard):**
  - NGN: Paystack first (cards, bank transfer, USSD), Flutterwave as backup; installments are NGN and Nigeria only.
  - USD: Paystack or Flutterwave. Paystack ties currencies to the country the business is registered in; a Nigerian account can accept NGN and USD, USD needs to be enabled, and USD payouts need a domiciliary account.
  - GBP, EUR, CAD: Flutterwave only (a Nigerian Paystack account cannot charge these).
  - GHS: Flutterwave; Paystack only if the business is registered in Ghana.
  - Checkout picks the provider automatically from the chosen currency and never offers a provider that cannot charge it.
- **Never display one currency and charge another without saying so.** If a visitor browses in a currency we cannot charge, show prices as approximate and charge in USD with a clear line at checkout ("You will be charged $X, about £Y").
- **Default currency by country:** NG gives NGN, GB gives GBP, CA gives CAD, GH gives GHS, US gives USD, euro-area countries give EUR, everywhere else gives USD. The visitor can always change it with an obvious switcher that remembers the choice. Format with `Intl.NumberFormat`.
- Checkout: the server locks the order to a currency and rate (`snapshot_order_currency`), computes the exact amount once (`set_order_amount_due`, stored as `amount_due_minor`), and `payment-initiate` refuses a provider that is not enabled for that currency. Settlement compares the provider's paid amount and currency to that stored amount.
- Storefront: round to the currency's step; price filters and sorting work in the active currency; the cart, checkout and emails show the charged currency; shipping rates show in the active currency.
- Admin: a Currencies page to set rates and rounding, switch display and charge per currency, reorder providers, and see when each rate was last updated, with a warning if older than 7 days. Optional scheduled rate refresh with manual override. More currencies can be added later by inserting a row.

## 7. Admin dashboard (non-technical friendly, admin role only)
Plain labels, big buttons, one obvious next action per screen, confirmation dialogs. Colours calm: ivory, white, emerald, with status chips (green paid, gold pending, blue shipped, orange needs attention, red sold out).
- Overview: sales today, orders to fulfil, low or sold-out variants, orders needing attention, sales chart, recent orders, quick actions.
- Products (variants, Cloudinary multi-image and video upload with drag reorder, colourway grouping, modest attributes, try-on toggle), collections (theme colour, banner image and video), categories, sizes, colours, size guides, artisans, lookbooks with a click-to-place hotspot tool.
- **Inventory system** (see migration `0003_inventory.sql`): stock overview with filters and inline edits; a full movement ledger per variant (who, why, when); adjustments with required reasons through the `admin_adjust_stock` and `admin_set_stock` functions; CSV import and export with a dry-run preview; reorder levels and low-stock alerts; suppliers and purchase orders with partial or full receiving (`receive_purchase_order_item`); mobile stocktake mode with optional camera barcode scan; reports (valuation, sell-through, slow movers). Cost prices and supplier data are admin-only.
- Currencies (rates, rounding, display and charge switches per provider), orders (statuses, tracking numbers, printable invoice, "needs attention" filter), customers, promo codes and sales, gift cards, review moderation, blog, shipping zones and rates, homepage hero slides (image upload, colour field, tagline, colour-story name), site content, settings.

## 8. Integrations and marketing
Delivery rates by location (shown in the active currency); emails with Resend (order confirmation and receipt, shipped with tracking, delivered, abandoned cart, welcome, gift card, back-in-stock, admin alerts); newsletter and journal; WhatsApp chat and order button; Instagram and TikTok; GA4 and Meta Pixel with e-commerce events behind a cookie consent banner.

## 9. Tech stack
- Next.js (App Router) + TypeScript (strict) + Tailwind CSS. Server rendering for SEO. Installable PWA with an offline fallback page.
- Supabase: Postgres, Auth (email and Google), RLS on every table, Edge Functions. Apply migrations in order: `0001_ebonimode_schema.sql`, `0002_payments.sql`, `0003_inventory.sql`, `0004_looks.sql`, `0005_currencies.sql`.
- **Cloudinary** for all images and video: the Upload Widget (via `next-cloudinary`) in the admin using an unsigned, narrowly restricted upload preset (or signed uploads for stricter control), store `public_id` in the database, deliver with `f_auto,q_auto` and responsive widths. API secret stays server-side.
- Resend, Genlook, Paystack and the installment provider. All secrets in environment variables; keep `.env.example` current.

## 10. Quality gates (a phase is not done until these pass)
- Responsive: mobile-first, checked at 360, 390, 768, 1024, 1280 and 1536px; no horizontal scroll; 44px tap targets; sticky Add to Bag on mobile product pages; swipeable carousels.
- Performance: Lighthouse mobile 90+; LCP under 2.5s, CLS under 0.1, INP under 200ms; Save-Data respected; built for slow Nigerian mobile networks.
- SEO: unique titles and descriptions, clean slugs, canonicals, Open Graph, JSON-LD (Organization, Product with AggregateRating, BreadcrumbList, BlogPosting, FAQPage), sitemap and robots, alt text, one H1 per page, admin-editable SEO fields.
- Accessibility: WCAG 2.2 AA, keyboard navigation, focus states, reduced motion, screen-reader labels.
- Tests: unit tests for pricing, stock and payment logic; Playwright end-to-end tests for browse, filter, quick add, guest checkout with a test payment, confirmation, back-in-stock signup, and admin adding a product and adjusting stock; axe accessibility checks.
- Security: RLS tested per role, no secrets client-side, rate limiting on public endpoints, webhook signatures verified, server-side validation. Error tracking and uptime monitoring before launch.

## 11. Build phases (stop and report after each)
0. Setup: project, tokens, fonts, layout shell, header with the logo wordmark, footer with the logo, `.env.example`, README.
1. Database and auth: apply migrations, seed about 24 products (half women, half men, a few unisex) in several colourways across 3 to 4 collections with theme colours, size guides, one sample lookbook.
2. Hero slideshow and homepage (sections 2.4 and 2.5) with sample content, then the motion system (2.6).
3. Storefront browsing: Women, Men, Collections, categories, filters, search, quick add, colour browsing.
4. Product page: variants, gallery, reviews, recommendations, fit finder, Shop the Look, Genlook try-on.
5. Cart, accounts, wishlist, currency switcher.
6. Checkout and payments: `create-order` (including currency lock), Paystack, Flutterwave for extra currencies, installment adapter, confirmation, emails.
7. Admin: dashboard, products, collections, hero slides, orders, then the full inventory module.
8. Content pages: About, Our Impact, Artisans, Journal, Size Guide, policies, FAQs, Contact.
9. Polish and launch: analytics, WhatsApp, SEO, PWA, performance and accessibility audit, Playwright suite, security review, error tracking. Give me a before/after scorecard and a list of anything still imperfect.

## 12. Never
No batik-print brand name, no giant name in the hero, no print behind the hero model, no invented colour-story names. No more than two marketing buttons on the homepage. No pill buttons, no card shadows, no generic template feel. No invented statistics or product claims. Never expose service-role or payment secrets to the client. Never disable RLS to make something work. Never mark an order paid from the browser.


## Next.js version note
See AGENTS.md: this is Next.js 16; read `node_modules/next/dist/docs/` before using framework APIs.

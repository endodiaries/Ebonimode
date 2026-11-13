import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { PlaceholderFigure } from "@/components/brand/PlaceholderFigure";
import { LockIcon, QualityIcon, ReturnIcon, TruckIcon } from "@/components/icons";
import { ProductCard } from "@/components/product/ProductCard";
import { readableOn } from "@/lib/colour";
import type { CollectionSummary, JournalCard, ProductCardData, ReviewCard } from "@/lib/data/home";
import { BRAND_STORY } from "@/lib/site";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 md:mb-14" data-reveal>
      <div>
        {eyebrow && <p className="label mb-3 text-ink-soft">{eyebrow}</p>}
        <h2 className="font-display text-4xl leading-[1.05] md:text-5xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/** 4. Deep colour band with Women, Men and New in. */
export function DepartmentStrip() {
  const items = [
    { label: "Women", copy: "Dresses, abayas, skirts and more.", href: "/women", link: "Shop women", swatch: "bg-marigold" },
    { label: "Men", copy: "Kaftans, agbada sets and shirts.", href: "/men", link: "Shop men", swatch: "bg-indigo" },
    { label: "New in", copy: "The latest pieces, just landed.", href: "/shop?sort=new", link: "Shop new in", swatch: "bg-tangerine" },
  ];
  return (
    <section aria-label="Departments" className="gutter bg-emerald-deep text-ivory">
      <ul className="mx-auto grid max-w-[90rem] divide-y divide-ivory/15 md:grid-cols-3 md:divide-x md:divide-y-0">
        {items.map((it, i) => (
          <li key={it.href} className="md:px-8 md:first:pl-0 md:last:pr-0" data-reveal style={stagger(i)}>
            <Link href={it.href} className="group flex items-center gap-5 py-6 md:py-10">
              {/* PLACEHOLDER thumbnail: a colour block until department photos are uploaded. */}
              <span className={`${it.swatch} flex h-16 w-16 shrink-0 items-end justify-center overflow-hidden text-ink/30`} aria-hidden="true">
                <PlaceholderFigure className="h-[88%] w-auto" />
              </span>
              <span>
                <span className="block font-display text-2xl">{it.label}</span>
                <span className="mt-0.5 block text-sm text-ivory/80">{it.copy}</span>
                <span className="text-link label mt-2 inline-block group-hover:text-marigold">{it.link} →</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 5. One full-width split banner per colour story, alternating sides. */
export function StoryBanners({ collections }: { collections: CollectionSummary[] }) {
  return (
    <section aria-label="Colour stories">
      {collections.slice(0, 3).map((c, i) => {
        const tone = readableOn(c.themeHex) === "ink" ? "text-ink" : "text-ivory";
        return (
          <article key={c.id} className={`${tone} grid md:grid-cols-2`} style={{ backgroundColor: c.themeHex }}>
            <div className={`gutter flex flex-col justify-center py-14 md:py-24 ${i % 2 ? "md:order-2" : ""}`} data-reveal>
              <p className="label opacity-80">
                Colour story N°{String(i + 1).padStart(2, "0")}
                {c.productCount > 0 && ` · ${c.productCount} pieces`}
              </p>
              <h2 className="mt-4 font-display text-6xl leading-[0.95] md:text-8xl">{c.name}</h2>
              {c.description && <p className="mt-6 max-w-md font-editorial text-xl italic md:text-2xl">{c.description}</p>}
              <p className="mt-8">
                <Link href={`/collections/${c.slug}`} className="text-link label hover:!text-current hover:opacity-70">
                  Explore {c.name} →
                </Link>
              </p>
            </div>
            <Link
              href={`/collections/${c.slug}`}
              tabIndex={-1}
              aria-hidden="true"
              className="relative flex h-80 items-end justify-center overflow-hidden md:h-[34rem]"
            >
              {/* PLACEHOLDER model on the colour field until the collection banner is uploaded. */}
              <span className="absolute inset-x-[20%] bottom-0 h-8 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-ink)_30%,transparent),transparent)]" />
              <PlaceholderFigure className="relative h-[92%] w-auto opacity-85" />
            </Link>
          </article>
        );
      })}
    </section>
  );
}

/** 6. Trust row. */
export function TrustRow() {
  // Titles only: no delivery times or guarantees are claimed until the policies are written.
  const points = [
    { Icon: TruckIcon, title: "Fast delivery" },
    { Icon: ReturnIcon, title: "Easy returns" },
    { Icon: QualityIcon, title: "Quality assured" },
    { Icon: LockIcon, title: "Secure payment" },
  ];
  return (
    <section aria-label="Why shop with us" className="gutter border-b border-ink/10">
      <ul className="mx-auto grid max-w-[90rem] grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4 md:py-16">
        {points.map(({ Icon, title }, i) => (
          <li key={title} className="flex flex-col items-center text-center" data-reveal style={stagger(i)}>
            <Icon size={28} className="text-emerald" />
            <h3 className="label mt-4">{title}</h3>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 7. Best of Ebonímode: four columns on desktop, two on phones. */
export function BestOf({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;
  return (
    <section className="gutter py-16 md:py-24">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeading
          eyebrow="New in"
          title="Best of Ebonímode"
          action={
            <Link href="/shop" className="text-link label">
              Shop all →
            </Link>
          }
        />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
          {products.map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} index={i} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 8. Wrapper for Shop the Look (the interactive part is a client component). */
export function LookSection({ children }: { children: ReactNode }) {
  return (
    <section className="gutter bg-sand py-16 md:py-24">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeading
          eyebrow="Lookbook"
          title="Shop the look"
          action={
            <Link href="/lookbook" className="text-link label">
              See every look →
            </Link>
          }
        />
        <div data-reveal>{children}</div>
      </div>
    </section>
  );
}

/** 9. Our story: the brand story, verbatim. */
export function OurStory() {
  return (
    <section className="gutter py-20 md:py-32">
      <div className="mx-auto max-w-3xl text-center" data-reveal>
        <p className="label text-ink-soft">Our story</p>
        <h2 className="sr-only">Our story</h2>
        <p className="mt-6 font-editorial text-2xl leading-snug italic md:text-4xl md:leading-snug">{BRAND_STORY}</p>
        <p className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-4">
          <Link href="/impact" className="text-link label">
            Our impact →
          </Link>
          <Link href="/artisans" className="text-link label">
            Meet the artisans →
          </Link>
        </p>
      </div>
    </section>
  );
}

/** 10. Reviews. Until real approved reviews exist, the count and cards are marked placeholders. */
export function Reviews({ count, latest }: { count: number; latest: ReviewCard[] }) {
  const hasReal = latest.length > 0;
  return (
    <section className="gutter bg-sand py-16 md:py-24">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeading
          eyebrow="Reviews"
          title={<>Let customers speak for us</>}
          action={
            <p className="text-ink-soft">
              from {hasReal ? count : "[N]"} reviews ·{" "}
              <Link href="/reviews" className="text-link">
                Read all
              </Link>
            </p>
          }
        />
        <ul className="grid gap-px bg-ink/10 md:grid-cols-3">
          {(hasReal ? latest : [null, null, null]).map((r, i) => (
            <li key={r?.id ?? i} className="bg-sand py-8 md:px-8 md:first:pl-0" data-reveal style={stagger(i)}>
              <p className="text-gold" aria-label={r ? `${r.rating} out of 5` : "Rating to come"}>
                {r ? "★".repeat(r.rating) + "☆".repeat(5 - r.rating) : "☆☆☆☆☆"}
              </p>
              {r?.title && <h3 className="mt-3 font-medium">{r.title}</h3>}
              <blockquote className="mt-3 font-editorial text-xl italic">{r ? r.body : "[CUSTOMER REVIEW]"}</blockquote>
              {!r && <p className="label mt-4 text-ink-soft">[CUSTOMER NAME]</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 11. Journal: three stories (placeholders until posts are published). */
export function Journal({ posts }: { posts: JournalCard[] }) {
  const cards: (JournalCard | null)[] = posts.length > 0 ? posts : [null, null, null];
  const fields = ["bg-sage", "bg-tangerine", "bg-aubergine"];
  return (
    <section className="gutter py-16 md:py-24">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeading
          eyebrow="Journal"
          title="Stories from the studio"
          action={
            <Link href="/journal" className="text-link label">
              Read the journal →
            </Link>
          }
        />
        <ul className="grid gap-10 md:grid-cols-3 md:gap-6">
          {cards.map((post, i) => (
            <li key={post?.slug ?? i} data-reveal style={stagger(i)}>
              <Link href={post ? `/journal/${post.slug}` : "/journal"} className="group block">
                {/* PLACEHOLDER cover: a colour field until a cover photo is uploaded. */}
                <span className={`${fields[i % 3]} block aspect-[4/3]`} aria-hidden="true" />
                <h3 className="mt-5 font-display text-2xl leading-tight group-hover:underline">
                  {post?.title ?? "[JOURNAL STORY TITLE]"}
                </h3>
                <p className="mt-2 text-ink-soft">{post ? post.excerpt : "[SHORT SUMMARY OF THE STORY]"}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 12. Newsletter frame (the form itself is a client component). */
export function NewsletterSection({ children }: { children: ReactNode }) {
  return (
    <section className="gutter border-t border-ink/10 py-20 text-center md:py-28">
      <div data-reveal>
        <p className="label text-ink-soft">Newsletter</p>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">Be first to see each colour story.</h2>
        <p className="mt-4 mb-10 font-editorial text-xl italic">New collections, journal stories and quiet offers.</p>
        {children}
      </div>
    </section>
  );
}

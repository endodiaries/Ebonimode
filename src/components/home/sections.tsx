import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CldImage } from "@/components/brand/CldImage";
import { LockIcon, QualityIcon, TapeIcon, TruckIcon } from "@/components/icons";
import { ProductCard } from "@/components/product/ProductCard";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { readableOn } from "@/lib/colour";
import type { CollectionSummary, JournalCard, ProductCardData, ReviewCard } from "@/lib/data/home";
import { HOME_MEDIA } from "@/lib/home-media";
import { BRAND_STORY } from "@/lib/site";
import { ProductRail } from "./ProductRail";

/** What the pieces are made of and how, taken from the brand's own product descriptions. */
const CRAFT = [
  { term: "Hand-dyed Adire", note: "Drawn and dyed by hand, so no two pieces are quite the same." },
  { term: "Handwoven Asooke", note: "Traditional Nigerian weaving, cut into clean, modern shapes." },
  { term: "Lagos in every print", note: "Skylines, waterways and landmarks, told in cloth." },
];

/** Words that run along the marquee band. */
const MARQUEE = ["Hand-dyed Adire", "Handwoven Asooke", "Modest by design", "Lagos in every print", "For women and men", "Made to be kept"];

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

function SectionHeading({ title, intro, action }: { title: ReactNode; intro?: string; action?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-5 md:mb-14" data-reveal>
      <div className="max-w-2xl">
        <h2 className="font-display text-5xl leading-[0.95] md:text-7xl">{title}</h2>
        {intro && <p className="mt-4 font-editorial text-xl italic text-ink-soft md:text-2xl">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

/** A slow band of words between the hero and the departments. Static for reduced motion. */
export function Marquee() {
  const row = (
    <>
      {MARQUEE.map((w) => (
        <span key={w} className="flex shrink-0 items-center gap-10 pr-10">
          <span>{w}</span>
          <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current" aria-hidden="true">
            <path d="M6 0 7.4 4.6 12 6 7.4 7.4 6 12 4.6 7.4 0 6 4.6 4.6z" />
          </svg>
        </span>
      ))}
    </>
  );
  return (
    <div className="marquee border-b border-ink/10 py-5 md:py-7" aria-label={MARQUEE.join(", ")} role="note">
      <div className="marquee-track font-editorial text-3xl italic md:text-5xl" aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  );
}

/** Two tall department panels: a cut-out model on a colour field, the name set huge. */
export function Departments() {
  const { women, men } = HOME_MEDIA.departments;
  const items = [
    { label: "Women", copy: "Boubous, silk sets and dresses that move.", href: "/women", link: "Shop women", photo: women },
    { label: "Men", copy: "Linen, Adire and Asooke, cut clean.", href: "/men", link: "Shop men", photo: men },
  ];
  return (
    <section aria-label="Departments" className="grid md:grid-cols-2">
      {items.map((it, i) => {
        const tone = readableOn(it.photo.field) === "ink" ? "text-ink" : "text-ivory";
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`${tone} group relative block h-[34rem] overflow-hidden md:h-[min(56rem,92svh)]`}
            style={{ backgroundColor: it.photo.field }}
            data-reveal="media"
          >
            {/* The name sits behind the model, like the hero headline. */}
            <span
              className="dept-name pointer-events-none absolute inset-x-0 bottom-[4.5rem] block px-6 font-display text-[6rem] leading-[0.8] md:bottom-[6.5rem] md:px-12 md:text-[clamp(7rem,13vw,13rem)]"
              style={stagger(i)}
            >
              {it.label}
            </span>
            {cloudinaryEnabled && (
              <span className="reveal-zoom absolute inset-x-[10%] top-[10%] bottom-[4.5rem] md:inset-x-[14%] md:top-[10%] md:bottom-[5rem]">
                <span className="absolute inset-0 transition-transform duration-[900ms] ease-entrance group-hover:-translate-y-3 group-hover:scale-[1.03]">
                  <CldImage
                    publicId={it.photo.publicId}
                    alt={it.photo.alt}
                    sizes="(min-width: 768px) 40vw, 80vw"
                    className="object-contain object-bottom"
                  />
                </span>
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex min-h-[4.5rem] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-4 md:min-h-[5rem] md:px-12">
              <span className="font-editorial text-lg italic max-sm:hidden md:text-2xl">{it.copy}</span>
              <span className="text-link label">{it.link}</span>
            </span>
          </Link>
        );
      })}
    </section>
  );
}

/** The brand statement, large; each word lights up as the paragraph scrolls through. */
export function Statement() {
  const words = BRAND_STORY.split(" ");
  return (
    <section className="gutter py-24 md:py-40">
      <p className="statement mx-auto max-w-[68rem] font-display text-[2.1rem] leading-[1.08] font-medium md:text-[clamp(3rem,5vw,4.75rem)]">
        {words.map((w, i) => (
          <span key={i} className="statement-word" style={{ "--p": i / words.length } as CSSProperties}>
            {w}{" "}
          </span>
        ))}
      </p>
    </section>
  );
}

/** New in: a sliding rail of large cards. */
export function BestOf({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;
  return (
    <section className="py-16 md:py-24">
      <div className="gutter mx-auto max-w-[96rem]">
        <SectionHeading
          title="New in"
          intro="Fresh from the cutting table."
          action={
            <Link href="/shop" className="text-link label">
              Shop everything
            </Link>
          }
        />
      </div>
      <ProductRail label="New in">
        {products.map((p, i) => (
          <li key={p.id} className="rail-item">
            <ProductCard product={p} index={i} showPrice={false} reveal={false} />
          </li>
        ))}
      </ProductRail>
    </section>
  );
}

/** Collections: full-height colour panels that stack as you scroll. */
export function Collections({ collections }: { collections: CollectionSummary[] }) {
  if (collections.length === 0) return null;
  return (
    <section aria-label="Collections" className="relative">
      <div className="gutter mx-auto max-w-[96rem] pt-16 md:pt-24">
        <SectionHeading
          title="Collections"
          intro="Each one a colour story."
          action={
            <Link href="/collections" className="text-link label">
              See all collections
            </Link>
          }
        />
      </div>
      <ul>
        {collections.slice(0, 4).map((c, i) => {
          const tone = readableOn(c.themeHex) === "ink" ? "text-ink" : "text-ivory";
          return (
            <li key={c.id} className="collection-panel" style={{ backgroundColor: c.themeHex, zIndex: i + 1 }}>
              <Link href={`/collections/${c.slug}`} className={`${tone} group relative block h-full overflow-hidden`}>
                {c.bannerPublicId && cloudinaryEnabled && (
                  <span className="absolute top-[9%] right-[-2%] bottom-[40%] w-[72%] md:top-[6%] md:right-[6%] md:bottom-0 md:w-[42%]">
                    <span className="absolute inset-0 transition-transform duration-[900ms] ease-entrance group-hover:-translate-y-3">
                      <CldImage
                        publicId={c.bannerPublicId}
                        alt=""
                        sizes="(min-width: 768px) 40vw, 70vw"
                        className="object-contain object-bottom"
                      />
                    </span>
                  </span>
                )}
                <span className="gutter relative flex h-full max-w-[62rem] flex-col justify-between py-10 md:py-16">
                  <span className="label opacity-80">{c.productCount > 0 ? `${c.productCount} pieces` : "Collection"}</span>
                  <span className="block">
                    <span className="block max-w-[11ch] font-display text-[3.5rem] leading-[0.9] md:text-[clamp(5rem,9vw,9.5rem)]">
                      {c.name}
                    </span>
                    {c.description && (
                      <span className="mt-6 block max-w-md font-editorial text-xl italic max-md:hidden md:text-2xl">
                        {c.description}
                      </span>
                    )}
                    <span className="text-link label mt-8 inline-block">Explore the collection</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Wrapper for Shop the Look (the interactive part is a client component). */
export function LookSection({ children }: { children: ReactNode }) {
  return (
    <section className="gutter bg-sand py-20 md:py-32">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeading
          title="Shop the look"
          intro="Two pieces, one afternoon."
          action={
            <Link href="/lookbook" className="text-link label">
              See every look
            </Link>
          }
        />
        <div data-reveal>{children}</div>
      </div>
    </section>
  );
}

/** Craft: how the cloth is made, beside a photo. */
export function OurStory() {
  const { story } = HOME_MEDIA;
  return (
    <section className="gutter py-20 md:py-32">
      <div className="mx-auto grid max-w-[96rem] items-end gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-20">
        {cloudinaryEnabled && (
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-blush" data-reveal="media">
            <span className="reveal-zoom absolute inset-x-[6%] top-0 bottom-0">
              <CldImage
                publicId={story.publicId}
                alt={story.alt}
                sizes="(min-width: 768px) 40vw, 100vw"
                // The photo is cropped at the top, so its top edge sits flush with the tile.
                className="object-contain object-top"
              />
            </span>
          </div>
        )}
        <div data-reveal>
          <h2 className="font-display text-5xl leading-[0.95] md:text-7xl">Made slowly, by hand.</h2>
          <p className="mt-6 max-w-xl font-editorial text-2xl leading-snug italic md:text-3xl">
            Every print starts as a drawing. Every colour is dyed, rinsed and dried in the sun before it is cut.
          </p>
          <dl className="mt-12 grid gap-8 border-t border-ink/15 pt-10 sm:grid-cols-3">
            {CRAFT.map((c, i) => (
              <div key={c.term} data-reveal style={stagger(i)}>
                <dt className="font-display text-2xl leading-tight">{c.term}</dt>
                <dd className="mt-3 text-base text-pretty text-ink-soft">{c.note}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
            <Link href="/impact" className="text-link label">
              Our impact
            </Link>
            <Link href="/artisans" className="text-link label">
              Meet the artisans
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/** Trust row: only facts the business has confirmed. No returns promise until the policy exists. */
export function TrustRow() {
  const points = [
    { Icon: TapeIcon, title: "Your size", note: "Sizes 8 to 18 in stock. Others made to order in 5 to 7 days." },
    { Icon: QualityIcon, title: "Made by hand", note: "Hand-dyed Adire and handwoven Asooke." },
    { Icon: TruckIcon, title: "Delivered", note: "Across Nigeria, and worldwide by DHL." },
    { Icon: LockIcon, title: "Secure payment", note: "Card, bank transfer or USSD." },
  ];
  return (
    <section aria-label="Why shop with us" className="gutter border-y border-ink/10">
      <ul className="mx-auto grid max-w-[96rem] grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4 md:py-14">
        {points.map(({ Icon, title, note }, i) => (
          <li key={title} className="flex flex-col items-start" data-reveal style={stagger(i)}>
            <Icon size={26} className="text-emerald" />
            <h3 className="mt-4 font-display text-xl">{title}</h3>
            <p className="mt-2 max-w-[26ch] text-base text-pretty text-ink-soft">{note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Reviews: shown only once real approved reviews exist. */
export function Reviews({ count, latest }: { count: number; latest: ReviewCard[] }) {
  if (latest.length === 0) return null;
  return (
    <section className="gutter bg-sand py-16 md:py-24">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeading
          title="In their words"
          action={
            <p className="text-ink-soft">
              from {count} reviews ·{" "}
              <Link href="/reviews" className="text-link">
                Read all
              </Link>
            </p>
          }
        />
        <ul className="grid gap-px bg-ink/10 md:grid-cols-3">
          {latest.map((r, i) => (
            <li key={r.id} className="bg-sand py-8 md:px-8 md:first:pl-0" data-reveal style={stagger(i)}>
              <p className="text-gold" aria-label={`${r.rating} out of 5`}>
                {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
              </p>
              {r.title && <h3 className="mt-3 font-medium">{r.title}</h3>}
              <blockquote className="mt-3 font-editorial text-xl italic">{r.body}</blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Journal: shown only once posts are published. */
export function Journal({ posts }: { posts: JournalCard[] }) {
  if (posts.length === 0) return null;
  const fields = ["bg-sage", "bg-tangerine", "bg-aubergine"];
  return (
    <section className="gutter py-16 md:py-24">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeading
          title="From the studio"
          action={
            <Link href="/journal" className="text-link label">
              Read the journal
            </Link>
          }
        />
        <ul className="grid gap-10 md:grid-cols-3 md:gap-6">
          {posts.map((post, i) => (
            <li key={post.slug} data-reveal style={stagger(i)}>
              <Link href={`/journal/${post.slug}`} className="group block">
                <span className={`${fields[i % 3]} block aspect-[4/3]`} aria-hidden="true" />
                <h3 className="mt-5 font-display text-2xl leading-tight group-hover:underline">{post.title}</h3>
                <p className="mt-2 text-ink-soft">{post.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Newsletter on Adire indigo (the form itself is a client component). */
export function NewsletterSection({ children }: { children: ReactNode }) {
  return (
    <section className="newsletter gutter bg-emerald py-24 text-ivory md:py-36">
      <div className="mx-auto max-w-[60rem] text-center" data-reveal>
        <h2 className="font-display text-5xl leading-[0.95] md:text-8xl">Letters from the studio.</h2>
        <p className="mx-auto mt-6 mb-12 max-w-xl font-editorial text-xl italic md:text-2xl">
          New collections first, and the stories behind the cloth. A few times a season, never more.
        </p>
        {children}
      </div>
    </section>
  );
}

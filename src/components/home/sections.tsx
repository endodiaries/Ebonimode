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

/** What the pieces are made of and how, taken from the brand's own product descriptions. */
const CRAFT = [
  { term: "Hand-dyed Adire", note: "Hand-drawn and hand-dyed, so no two pieces are quite the same." },
  { term: "Handwoven Asooke", note: "Traditional Nigerian weaving, cut into contemporary shapes." },
  { term: "Lagos in every print", note: "Skylines, waterways and landmarks, told in cloth." },
];

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

function SectionHeading({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 md:mb-14" data-reveal>
      <h2 className="font-display text-4xl leading-[1.05] md:text-5xl">{title}</h2>
      {action}
    </div>
  );
}

/** Two large department tiles: Women and Men, side by side. */
export function Departments() {
  const { women, men } = HOME_MEDIA.departments;
  const items = [
    { label: "Women", copy: "Dresses, boubous and pant sets.", href: "/women", link: "Shop women", photo: women },
    { label: "Men", copy: "Linen shirts, Adire and Asooke sets.", href: "/men", link: "Shop men", photo: men },
  ];
  return (
    <section aria-label="Departments" className="gutter py-4 md:py-6">
      <ul className="mx-auto grid max-w-[90rem] grid-cols-2 gap-3 md:gap-6">
        {items.map((it, i) => (
          <li key={it.href} data-reveal style={stagger(i)}>
            <Link href={it.href} className="group relative block aspect-[3/4] overflow-hidden bg-sand text-ivory md:aspect-[5/6]">
              {cloudinaryEnabled && (
                <CldImage
                  publicId={it.photo.publicId}
                  alt={it.photo.alt}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  crop={{ ratio: 1.25, gravity: "auto" }}
                  className="object-cover transition-transform duration-700 ease-entrance group-hover:scale-[1.03]"
                />
              )}
              <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 block p-4 md:p-10">
                <span className="block font-display text-4xl leading-none md:text-7xl">{it.label}</span>
                <span className="mt-3 block font-editorial text-xl italic max-md:hidden">{it.copy}</span>
                <span className="text-link label mt-3 inline-block md:mt-5">{it.link} →</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Collections: one tall colour tile per collection, with a cut-out model on its colour. */
export function Collections({ collections }: { collections: CollectionSummary[] }) {
  if (collections.length === 0) return null;
  return (
    <section className="gutter py-16 md:py-24">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeading
          title="Collections"
          action={
            <Link href="/collections" className="text-link label">
              See all collections →
            </Link>
          }
        />
        <ul className="grid gap-4 md:grid-cols-2 md:gap-6">
          {collections.slice(0, 2).map((c, i) => {
            const tone = readableOn(c.themeHex) === "ink" ? "text-ink" : "text-ivory";
            return (
              <li key={c.id} data-reveal style={stagger(i)}>
                <Link
                  href={`/collections/${c.slug}`}
                  className={`${tone} group relative block h-[30rem] overflow-hidden md:h-[40rem]`}
                  style={{ backgroundColor: c.themeHex }}
                >
                  {c.bannerPublicId && cloudinaryEnabled && (
                    <span className="absolute top-[22%] right-0 bottom-0 w-[62%] transition-transform duration-700 ease-entrance group-hover:scale-[1.03] md:top-[10%] md:w-[58%]">
                      <CldImage
                        publicId={c.bannerPublicId}
                        alt=""
                        sizes="(min-width: 768px) 28rem, 60vw"
                        className="object-contain object-bottom"
                      />
                    </span>
                  )}
                  <span className="relative block max-w-[64%] p-6 md:max-w-[56%] md:p-10">
                    <span className="label block opacity-80">
                      {c.productCount > 0 ? `${c.productCount} pieces` : "Collection"}
                    </span>
                    <span className="mt-4 block font-display text-[1.875rem] leading-[0.95] hyphens-auto md:text-4xl md:text-balance xl:text-5xl" lang="en">{c.name}</span>
                    {/* Phones: the tile is too narrow for the description beside the model. */}
                    {c.description && <span className="mt-5 block font-editorial text-lg italic max-md:hidden md:text-xl">{c.description}</span>}
                    <span className="text-link label mt-6 inline-block">Explore →</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
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
      <ul className="mx-auto grid max-w-[90rem] grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4 md:py-16">
        {points.map(({ Icon, title, note }, i) => (
          <li key={title} className="flex flex-col items-start" data-reveal style={stagger(i)}>
            <Icon size={28} className="text-emerald" />
            <h3 className="label mt-4">{title}</h3>
            <p className="mt-2 max-w-[26ch] text-base text-pretty text-ink-soft">{note}</p>
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
          title="New in"
          action={
            <Link href="/shop" className="text-link label">
              Shop all →
            </Link>
          }
        />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
          {products.map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} index={i} showPrice={false} />
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

/** Our story: the brand story, verbatim, with three craft notes. */
export function OurStory() {
  const { story } = HOME_MEDIA;
  return (
    <section className="gutter py-16 md:py-28">
      <div className="mx-auto grid max-w-[90rem] items-center gap-10 md:grid-cols-2 md:gap-16">
        {cloudinaryEnabled && (
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand md:max-w-[36rem]" data-reveal>
            <CldImage
              publicId={story.publicId}
              alt={story.alt}
              sizes="(min-width: 768px) 34rem, 100vw"
              className="object-cover object-top"
            />
          </div>
        )}
        <div className={cloudinaryEnabled ? "max-w-xl" : "mx-auto max-w-3xl text-center md:col-span-2"} data-reveal>
          <h2 className="font-display text-4xl leading-[1.05] md:text-5xl">Our story</h2>
          <p className="mt-6 font-editorial text-2xl leading-snug italic md:text-3xl md:leading-snug">{BRAND_STORY}</p>
          <dl className="mt-10 grid gap-6 border-t border-ink/15 pt-8 text-left sm:grid-cols-3">
            {CRAFT.map((c) => (
              <div key={c.term}>
                <dt className="label">{c.term}</dt>
                <dd className="mt-2 text-base text-ink-soft">{c.note}</dd>
              </div>
            ))}
          </dl>
          <p className={`mt-10 flex flex-wrap gap-x-10 gap-y-4 ${cloudinaryEnabled ? "" : "justify-center"}`}>
            <Link href="/impact" className="text-link label">
              Our impact →
            </Link>
            <Link href="/artisans" className="text-link label">
              Meet the artisans →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/** 10. Reviews. Until real approved reviews exist, the count and cards are marked placeholders. */
export function Reviews({ count, latest }: { count: number; latest: ReviewCard[] }) {
  const hasReal = latest.length > 0;
  if (!hasReal) return null; // no placeholder reviews on the live page
  return (
    <section className="gutter bg-sand py-16 md:py-24">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeading
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
  if (posts.length === 0) return null; // no placeholder stories on the live page
  const cards: (JournalCard | null)[] = posts.length > 0 ? posts : [null, null, null];
  const fields = ["bg-sage", "bg-tangerine", "bg-aubergine"];
  return (
    <section className="gutter py-16 md:py-24">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeading
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
        <h2 className="font-display text-4xl md:text-5xl">Be first to see each colour story.</h2>
        <p className="mt-4 mb-10 font-editorial text-xl italic">New collections, journal stories and quiet offers.</p>
        {children}
      </div>
    </section>
  );
}

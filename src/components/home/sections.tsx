import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CldImage } from "@/components/brand/CldImage";
import { LockIcon, QualityIcon, TapeIcon, TruckIcon } from "@/components/icons";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { readableOn } from "@/lib/colour";
import type { JournalCard, ProductCardData, ReviewCard } from "@/lib/data/home";
import { HOME_MEDIA } from "@/lib/home-media";
import { ProductMedia } from "@/components/product/ProductCard";
import { BRAND_STORY } from "@/lib/site";
import { ABOUT_STORY } from "@/lib/content/brand";

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
      <h2 className="font-display text-xl md:text-2xl">{title}</h2>
      {action}
    </div>
  );
}

/**
 * Campaign banner: one cut-out model on a lit colour backdrop, the name in spaced
 * capitals in the open space beside her. The whole banner opens the collection.
 */
export function CampaignBanner({
  title,
  kicker,
  note,
  href,
  linkLabel,
  publicId,
  alt,
  field,
  side = "left",
}: {
  title: string;
  kicker?: string;
  note?: string | null;
  href: string;
  linkLabel: string;
  publicId: string | null;
  alt: string;
  field: string;
  side?: "left" | "right";
}) {
  const tone = readableOn(field) === "ink" ? "text-ink" : "text-ivory";
  return (
    <Link
      href={href}
      className={`campaign studio group ${tone}`}
      style={{ "--field": field, "--model-x": side === "left" ? "27%" : "73%" } as CSSProperties}
    >
      {publicId && cloudinaryEnabled && (
        <span className="campaign-model" aria-hidden={alt ? undefined : true}>
          <span className="absolute inset-0" data-reveal="rise">
            <CldImage publicId={publicId} alt={alt} sizes="(min-width: 768px) 30rem, 78vw" className="object-contain object-bottom" />
          </span>
        </span>
      )}
      <span
        className={`absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-10 text-center md:inset-y-0 md:w-1/2 md:justify-center md:pt-0 ${
          side === "left" ? "md:left-1/2" : "md:left-0"
        }`}
      >
        <span data-reveal className="flex flex-col items-center">
          {kicker && <span className="label opacity-85">{kicker}</span>}
          <span className="campaign-title font-display mt-4 block">{title}</span>
          {note && <span className="font-editorial mt-4 block max-w-sm text-lg text-pretty opacity-90 max-md:hidden">{note}</span>}
          <span className="text-link label mt-6 inline-block md:mt-8">{linkLabel}</span>
        </span>
      </span>
    </Link>
  );
}

/** A few words from the brand, in its own voice (the owner's brand story). */
export function Statement() {
  const [first, , third, , last] = ABOUT_STORY.paragraphs;
  return (
    <section className="gutter py-20 text-center md:py-28" aria-label="About Ebonímode">
      <div className="mx-auto max-w-4xl" data-reveal>
        <p className="label text-ink-soft">Ebonímode</p>
        {/* Sentence case: the unlayered .font-display rule would otherwise set it in capitals. */}
        <p className="font-display mt-6 text-3xl leading-snug text-balance md:text-5xl md:leading-[1.2]" style={{ textTransform: "none", letterSpacing: "0.01em" }}>
          {last}
        </p>
        <p className="mx-auto mt-8 max-w-2xl text-pretty text-ink-soft">
          {first} {third}
        </p>
        <Link href="/collections" className="text-link label mt-9 inline-block">
          Explore the collections
        </Link>
      </div>
    </section>
  );
}

/** Shop by category: a tile per category, with how many pieces it holds. */
export function CategoryTiles({ items }: { items: { name: string; slug: string; count: number; cover: ProductCardData }[] }) {
  if (items.length === 0) return null;
  return (
    <section className="gutter py-12 md:py-20">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeading title="Shop by category" />
        <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4">
          {items.map((c, i) => (
            <li key={c.slug} data-reveal style={stagger(i % 4)}>
              <Link href={`/category/${c.slug}`} className="group block">
                <span className="card-studio relative block aspect-[4/5] overflow-hidden">
                  <ProductMedia product={c.cover} sizes="(min-width: 1024px) 24vw, 50vw" />
                </span>
                <span className="label mt-4 block text-ink-soft">
                  {c.count} {c.count === 1 ? "piece" : "pieces"}
                </span>
                <span className="font-display mt-2 block text-lg">{c.name}</span>
                <span className="text-link label mt-3 inline-block">View the category</span>
              </Link>
            </li>
          ))}
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
    { Icon: TruckIcon, title: "Delivered", note: "Lagos in 1 to 3 working days after dispatch, the rest of Nigeria in 2 to 5, worldwide in 5 to 10." },
    { Icon: LockIcon, title: "Secure payment", note: "Card, bank transfer or USSD." },
  ];
  return (
    <section aria-label="Why shop with us" className="gutter border-y border-ink/10">
      <ul className="mx-auto grid max-w-[90rem] grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4 md:py-16">
        {points.map(({ Icon, title, note }, i) => (
          <li key={title} className="flex flex-col items-start" data-reveal style={stagger(i)}>
            <Icon size={26} className="text-ink" />
            <h3 className="label mt-4">{title}</h3>
            <p className="mt-2 max-w-[26ch] text-base text-pretty text-ink-soft">{note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 8. Wrapper for Shop the Look (the interactive part is a client component). */
export function LookSection({ children }: { children: ReactNode }) {
  return (
    <section className="gutter bg-sand py-16 md:py-24">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeading title="Shop the look" />
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
            <span className="absolute inset-x-[6%] top-0 bottom-0">
              <CldImage
                publicId={story.publicId}
                alt={story.alt}
                sizes="(min-width: 768px) 34rem, 100vw"
                // The photo is cropped at the top, so its top edge sits flush with the tile.
                className="object-contain object-top"
              />
            </span>
          </div>
        )}
        <div className={cloudinaryEnabled ? "max-w-xl" : "mx-auto max-w-3xl text-center md:col-span-2"} data-reveal>
          <h2 className="font-display text-xl md:text-2xl">Our story</h2>
          <p className="mt-6 font-editorial text-xl leading-relaxed md:text-2xl md:leading-relaxed">{BRAND_STORY}</p>
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
              Our impact
            </Link>
            <Link href="/about" className="text-link label">
              About us
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
              Read the journal
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
    <section className="gutter bg-sand py-16 text-center md:py-24">
      <div data-reveal>
        <h2 className="font-display text-xl md:text-2xl">Newsletter</h2>
        <p className="mt-4 mb-10 text-ink-soft">Be first to see new collections and stories from the studio.</p>
        {children}
      </div>
    </section>
  );
}

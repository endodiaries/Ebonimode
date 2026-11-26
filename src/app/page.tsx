import { CampaignFilm } from "@/components/home/CampaignFilm";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { ProductRail } from "@/components/home/ProductRail";
import { ShopTheLook } from "@/components/home/ShopTheLook";
import {
  CampaignBanner,
  CategoryTiles,
  Journal,
  LookSection,
  NewsletterSection,
  OurStory,
  Reviews,
  Statement,
  TrustRow,
} from "@/components/home/sections";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { ProductCard } from "@/components/product/ProductCard";
import { BRAND_NAME, BRAND_STORY, siteUrl } from "@/lib/site";
import { HOME_MEDIA } from "@/lib/home-media";
import {
  getCatalogueCards,
  getCollections,
  getFeaturedLook,
  getHeroSlides,
  getJournal,
  getReviews,
  type HeroFigure,
  type HeroSlide,
  type ProductCardData,
} from "@/lib/data/home";

const RAIL_LENGTH = 12;

/** Campaign films by collection slug (Cloudinary video ids). Admin-editable in Phase 7. */
const FILMS: Record<string, { publicId: string; lines: string[] }> = {
  "chronicles-of-africa-eko": {
    publicId: "site/video/campaign-4",
    lines: [
      "Inspired by the movement of Lagos’ waterways, with fluid wave patterns that pay homage to the lagoon and the Atlantic Ocean.",
    ],
  },
};

/** One card per style: the other colourways are a swatch away. */
function onePerStyle(cards: ProductCardData[], skip = new Set<string>()) {
  const seen = new Set<string>();
  return cards.filter((p) => {
    if (skip.has(p.id)) return false;
    const style = p.colourways.length > 1 ? p.colourways.map((c) => c.slug).sort().join("|") : p.id;
    if (seen.has(style)) return false;
    seen.add(style);
    return true;
  });
}

/** One card per style, unless that leaves the row nearly empty: then show every colourway. */
function railCards(cards: ProductCardData[], skip?: Set<string>) {
  const styles = onePerStyle(cards, skip);
  return styles.length >= 4 ? styles : cards.filter((p) => !skip?.has(p.id));
}

const isCutout = (p: ProductCardData) => Boolean(p.image?.publicId.startsWith("site/product-cutouts/"));
function tintFor(hex: string | null): string | null {
  if (!hex || !/^#?[0-9a-f]{6}$/i.test(hex)) return null;
  const n = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 200 ? null : hex;
}
const figure = (p: ProductCardData): HeroFigure => {
  const own = p.colourways.find((c) => c.slug === p.slug);
  return {
    publicId: p.image!.publicId,
    alt: p.image!.alt,
    slug: p.slug,
    name: p.name,
    // Very pale pieces (white linen) would vanish against white; they take the slide colour instead.
    hex: tintFor(own?.hex ?? p.colourHex),
  };
};

/**
 * Who stands on each hero slide: every colourway of the slide's piece (Eko III in green and
 * blue, Eid Luxe in four colours). A piece with one colour is joined by others from its
 * collection; menswear by other men's pieces, so the men's slides show a group. Pieces used
 * on an earlier slide are not repeated.
 */
function withHeroGroups(slides: HeroSlide[], catalogue: ProductCardData[]): HeroSlide[] {
  const used = new Set<string>();
  // Pieces (and their colourways) that have a slide of their own are never borrowed by another slide.
  const reserved = new Set(
    slides.flatMap((s) => {
      const own = catalogue.find((p) => p.id === s.productId);
      return own ? catalogue.filter((p) => own.colourways.some((c) => c.slug === p.slug)).map((p) => p.id).concat(own.id) : [];
    }),
  );
  return slides.map((slide) => {
    const own = catalogue.find((p) => p.id === slide.productId);
    if (!own) return slide;
    const colourways = catalogue.filter((p) => own.colourways.some((c) => c.slug === p.slug) && isCutout(p));
    let group = colourways.length > 1 ? colourways : [own].filter(isCutout);
    if (group.length < 2) {
      const pool = onePerStyle(
        catalogue.filter((p) =>
          p.id !== own.id &&
          !used.has(p.id) &&
          !reserved.has(p.id) &&
          isCutout(p) &&
          (own.department === "men" ? p.department === "men" : p.collections.some((c) => own.collections.includes(c))),
        ),
      );
      group = [...group, ...pool].slice(0, 3);
    }
    // The slide's own piece stands in the middle of the group.
    const others = group.filter((p) => p.id !== own.id).slice(0, 3);
    const ordered = group.some((p) => p.id === own.id) ? [...others.slice(0, Math.ceil(others.length / 2)), own, ...others.slice(Math.ceil(others.length / 2))] : others;
    ordered.forEach((p) => used.add(p.id));
    return { ...slide, group: ordered.map(figure) };
  });
}

const pieces = (n: number) => `${n} ${n === 1 ? "piece" : "pieces"}`;

function Rail({ title, href, linkLabel, cards }: { title: string; href: string; linkLabel: string; cards: ProductCardData[] }) {
  if (cards.length === 0) return null;
  return (
    <ProductRail title={title} href={href} linkLabel={linkLabel}>
      {cards.slice(0, RAIL_LENGTH).map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} index={i} />
        </li>
      ))}
    </ProductRail>
  );
}

/**
 * Homepage, in the rhythm of a fashion house's storefront: the hero, new arrivals,
 * then a campaign banner for each collection (and for menswear) followed by a row
 * of its pieces; categories with counts; the look; the story; trust; newsletter.
 * Reviews and journal appear only once real ones exist. All data comes from cached
 * reads, so the whole page prerenders into the static shell.
 */
export default async function HomePage() {
  const [baseSlides, collections, catalogue, look, reviews, posts] = await Promise.all([
    getHeroSlides(),
    getCollections(),
    getCatalogueCards(),
    getFeaturedLook(),
    getReviews(),
    getJournal(),
  ]);

  const slides = withHeroGroups(baseSlides, catalogue);
  // Pieces already worn in the hero are not repeated in "New arrivals".
  const inHero = new Set(slides.map((s) => s.productId).filter((id): id is string => Boolean(id)));
  const newArrivals = railCards(catalogue, inHero);
  const men = catalogue.filter((p) => p.department === "men");

  // Categories by size, each shown with a cut-out of one of its pieces.
  const byCategory = new Map<string, { name: string; slug: string; count: number; cover: ProductCardData }>();
  for (const p of catalogue) {
    if (!p.category) continue;
    const entry = byCategory.get(p.category.slug);
    if (entry) {
      entry.count += 1;
      if (!entry.cover.image && p.image) entry.cover = p;
    } else {
      byCategory.set(p.category.slug, { ...p.category, count: 1, cover: p });
    }
  }
  const departmentWord = { women: "Women's", men: "Men's", unisex: "Unisex" } as const;
  const top = [...byCategory.values()].sort((a, b) => b.count - a.count).slice(0, 4);
  // Two categories can share a name (men's and women's trousers): say which is which.
  const categories = top.map((c) =>
    [...byCategory.values()].filter((o) => o.name === c.name).length > 1
      ? { ...c, name: `${departmentWord[c.cover.department]} ${c.name.toLowerCase()}` }
      : c,
  );

  const [firstCollection, ...otherCollections] = collections;
  const collectionBlock = (c: (typeof collections)[number], side: "left" | "right") => {
    // Every colourway gets its own card in a collection row (Eko III in blue and in green).
    const cards = catalogue.filter((p) => p.collections.includes(c.slug));
    const film = FILMS[c.slug];
    return (
      <div key={c.id}>
        {film ? (
          <CampaignFilm
            publicId={film.publicId}
            kicker={c.productCount > 0 ? `The film · ${pieces(c.productCount)}` : "The film"}
            title={c.name}
            lines={[...(c.description ? [c.description] : []), ...film.lines]}
            href={`/collections/${c.slug}`}
            linkLabel="Shop the collection"
          />
        ) : (
          <CampaignBanner
            title={c.name}
            kicker={c.productCount > 0 ? pieces(c.productCount) : "Collection"}
            note={c.description}
            href={`/collections/${c.slug}`}
            linkLabel="Shop the collection"
            publicId={c.bannerPublicId}
            alt=""
            field={c.themeHex}
            side={side}
          />
        )}
        <Rail title={c.name} href={`/collections/${c.slug}`} linkLabel="View all" cards={cards} />
      </div>
    );
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: BRAND_NAME,
            url: siteUrl,
            logo: `${siteUrl}/brand/ebonimode-logo.png`,
            description: BRAND_STORY,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <h1 className="sr-only">Ebonímode: Afrocentric modest fashion for women and men</h1>
      <HeroSlideshow slides={slides} />

      <Rail title="Shop new arrivals" href="/shop" linkLabel="Shop all" cards={newArrivals} />

      <Statement />

      {firstCollection && collectionBlock(firstCollection, "left")}

      {men.length > 0 && (
        <div>
          <CampaignBanner
            title="Menswear"
            kicker={pieces(men.length)}
            note="Linen, Adire and Asọ́ọ̀kẹ, cut for the modern man."
            href="/men"
            linkLabel="Shop men"
            publicId={HOME_MEDIA.departments.men.publicId}
            alt=""
            field={HOME_MEDIA.departments.men.field}
            side="right"
          />
          <Rail title="Menswear" href="/men" linkLabel="View all" cards={railCards(men)} />
        </div>
      )}

      {otherCollections.map((c, i) => collectionBlock(c, i % 2 === 0 ? "left" : "right"))}

      <CategoryTiles items={categories} />

      {look && look.hotspots.length > 0 && (
        <LookSection>
          <ShopTheLook look={look} />
        </LookSection>
      )}
      <OurStory />
      <TrustRow />
      <Reviews count={reviews.count} latest={reviews.latest} />
      <Journal posts={posts} />
      <NewsletterSection>
        <NewsletterForm />
      </NewsletterSection>
      <RevealObserver />
    </>
  );
}

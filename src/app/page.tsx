import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { ShopTheLook } from "@/components/home/ShopTheLook";
import {
  BestOf,
  Collections,
  Departments,
  Journal,
  LookSection,
  NewsletterSection,
  OurStory,
  Reviews,
  TrustRow,
} from "@/components/home/sections";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { getBestOf, getCollections, getFeaturedLook, getHeroSlides, getJournal, getReviews } from "@/lib/data/home";

/**
 * Homepage: hero, departments, new in, collections, look, story, trust, newsletter.
 * Reviews and journal appear only once real ones exist. All data comes from cached
 * reads, so the whole page prerenders into the static shell. The announcement bar,
 * header, strata divider and footer live in the root layout.
 */
export default async function HomePage() {
  const [slides, collections, products, look, reviews, posts] = await Promise.all([
    getHeroSlides(),
    getCollections(),
    getBestOf(8),
    getFeaturedLook(),
    getReviews(),
    getJournal(),
  ]);

  return (
    <>
      <h1 className="sr-only">Ebonímode: Afrocentric modest fashion for women and men</h1>
      <HeroSlideshow slides={slides} />
      <Departments />
      <BestOf products={products} />
      <Collections collections={collections} />
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

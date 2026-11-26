import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CldImage } from "@/components/brand/CldImage";
import { ListingShell } from "@/components/shop/ListingShell";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { readableOn } from "@/lib/colour";
import { getCatalogueCards, getCollections } from "@/lib/data/home";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const [collections, cards] = await Promise.all([getCollections(), getCatalogueCards()]);
  const collection = collections.find((c) => c.slug === slug);
  return collection ? { collection, products: cards.filter((p) => p.collections.includes(slug)) } : null;
}

export async function generateStaticParams() {
  const slugs = (await getCollections()).map((c) => c.slug);
  return (slugs.length > 0 ? slugs : ["_"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: "Collection not found" };
  return { title: data.collection.name, description: data.collection.description ?? undefined, alternates: { canonical: `/collections/${slug}` } };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { collection: c, products } = data;
  const tone = readableOn(c.themeHex) === "ink" ? "text-ink" : "text-ivory";
  return (
    <ListingShell
      crumbs={[{ label: "Collections", href: "/collections" }, { label: c.name }]}
      title={c.name}
      products={products}
      banner={
        <header className={`${tone} gutter relative overflow-hidden`} style={{ backgroundColor: c.themeHex }}>
          <div className="mx-auto grid max-w-[90rem] md:grid-cols-2">
            <div className="py-14 md:py-24">
              <p className="label opacity-80">Collection · {products.length} pieces</p>
              <h1 className="mt-4 font-display text-3xl leading-[1.12] text-balance md:text-5xl">{c.name}</h1>
              {c.description && <p className="mt-6 max-w-md font-editorial text-xl italic md:text-2xl">{c.description}</p>}
            </div>
            {c.bannerPublicId && cloudinaryEnabled && (
              <div className="relative h-72 md:h-auto">
                <span className="absolute inset-x-0 top-[6%] bottom-0">
                  <CldImage publicId={c.bannerPublicId} alt="" sizes="(min-width: 768px) 30rem, 80vw" priority className="object-contain object-bottom" />
                </span>
              </div>
            )}
          </div>
        </header>
      }
    />
  );
}

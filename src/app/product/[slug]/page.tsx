import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BuyBox } from "@/components/product/BuyBox";
import { Gallery } from "@/components/product/Gallery";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { ProductCard } from "@/components/product/ProductCard";
import { cldImage, cloudinaryEnabled } from "@/lib/cloudinary";
import { getProduct, getProductSlugs } from "@/lib/data/product";
import { formatPrice, PRICE_PLACEHOLDER } from "@/lib/price";
import { BRAND_NAME, siteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

const DEPARTMENT: Record<string, { label: string; href: string }> = {
  women: { label: "Women", href: "/women" },
  men: { label: "Men", href: "/men" },
  unisex: { label: "Shop all", href: "/shop" },
};

/** Every published piece is prerendered; new ones are built on first visit. */
export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return (slugs.length > 0 ? slugs : ["_"]).map((slug) => ({ slug }));
}

const firstParagraph = (text: string | null) => text?.split(/\n\s*\n/)[0]?.trim() ?? "";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Piece not found" };
  const description = firstParagraph(product.description).slice(0, 160) || `${product.card.name} by ${BRAND_NAME}.`;
  const photo = product.images.find((i) => !i.publicId.startsWith("site/")) ?? product.images[0];
  const image = photo && cloudinaryEnabled ? cldImage(photo.publicId, { width: 1200, height: 630, crop: "fill", gravity: "auto" }) : undefined;
  return {
    title: product.card.name,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: { title: product.card.name, description, url: `/product/${slug}`, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const { card, description, fabricCare, images, sizeGuide, related } = product;
  const dept = DEPARTMENT[card.department];
  const price = formatPrice(card.priceNgn, card.tags);
  const priced = price !== PRICE_PLACEHOLDER;
  const paragraphs = description?.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) ?? [];
  const inStock = card.sizes.some((s) => s.stock > 0);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: card.name,
      description: firstParagraph(description) || undefined,
      brand: { "@type": "Brand", name: BRAND_NAME },
      image: cloudinaryEnabled ? images.slice(0, 4).map((i) => cldImage(i.publicId, { width: 1200 })) : undefined,
      url: `${siteUrl}/product/${card.slug}`,
      ...(priced && {
        offers: {
          "@type": "Offer",
          price: card.priceNgn,
          priceCurrency: "NGN",
          availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: `${siteUrl}/product/${card.slug}`,
        },
      }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: dept.label, item: `${siteUrl}${dept.href}` },
        { "@type": "ListItem", position: 3, name: card.name },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="gutter pt-6 pb-24 md:pt-10 md:pb-28">
        <div className="mx-auto max-w-[90rem]">
          <nav aria-label="Breadcrumb">
            <ol className="label flex flex-wrap gap-x-2 gap-y-1 text-ink-soft">
              <li>
                <Link href="/" className="hover:text-ink">
                  Home
                </Link>
                <span aria-hidden="true"> /</span>
              </li>
              <li>
                <Link href={dept.href} className="hover:text-ink">
                  {dept.label}
                </Link>
                <span aria-hidden="true"> /</span>
              </li>
              <li aria-current="page" className="text-ink">
                {card.name}
              </li>
            </ol>
          </nav>

          <div className="mt-6 grid gap-10 md:mt-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-14 lg:gap-20">
            <Gallery images={images} />

            <div className="md:sticky md:top-28 md:self-start">
              <h1 className="font-display text-4xl leading-[0.98] text-balance md:text-5xl">{card.name}</h1>
              <p className="mt-4 text-2xl font-semibold">{price}</p>

              {card.colourways.length > 1 && (
                <div className="mt-8">
                  <p className="label">Colour: {card.colourways.find((c) => c.slug === card.slug)?.colour}</p>
                  <ul className="mt-3 flex gap-2">
                    {card.colourways.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/product/${c.slug}`}
                          aria-label={c.colour}
                          aria-current={c.slug === card.slug ? "true" : undefined}
                          className="block h-10 w-10 border border-ink/20 p-1 aria-[current=true]:border-ink"
                        >
                          <span className="block h-full w-full" style={{ backgroundColor: c.hex ?? "transparent" }} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8">
                <Suspense fallback={<div className="h-40" />}>
                  <BuyBox product={card} price={price} sizeGuide={sizeGuide} />
                </Suspense>
              </div>

              {paragraphs.length > 0 && (
                <div className="mt-10 space-y-4 border-t border-ink/15 pt-8">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}

              {fabricCare && (
                <details className="group mt-8 border-y border-ink/15">
                  <summary className="label flex cursor-pointer list-none items-center justify-between py-5">
                    Fabric and care
                    <span aria-hidden="true" className="text-xl leading-none group-open:hidden">
                      +
                    </span>
                    <span aria-hidden="true" className="hidden text-xl leading-none group-open:inline">
                      −
                    </span>
                  </summary>
                  <p className="pb-6">{fabricCare}</p>
                </details>
              )}
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-20 md:mt-28">
              <h2 className="font-display text-3xl md:text-4xl">You may also like</h2>
              <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
                {related.map((p, i) => (
                  <li key={p.id}>
                    <ProductCard product={p} index={i} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      <RevealObserver />
    </>
  );
}

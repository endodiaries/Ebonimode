import type { Metadata } from "next";
import Link from "next/link";
import { CldImage } from "@/components/brand/CldImage";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { readableOn } from "@/lib/colour";
import { getCollections } from "@/lib/data/home";

export const metadata: Metadata = {
  title: "Collections",
  description: "The Ebonímode collections: Chronicles of Africa: Eko, Eid Luxe and more.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const collections = await getCollections();
  return (
    <div className="gutter pt-6 pb-24 md:pt-10">
      <div className="mx-auto max-w-[90rem]">
        <h1 className="font-display text-5xl leading-[0.95] md:text-7xl">Collections</h1>
        <ul className="mt-8 grid gap-4 md:mt-12 md:grid-cols-2 md:gap-6">
          {collections.map((c, i) => {
            const tone = readableOn(c.themeHex) === "ink" ? "text-ink" : "text-ivory";
            return (
              <li key={c.id} data-reveal style={{ "--i": i } as React.CSSProperties}>
                <Link
                  href={`/collections/${c.slug}`}
                  className={`${tone} group relative block h-[30rem] overflow-hidden md:h-[40rem]`}
                  style={{ backgroundColor: c.themeHex }}
                >
                  {c.bannerPublicId && cloudinaryEnabled && (
                    <span className="absolute top-[22%] right-0 bottom-0 w-[62%] transition-transform duration-700 ease-entrance group-hover:scale-[1.03] md:top-[10%] md:w-[58%]">
                      <CldImage publicId={c.bannerPublicId} alt="" sizes="(min-width: 768px) 28rem, 60vw" className="object-contain object-bottom" />
                    </span>
                  )}
                  <span className="relative block max-w-[62%] p-6 md:max-w-[52%] md:p-10">
                    <span className="label block opacity-80">{c.productCount} pieces</span>
                    <span className="mt-4 block font-display text-4xl leading-[0.95] text-balance md:text-6xl">{c.name}</span>
                    {c.description && <span className="mt-5 block font-editorial text-lg italic md:text-xl">{c.description}</span>}
                    <span className="text-link label mt-6 inline-block">Explore →</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <RevealObserver />
    </div>
  );
}

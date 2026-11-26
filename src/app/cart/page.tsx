import type { Metadata } from "next";
import { BagView } from "@/components/shop/BagView";
import { getCatalogueCards } from "@/lib/data/home";

export const metadata: Metadata = { title: "Your bag", robots: { index: false, follow: false } };

export default async function CartPage() {
  const products = await getCatalogueCards();
  return (
    <div className="gutter pt-8 pb-24 md:pt-14">
      <div className="mx-auto max-w-[90rem]">
        <h1 className="mb-8 font-display text-3xl md:mb-12 md:text-5xl">Your bag</h1>
        <BagView products={products} />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { WishlistView } from "@/components/shop/WishlistView";
import { getCatalogueCards } from "@/lib/data/home";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false, follow: false } };

export default async function WishlistPage() {
  const products = await getCatalogueCards();
  return (
    <div className="gutter pt-8 pb-24 md:pt-14">
      <div className="mx-auto max-w-[90rem]">
        <h1 className="font-display text-3xl md:text-5xl">Wishlist</h1>
        <p className="mt-4 mb-10 max-w-2xl font-editorial text-xl italic">Saved on this device. Sign in to keep it on every device.</p>
        <WishlistView products={products} />
      </div>
    </div>
  );
}

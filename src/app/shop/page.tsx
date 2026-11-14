import type { Metadata } from "next";
import { ListingShell } from "@/components/shop/ListingShell";
import { getCatalogueCards } from "@/lib/data/home";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Every Ebonímode piece for women and men, in one place.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  return <ListingShell crumbs={[{ label: "Shop all" }]} title="Shop all" intro="Every piece, for women and men." products={await getCatalogueCards()} />;
}

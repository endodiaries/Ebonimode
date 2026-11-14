import type { Metadata } from "next";
import { ListingShell } from "@/components/shop/ListingShell";
import { getCatalogueCards } from "@/lib/data/home";

export const metadata: Metadata = {
  title: "Men",
  description: "Ebonímode menswear: linen shirts and sets, hand-dyed Adire shirts and Asooke trousers.",
  alternates: { canonical: "/men" },
};

export default async function MenPage() {
  const products = (await getCatalogueCards()).filter((p) => p.department !== "women");
  return (
    <ListingShell
      crumbs={[{ label: "Men" }]}
      title="Men"
      intro="Linen shirts and sets, hand-dyed Adire and handwoven Asooke."
      products={products}
      hide={["department"]}
    />
  );
}

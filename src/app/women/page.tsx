import type { Metadata } from "next";
import { ListingShell } from "@/components/shop/ListingShell";
import { getCatalogueCards } from "@/lib/data/home";

export const metadata: Metadata = {
  title: "Women",
  description: "Ebonímode womenswear: hand-dyed Adire dresses, boubous, pant sets and Asooke pieces.",
  alternates: { canonical: "/women" },
};

export default async function WomenPage() {
  const products = (await getCatalogueCards()).filter((p) => p.department !== "men");
  return (
    <ListingShell
      crumbs={[{ label: "Women" }]}
      title="Women"
      intro="Dresses, boubous and pant sets in hand-dyed Adire, silk and Asooke."
      products={products}
      hide={["department"]}
    />
  );
}

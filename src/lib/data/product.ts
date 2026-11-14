import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { getCatalogueCards, type ProductCardData } from "./home";

export type SizeGuide = { name: string; unit: string; columns: string[]; rows: (string | null)[][]; notes: string | null };

export type ProductDetail = {
  card: ProductCardData;
  description: string | null;
  fabricCare: string | null;
  images: { publicId: string; alt: string }[];
  sizeGuide: SizeGuide | null;
  related: ProductCardData[];
};

export async function getProductSlugs(): Promise<string[]> {
  return (await getCatalogueCards()).map((c) => c.slug);
}

/** Everything the product page needs, or null if the piece is not published. */
export async function getProduct(slug: string): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const cards = await getCatalogueCards();
  const card = cards.find((c) => c.slug === slug);
  if (!card) return null;
  try {
    const db = createPublicClient();
    const [detail, guide] = await Promise.all([
      db
        .from("products")
        .select("description,fabric_care,product_images(cloudinary_public_id,alt,sort_order)")
        .eq("id", card.id)
        .single(),
      // Unisex pieces have no chart of their own yet.
      db.from("size_guides").select("name,unit,table_data,notes").eq("department", card.department).order("sort_order").limit(1).maybeSingle(),
    ]);
    if (detail.error) throw detail.error;
    type Row = {
      description: string | null;
      fabric_care: string | null;
      product_images: { cloudinary_public_id: string; alt: string | null; sort_order: number }[];
    };
    const row = detail.data as unknown as Row;
    type GuideRow = { name: string; unit: string; table_data: { columns: string[]; rows: (string | null)[][] }; notes: string | null };
    const g = guide.data as unknown as GuideRow | null;
    const sameStyle = new Set(card.colourways.map((c) => c.slug));
    return {
      card,
      description: row.description,
      fabricCare: row.fabric_care,
      images: [...row.product_images]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => ({ publicId: i.cloudinary_public_id, alt: i.alt ?? card.name }))
        // The card cut-out and the first gallery photo can be the same image: show it once.
        .filter((img, n, list) => list.findIndex((o) => o.publicId === img.publicId) === n),
      sizeGuide: g ? { name: g.name, unit: g.unit, columns: g.table_data.columns, rows: g.table_data.rows, notes: g.notes } : null,
      related: cards.filter((c) => c.department === card.department && !sameStyle.has(c.slug)).slice(0, 4),
    };
  } catch (e) {
    console.error("getProduct failed", e);
    return null;
  }
}

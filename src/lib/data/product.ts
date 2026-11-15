import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { getCatalogueCards, type ProductCardData } from "./home";

export type SizeGuide = { name: string; unit: string; columns: string[]; rows: (string | null)[][]; notes: string | null };

export type ProductDetail = {
  card: ProductCardData;
  description: string | null;
  fabricCare: string | null;
  details: string[];
  occasions: string[];
  fabric: string | null;
  fabricWeight: string | null;
  lining: string | null;
  care: string[];
  images: { publicId: string; alt: string }[];
  sizeGuide: SizeGuide | null;
  related: ProductCardData[];
  /** Other pieces photographed with this one (from the lookbook). */
  pairsWith: ProductCardData[];
  rating: { average: number; count: number };
  reviews: Review[];
};

export type Review = { id: string; rating: number; title: string | null; body: string | null; createdAt: string; reply: string | null };

export async function getProductSlugs(): Promise<string[]> {
  return (await getCatalogueCards()).map((c) => c.slug);
}

/** Everything the product page needs, or null if the piece is not published. */
export async function getProduct(slug: string): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", "reviews", "looks");
  const cards = await getCatalogueCards();
  const card = cards.find((c) => c.slug === slug);
  if (!card) return null;
  try {
    const db = createPublicClient();
    const [detail, guide] = await Promise.all([
      db
        .from("products")
        .select("description,fabric_care,details,occasions,fabric,fabric_weight,lining,care,avg_rating,review_count,product_images(cloudinary_public_id,alt,sort_order)")
        .eq("id", card.id)
        .single(),
      // Unisex pieces have no chart of their own yet.
      db.from("size_guides").select("name,unit,table_data,notes").eq("department", card.department).order("sort_order").limit(1).maybeSingle(),
    ]);
    if (detail.error) throw detail.error;
    type Row = {
      description: string | null;
      fabric_care: string | null;
      details: string[] | null;
      occasions: string[] | null;
      fabric: string | null;
      fabric_weight: string | null;
      lining: string | null;
      care: string[] | null;
      avg_rating: number;
      review_count: number;
      product_images: { cloudinary_public_id: string; alt: string | null; sort_order: number }[];
    };
    const row = detail.data as unknown as Row;
    type GuideRow = { name: string; unit: string; table_data: { columns: string[]; rows: (string | null)[][] }; notes: string | null };
    const g = guide.data as unknown as GuideRow | null;
    // Pieces that share a published look with this one.
    const mine = await db.from("look_hotspots").select("look_id").eq("product_id", card.id);
    const lookIds = (mine.data ?? []).map((h) => h.look_id as string);
    const others = lookIds.length ? await db.from("look_hotspots").select("product_id").in("look_id", lookIds).neq("product_id", card.id) : { data: [] };
    const pairIds = new Set((others.data ?? []).map((h) => h.product_id as string));
    const approved = await db
      .from("reviews")
      .select("id,rating,title,body,created_at,admin_reply")
      .eq("product_id", card.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(20);
    type ReviewRow = { id: string; rating: number; title: string | null; body: string | null; created_at: string; admin_reply: string | null };
    const sameStyle = new Set(card.colourways.map((c) => c.slug));
    return {
      card,
      description: row.description,
      fabricCare: row.fabric_care,
      details: row.details ?? [],
      occasions: row.occasions ?? [],
      fabric: row.fabric,
      fabricWeight: row.fabric_weight,
      lining: row.lining,
      care: row.care ?? [],
      images: [...row.product_images]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => ({ publicId: i.cloudinary_public_id, alt: i.alt ?? card.name }))
        // The card cut-out and the first gallery photo can be the same image: show it once.
        .filter((img, n, list) => list.findIndex((o) => o.publicId === img.publicId) === n),
      sizeGuide: g ? { name: g.name, unit: g.unit, columns: g.table_data.columns, rows: g.table_data.rows, notes: g.notes } : null,
      // Another colour of the same style is not a pairing.
      pairsWith: cards.filter((c) => pairIds.has(c.id) && !sameStyle.has(c.slug)),
      related: cards.filter((c) => c.department === card.department && !sameStyle.has(c.slug) && !pairIds.has(c.id)).slice(0, 4),
      rating: { average: Number(row.avg_rating) || 0, count: row.review_count ?? 0 },
      reviews: ((approved.data ?? []) as ReviewRow[]).map((r) => ({ id: r.id, rating: r.rating, title: r.title, body: r.body, createdAt: r.created_at, reply: r.admin_reply })),
    };
  } catch (e) {
    console.error("getProduct failed", e);
    return null;
  }
}

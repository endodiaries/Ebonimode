import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

/* Cached reads for the homepage and header. Every function fails soft: if the database
   cannot be reached the page still renders, just without that section's data. */

export type HeroSlide = {
  id: string;
  bgHex: string;
  printKey: "a" | "b" | "c";
  model: string;
  modelAlt: string;
  tagline: string;
  storyName: string;
};

export type CollectionSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  themeHex: string;
  bannerPublicId: string | null;
  productCount: number;
};

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  department: "women" | "men" | "unisex";
  priceNgn: number;
  tags: string[];
  colourHex: string | null;
  image: { publicId: string; alt: string } | null;
  sizes: { size: string; stock: number }[];
  /** Same style in other colours (includes this one), for the swatches. */
  colourways: { slug: string; colour: string; hex: string | null }[];
};

export type LookData = {
  title: string;
  slug: string;
  image: string;
  themeHex: string | null;
  hotspots: { id: string; x: number; y: number; product: ProductCardData }[];
};

export type MenuData = {
  categories: { name: string; slug: string; department: "women" | "men" | "unisex" | null }[];
  colours: { department: "women" | "men"; families: string[] }[];
  collections: { name: string; slug: string; themeHex: string }[];
};

type VariantRow = { size: string | null; stock: number; colour: string | null; colour_hex: string | null };
type ProductRow = {
  id: string;
  name: string;
  slug: string;
  department: ProductCardData["department"];
  price_ngn: number;
  tags: string[];
  is_featured: boolean;
  colour_family: string | null;
  colourway_group_id: string | null;
  created_at: string;
  product_variants: VariantRow[];
  product_images: { cloudinary_public_id: string; alt: string | null; sort_order: number }[];
};

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
const bySize = (a: { size: string }, b: { size: string }) => {
  const [i, j] = [SIZE_ORDER.indexOf(a.size), SIZE_ORDER.indexOf(b.size)];
  return (i < 0 ? 99 : i) - (j < 0 ? 99 : j) || a.size.localeCompare(b.size);
};

async function fetchProducts(): Promise<ProductRow[]> {
  const { data, error } = await createPublicClient()
    .from("products")
    .select(
      "id,name,slug,department,price_ngn,tags,is_featured,colour_family,colourway_group_id,created_at," +
        "product_variants(size,stock,colour,colour_hex),product_images(cloudinary_public_id,alt,sort_order)",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ProductRow[];
}

function toCard(p: ProductRow, all: ProductRow[]): ProductCardData {
  const image = [...p.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
  const group = p.colourway_group_id ? all.filter((o) => o.colourway_group_id === p.colourway_group_id) : [p];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    department: p.department,
    priceNgn: Number(p.price_ngn),
    tags: p.tags,
    colourHex: p.product_variants[0]?.colour_hex ?? null,
    image: image ? { publicId: image.cloudinary_public_id, alt: image.alt ?? p.name } : null,
    sizes: p.product_variants
      .filter((v): v is VariantRow & { size: string } => Boolean(v.size))
      .map((v) => ({ size: v.size, stock: v.stock }))
      .sort(bySize),
    colourways: group.map((o) => ({
      slug: o.slug,
      colour: o.product_variants[0]?.colour ?? o.name,
      hex: o.product_variants[0]?.colour_hex ?? null,
    })),
  };
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("hero-slides");
  try {
    const { data, error } = await createPublicClient()
      .from("hero_slides")
      .select("id,bg_hex,print_key,model_public_id,model_alt,tagline,story_name,collections(name)")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    type Row = {
      id: string;
      bg_hex: string;
      print_key: HeroSlide["printKey"];
      model_public_id: string;
      model_alt: string | null;
      tagline: string | null;
      story_name: string | null;
      collections: { name: string } | null;
    };
    return ((data ?? []) as unknown as Row[]).slice(0, 5).map((r) => ({
      id: r.id,
      bgHex: r.bg_hex,
      printKey: r.print_key,
      model: r.model_public_id,
      modelAlt: r.model_alt ?? "",
      tagline: r.tagline ?? "",
      storyName: r.story_name ?? r.collections?.name ?? "",
    }));
  } catch (e) {
    console.error("getHeroSlides failed", e);
    return [];
  }
}

export async function getCollections(): Promise<CollectionSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("collections");
  try {
    const { data, error } = await createPublicClient()
      .from("collections")
      .select("id,name,slug,description,theme_hex,banner_public_id,product_collections(products(status))")
      .eq("is_published", true)
      .order("sort_order");
    if (error) throw error;
    type Row = {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      theme_hex: string | null;
      banner_public_id: string | null;
      product_collections: { products: { status: string } | null }[];
    };
    return ((data ?? []) as unknown as Row[]).map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      themeHex: r.theme_hex ?? "#EFE6D8",
      bannerPublicId: r.banner_public_id,
      // Only published pieces count; drafts stay hidden from shoppers.
      productCount: r.product_collections.filter((l) => l.products?.status === "published").length,
    }));
  } catch (e) {
    console.error("getCollections failed", e);
    return [];
  }
}

/** Featured products first, topped up with the newest, for the "Best of" grid. */
export async function getBestOf(limit = 8): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  try {
    const all = await fetchProducts();
    const picked = [...all.filter((p) => p.is_featured), ...all.filter((p) => !p.is_featured)].slice(0, limit);
    return picked.map((p) => toCard(p, all));
  } catch (e) {
    console.error("getBestOf failed", e);
    return [];
  }
}

export async function getDepartmentCounts(): Promise<{ women: number; men: number; total: number }> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  try {
    const all = await fetchProducts();
    return {
      women: all.filter((p) => p.department !== "men").length,
      men: all.filter((p) => p.department !== "women").length,
      total: all.length,
    };
  } catch {
    return { women: 0, men: 0, total: 0 };
  }
}

export async function getFeaturedLook(): Promise<LookData | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("looks", "products");
  try {
    const { data, error } = await createPublicClient()
      .from("looks")
      .select("title,slug,image_public_id,collections(theme_hex),look_hotspots(id,x_pct,y_pct,sort_order,product_id)")
      .eq("is_published", true)
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    type Row = {
      title: string;
      slug: string;
      image_public_id: string;
      collections: { theme_hex: string | null } | null;
      look_hotspots: { id: string; x_pct: number; y_pct: number; sort_order: number; product_id: string }[];
    };
    const look = data as unknown as Row;
    const all = await fetchProducts();
    return {
      title: look.title,
      slug: look.slug,
      image: look.image_public_id,
      themeHex: look.collections?.theme_hex ?? null,
      hotspots: [...look.look_hotspots]
        .sort((a, b) => a.sort_order - b.sort_order)
        .flatMap((h) => {
          const p = all.find((o) => o.id === h.product_id);
          return p ? [{ id: h.id, x: Number(h.x_pct), y: Number(h.y_pct), product: toCard(p, all) }] : [];
        }),
    };
  } catch (e) {
    console.error("getFeaturedLook failed", e);
    return null;
  }
}

export type ReviewCard = { id: string; rating: number; title: string | null; body: string | null };

export async function getReviews(): Promise<{ count: number; latest: ReviewCard[] }> {
  "use cache";
  cacheLife("hours");
  cacheTag("reviews");
  try {
    const { data, count, error } = await createPublicClient()
      .from("reviews")
      .select("id,rating,title,body", { count: "exact" })
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(3);
    if (error) throw error;
    return { count: count ?? 0, latest: (data ?? []) as ReviewCard[] };
  } catch {
    return { count: 0, latest: [] };
  }
}

export type JournalCard = { title: string; slug: string; excerpt: string | null; cover: string | null };

export async function getJournal(): Promise<JournalCard[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("journal");
  try {
    const { data, error } = await createPublicClient()
      .from("blog_posts")
      .select("title,slug,excerpt,cover_public_id")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3);
    if (error) throw error;
    type Row = { title: string; slug: string; excerpt: string | null; cover_public_id: string | null };
    return ((data ?? []) as Row[]).map((r) => ({ title: r.title, slug: r.slug, excerpt: r.excerpt, cover: r.cover_public_id }));
  } catch {
    return [];
  }
}

export async function getMenuData(): Promise<MenuData> {
  "use cache";
  cacheLife("hours");
  cacheTag("menu", "products", "collections");
  try {
    const db = createPublicClient();
    const [cats, all, collections] = await Promise.all([
      db.from("categories").select("name,slug,department").eq("show_in_menu", true).order("sort_order"),
      fetchProducts(),
      getCollections(),
    ]);
    if (cats.error) throw cats.error;
    const families = (dept: "women" | "men") => [
      ...new Set(
        all
          .filter((p) => p.department === dept || p.department === "unisex")
          .map((p) => p.colour_family)
          .filter((f): f is string => Boolean(f)),
      ),
    ];
    return {
      categories: (cats.data ?? []) as MenuData["categories"],
      colours: [
        { department: "women", families: families("women") },
        { department: "men", families: families("men") },
      ],
      collections: collections.map((c) => ({ name: c.name, slug: c.slug, themeHex: c.themeHex })),
    };
  } catch (e) {
    console.error("getMenuData failed", e);
    return { categories: [], colours: [], collections: [] };
  }
}

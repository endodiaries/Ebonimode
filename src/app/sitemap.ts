import type { MetadataRoute } from "next";
import { getCatalogueCards, getCollections } from "@/lib/data/home";
import { siteUrl } from "@/lib/site";

/** Every page that exists today. Add content pages here as they are built. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cards, collections] = await Promise.all([getCatalogueCards(), getCollections()]);
  const categories = [...new Set(cards.flatMap((p) => (p.category ? [p.category.slug] : [])))];
  const page = (path: string, priority: number, lastModified?: string) => ({ url: `${siteUrl}${path}`, priority, lastModified });
  return [
    page("", 1),
    page("/women", 0.9),
    page("/men", 0.9),
    page("/shop", 0.8),
    page("/collections", 0.8),
    ...collections.map((c) => page(`/collections/${c.slug}`, 0.8)),
    ...categories.map((slug) => page(`/category/${slug}`, 0.7)),
    ...cards.map((p) => page(`/product/${p.slug}`, 0.6, p.createdAt)),
  ];
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingShell } from "@/components/shop/ListingShell";
import { getCatalogueCards } from "@/lib/data/home";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const products = (await getCatalogueCards()).filter((p) => p.category?.slug === slug);
  return products.length > 0 ? { products, name: products[0].category!.name } : null;
}

export async function generateStaticParams() {
  const slugs = [...new Set((await getCatalogueCards()).flatMap((p) => (p.category ? [p.category.slug] : [])))];
  return (slugs.length > 0 ? slugs : ["_"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: "Category not found" };
  return { title: data.name, description: `${data.name} by Ebonímode.`, alternates: { canonical: `/category/${slug}` } };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  return <ListingShell crumbs={[{ label: "Shop all", href: "/shop" }, { label: data.name }]} title={data.name} products={data.products} hide={["category"]} />;
}

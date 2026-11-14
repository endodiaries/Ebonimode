import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "@/components/shop/SearchResults";
import { getCatalogueCards } from "@/lib/data/home";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true }, alternates: { canonical: "/search" } };

export default async function SearchPage() {
  const products = await getCatalogueCards();
  return (
    <div className="gutter pt-8 pb-24 md:pt-14">
      <div className="mx-auto max-w-[90rem]">
        <h1 className="sr-only">Search</h1>
        <Suspense fallback={<div className="min-h-[50vh]" />}>
          <SearchResults products={products} />
        </Suspense>
      </div>
    </div>
  );
}

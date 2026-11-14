import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import type { ProductCardData } from "@/lib/data/home";
import { siteUrl } from "@/lib/site";
import { ProductListing } from "./ProductListing";

type Crumb = { label: string; href?: string };

/** Shared frame for every product listing: breadcrumbs, heading, intro, then the filterable grid. */
export function ListingShell({
  crumbs,
  title,
  intro,
  products,
  hide,
  banner,
}: {
  crumbs: Crumb[];
  title: string;
  intro?: string | null;
  products: ProductCardData[];
  hide?: Parameters<typeof ProductListing>[0]["hide"];
  banner?: ReactNode;
}) {
  const trail = [{ label: "Home", href: "/" }, ...crumbs];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${siteUrl}${c.href === "/" ? "" : c.href}` } : {}),
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {banner}
      <div className="gutter pt-6 pb-24 md:pt-10">
        <div className="mx-auto max-w-[90rem]">
          <nav aria-label="Breadcrumb">
            <ol className="label flex flex-wrap gap-x-2 gap-y-1 text-ink-soft">
              {trail.map((c, i) => (
                <li key={c.label} aria-current={i === trail.length - 1 ? "page" : undefined} className={i === trail.length - 1 ? "text-ink" : ""}>
                  {c.href && i < trail.length - 1 ? (
                    <>
                      <Link href={c.href} className="hover:text-ink">
                        {c.label}
                      </Link>
                      <span aria-hidden="true"> /</span>
                    </>
                  ) : (
                    c.label
                  )}
                </li>
              ))}
            </ol>
          </nav>
          {!banner && (
            <header className="mt-6 mb-8 md:mt-10 md:mb-12">
              <h1 className="font-display text-5xl leading-[0.95] md:text-7xl">{title}</h1>
              {intro && <p className="mt-4 max-w-2xl font-editorial text-xl italic md:text-2xl">{intro}</p>}
            </header>
          )}
          {banner && <div className="h-6" />}
          <Suspense fallback={<div className="min-h-[60vh]" />}>
            <ProductListing products={products} hide={hide} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

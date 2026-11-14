"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCardData } from "@/lib/data/home";

type GroupKey = "department" | "category" | "colour" | "size" | "price" | "sleeve" | "stock";
type Option = { value: string; label: string };

const PRICE_BANDS: (Option & { min: number; max: number })[] = [
  { value: "under-150", label: "Under ₦150,000", min: 1, max: 149_999 },
  { value: "150-250", label: "₦150,000 to ₦250,000", min: 150_000, max: 250_000 },
  { value: "over-250", label: "Over ₦250,000", min: 250_001, max: Infinity },
];
const SORTS: Option[] = [
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];
const PAGE = 24;
const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
const priced = (p: ProductCardData) => !p.tags.includes("price-pending") && !p.tags.includes("sample");

/** The values a product has for each filter group. */
function valuesOf(p: ProductCardData, key: GroupKey): string[] {
  switch (key) {
    case "department":
      return p.department === "unisex" ? ["women", "men"] : [p.department];
    case "category":
      return p.category ? [p.category.slug] : [];
    case "colour":
      return p.colourFamily ? [p.colourFamily] : [];
    case "size":
      return p.sizes.filter((s) => s.stock > 0).map((s) => s.size);
    case "price":
      return priced(p) ? PRICE_BANDS.filter((b) => p.priceNgn >= b.min && p.priceNgn <= b.max).map((b) => b.value) : [];
    case "sleeve":
      return p.sleeve ? [p.sleeve] : [];
    case "stock":
      return p.sizes.some((s) => s.stock > 0) ? ["in"] : [];
  }
}

/**
 * Product grid with filters, sorting and "load more". The catalogue is small, so the page
 * ships every card and filters in the browser; the choices live in the address bar, so a
 * filtered view can be shared and survives the back button.
 */
export function ProductListing({ products, hide = [] }: { products: ProductCardData[]; hide?: GroupKey[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [shown, setShown] = useState(PAGE);

  const groups = useMemo(() => {
    const uniq = (key: GroupKey) => [...new Set(products.flatMap((p) => valuesOf(p, key)))];
    const sizeRank = (v: string) => (/^\d+$/.test(v) ? Number(v) : 100 + ["XS", "S", "M", "L", "XL", "XXL", "XXXL"].indexOf(v));
    const all: { key: GroupKey; label: string; options: Option[] }[] = [
      { key: "department", label: "Department", options: uniq("department").sort().reverse().map((v) => ({ value: v, label: title(v) })) },
      {
        key: "category",
        label: "Category",
        options: uniq("category")
          .map((v) => ({ value: v, label: products.find((p) => p.category?.slug === v)?.category?.name ?? title(v) }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      },
      { key: "colour", label: "Colour", options: uniq("colour").sort().map((v) => ({ value: v, label: title(v) })) },
      { key: "size", label: "Size", options: uniq("size").sort((a, b) => sizeRank(a) - sizeRank(b)).map((v) => ({ value: v, label: v })) },
      { key: "price", label: "Price", options: PRICE_BANDS.filter((b) => uniq("price").includes(b.value)) },
      { key: "sleeve", label: "Sleeve", options: uniq("sleeve").sort().map((v) => ({ value: v, label: title(v) })) },
      { key: "stock", label: "Availability", options: [{ value: "in", label: "In stock" }] },
    ];
    return all.filter((g) => !hide.includes(g.key) && g.options.length > (g.key === "stock" ? 0 : 1));
  }, [products, hide]);

  const selected = (key: GroupKey) => params.get(key)?.split(",").filter(Boolean) ?? [];
  const sort = SORTS.some((s) => s.value === params.get("sort")) ? (params.get("sort") as string) : "new";

  const matches = (p: ProductCardData, skip?: GroupKey) =>
    groups.every((g) => {
      if (g.key === skip) return true;
      const want = selected(g.key);
      return want.length === 0 || valuesOf(p, g.key).some((v) => want.includes(v));
    });

  const results = products.filter((p) => matches(p)).sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "price-asc" || sort === "price-desc") {
      // Pieces without a price yet always go last.
      if (priced(a) !== priced(b)) return priced(a) ? -1 : 1;
      return sort === "price-asc" ? a.priceNgn - b.priceNgn : b.priceNgn - a.priceNgn;
    }
    return b.createdAt.localeCompare(a.createdAt);
  });

  const update = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    setShown(PAGE);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const toggle = (key: GroupKey, value: string) =>
    update((next) => {
      const cur = selected(key);
      const list = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      if (list.length) next.set(key, list.join(","));
      else next.delete(key);
    });

  const chips = groups.flatMap((g) => selected(g.key).flatMap((v) => g.options.filter((o) => o.value === v).map((o) => ({ key: g.key, ...o }))));

  return (
    <div>
      <div className="z-20 -mx-[var(--gutter)] md:sticky md:top-0 border-y border-ink/10 bg-ivory px-[var(--gutter)]">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2">
          {groups.map((g) => {
            const count = selected(g.key).length;
            return (
              <details key={g.key} name="filters" className="group relative">
                <summary className="label flex h-11 cursor-pointer list-none items-center gap-2 px-3 hover:bg-sand group-open:bg-sand">
                  {g.label}
                  {count > 0 && <span className="tabular-nums">({count})</span>}
                  <span aria-hidden="true" className="text-base leading-none">
                    +
                  </span>
                </summary>
                <ul className="absolute top-full left-0 z-30 max-h-80 min-w-60 overflow-y-auto border border-ink/15 bg-ivory p-2">
                  {g.options.map((o) => {
                    const n = products.filter((p) => matches(p, g.key) && valuesOf(p, g.key).includes(o.value)).length;
                    const on = selected(g.key).includes(o.value);
                    return (
                      <li key={o.value}>
                        <label className={`flex min-h-11 cursor-pointer items-center gap-3 px-2 hover:bg-sand ${n === 0 && !on ? "text-ink-soft" : ""}`}>
                          <input
                            type="checkbox"
                            checked={on}
                            disabled={n === 0 && !on}
                            onChange={() => toggle(g.key, o.value)}
                            className="h-4 w-4 accent-[var(--color-emerald)]"
                          />
                          <span className="flex-1">{o.label}</span>
                          <span className="text-sm tabular-nums text-ink-soft">{n}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
          <label className="label ml-auto flex h-11 items-center gap-2">
            <span className="max-sm:sr-only">Sort</span>
            <select
              value={sort}
              onChange={(e) => update((next) => (e.target.value === "new" ? next.delete("sort") : next.set("sort", e.target.value)))}
              className="label h-11 cursor-pointer border border-ink/20 bg-ivory px-2"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 py-5">
        <p className="mr-2 text-base text-ink-soft" aria-live="polite">
          {results.length} {results.length === 1 ? "piece" : "pieces"}
        </p>
        {chips.map((c) => (
          <button
            key={`${c.key}-${c.value}`}
            type="button"
            onClick={() => toggle(c.key, c.value)}
            aria-label={`Remove filter: ${c.label}`}
            className="flex h-9 cursor-pointer items-center gap-2 border border-ink/30 px-3 text-sm font-semibold hover:border-ink"
          >
            {c.label}
            <span aria-hidden="true">×</span>
          </button>
        ))}
        {chips.length > 0 && (
          <button
            type="button"
            className="text-link label ml-1 cursor-pointer"
            onClick={() => update((next) => groups.forEach((g) => next.delete(g.key)))}
          >
            Clear all
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="py-20 text-center font-editorial text-2xl italic">Nothing matches those filters yet. Try removing one.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
          {results.slice(0, shown).map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} index={i} reveal={false} />
            </li>
          ))}
        </ul>
      )}
      {results.length > shown && (
        <p className="mt-14 text-center">
          <button type="button" className="text-link label cursor-pointer" onClick={() => setShown((n) => n + PAGE)}>
            Show more ({results.length - shown} left)
          </button>
        </p>
      )}
    </div>
  );
}

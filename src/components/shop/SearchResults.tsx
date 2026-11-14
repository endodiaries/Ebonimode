"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCardData } from "@/lib/data/home";

const RECENT_KEY = "ebonimode:recent-searches";
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").trim();

/** Edit distance, stopping early once it passes `max`. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (Math.min(...row) > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}

/** Higher is better; 0 means no match. Forgives one typo in words of 4+ letters, two in 8+. */
function score(p: ProductCardData, terms: string[]): number {
  const words = norm([p.name, p.category?.name, p.colourFamily, p.department, ...p.collections].filter(Boolean).join(" ")).split(" ");
  let total = 0;
  for (const t of terms) {
    let best = 0;
    for (const w of words) {
      if (w === t) best = Math.max(best, 3);
      else if (w.startsWith(t) || (t.length >= 3 && w.includes(t))) best = Math.max(best, 2);
      else if (t.length >= 4 && distance(t, w, t.length >= 8 ? 2 : 1) <= (t.length >= 8 ? 2 : 1)) best = Math.max(best, 1);
    }
    if (best === 0) return 0;
    total += best;
  }
  return total;
}

const RECENT_EVENT = "ebonimode:recent-searches-change";
const parseRecent = (raw: string): string[] => {
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
};
function readRecentRaw(): string {
  try {
    return window.localStorage.getItem(RECENT_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}
function subscribeRecent(onChange: () => void) {
  window.addEventListener(RECENT_EVENT, onChange);
  return () => window.removeEventListener(RECENT_EVENT, onChange);
}

/** Search as you type, with typo tolerance, quick suggestions and this device's recent searches. */
export function SearchResults({ products }: { products: ProductCardData[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const initial = useSearchParams().get("q") ?? "";
  const [q, setQ] = useState(initial);
  const recentRaw = useSyncExternalStore(subscribeRecent, readRecentRaw, () => "[]");
  const recent = useMemo(() => parseRecent(recentRaw), [recentRaw]);

  const terms = norm(q).split(" ").filter(Boolean);
  const results =
    terms.length === 0
      ? []
      : products
          .map((p) => ({ p, s: score(p, terms) }))
          .filter((r) => r.s > 0)
          .sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name))
          .map((r) => r.p);

  const commit = (value: string) => {
    const v = value.trim();
    router.replace(v ? `${pathname}?q=${encodeURIComponent(v)}` : pathname, { scroll: false });
    if (!v) return;
    const next = [v, ...parseRecent(readRecentRaw()).filter((r) => r.toLowerCase() !== v.toLowerCase())].slice(0, 5);
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
    window.dispatchEvent(new Event(RECENT_EVENT));
  };
  const suggestions = ["Boubou", "Adire", "Linen", "Asooke", "Dresses", "Pant set"];

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          commit(q);
        }}
      >
        <label htmlFor="search-box" className="label text-ink-soft">
          Search the shop
        </label>
        <input
          id="search-box"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => commit(q)}
          autoFocus
          autoComplete="off"
          placeholder="Try “boubou” or “linen”"
          className="mt-3 block w-full border-b-2 border-ink bg-transparent py-3 font-display text-3xl outline-none placeholder:text-ink/30 md:text-5xl"
        />
      </form>

      {terms.length === 0 ? (
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {recent.length > 0 && (
            <div>
              <h2 className="label text-ink-soft">Recent searches</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {recent.map((r) => (
                  <li key={r}>
                    <button type="button" onClick={() => (setQ(r), commit(r))} className="h-11 cursor-pointer border border-ink/30 px-4 font-semibold hover:border-ink">
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h2 className="label text-ink-soft">Popular</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((r) => (
                <li key={r}>
                  <button type="button" onClick={() => (setQ(r), commit(r))} className="h-11 cursor-pointer border border-ink/30 px-4 font-semibold hover:border-ink">
                    {r}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-6 text-base text-ink-soft" aria-live="polite">
            {results.length} {results.length === 1 ? "piece" : "pieces"} for “{q.trim()}”
          </p>
          {results.length === 0 ? (
            <p className="py-16 text-center font-editorial text-2xl italic">Nothing found. Check the spelling or try a shorter word.</p>
          ) : (
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
              {results.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} index={i} reveal={false} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useId, useState, type KeyboardEvent } from "react";
import type { SizeGuide } from "@/lib/data/product";

type Props = {
  details: string[];
  occasions: string[];
  sizeGuide: SizeGuide | null;
  fabric: string | null;
  weight: string | null;
  lining: string | null;
  care: string[];
  /** Older free-text care note, shown when no structured care lines exist. */
  careNote: string | null;
};

/** Details, Size guide and Fabric & care as tabs under the product description. */
export function ProductTabs({ details, occasions, sizeGuide, fabric, weight, lining, care, careNote }: Props) {
  const uid = useId();
  const hasFabric = Boolean(fabric || weight || lining || care.length > 0 || careNote);
  const tabs = [
    details.length > 0 || occasions.length > 0 ? { key: "details", label: "Details" } : null,
    sizeGuide ? { key: "size", label: "Size guide" } : null,
    hasFabric ? { key: "fabric", label: "Fabric & care" } : null,
  ].filter((t): t is { key: string; label: string } => t !== null);
  const [active, setActive] = useState(tabs[0]?.key);
  if (tabs.length === 0) return null;

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = tabs.findIndex((t) => t.key === active);
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    setActive(next.key);
    document.getElementById(`${uid}-tab-${next.key}`)?.focus();
  };
  const cards = [
    { label: "Fabric", value: fabric },
    { label: "Weight", value: weight },
    { label: "Lining", value: lining },
  ].filter((c) => c.value);

  return (
    <div>
      <div role="tablist" aria-label="Product information" className="flex gap-6 border-b border-ink/20 md:gap-8" onKeyDown={onKey}>
        {tabs.map((t) => (
          <button
            key={t.key}
            id={`${uid}-tab-${t.key}`}
            type="button"
            role="tab"
            aria-selected={active === t.key}
            aria-controls={`${uid}-panel-${t.key}`}
            tabIndex={active === t.key ? 0 : -1}
            onClick={() => setActive(t.key)}
            className={`label -mb-px cursor-pointer border-b-2 px-1 pt-2 pb-4 ${active === t.key ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "details" && (
        <div role="tabpanel" id={`${uid}-panel-details`} aria-labelledby={`${uid}-tab-details`} className="pt-6">
          <ul>
            {details.map((d) => (
              <li key={d} className="flex gap-4 border-b border-ink/10 py-3.5">
                <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" />
                {d}
              </li>
            ))}
          </ul>
          {occasions.length > 0 && (
            <div className="mt-6 bg-sand p-5">
              <p className="label">Where to wear</p>
              <p className="mt-2">{occasions.join(" · ")}</p>
            </div>
          )}
        </div>
      )}

      {active === "size" && sizeGuide && (
        <div role="tabpanel" id={`${uid}-panel-size`} aria-labelledby={`${uid}-tab-size`} className="pt-6">
          <p className="text-ink-soft">Measurements in {sizeGuide.unit === "in" ? "inches" : sizeGuide.unit}.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  {sizeGuide.columns.map((c) => (
                    <th key={c} scope="col" className="label border-b border-ink py-3 pr-5 whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeGuide.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) =>
                      c === 0 ? (
                        <th key={c} scope="row" className="border-b border-ink/10 py-3 pr-5 font-semibold whitespace-nowrap">
                          {cell}
                        </th>
                      ) : (
                        <td key={c} className="border-b border-ink/10 py-3 pr-5 tabular-nums whitespace-nowrap">
                          {cell ?? "–"}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sizeGuide.notes && <p className="mt-6 bg-sand p-5">{sizeGuide.notes}</p>}
        </div>
      )}

      {active === "fabric" && hasFabric && (
        <div role="tabpanel" id={`${uid}-panel-fabric`} aria-labelledby={`${uid}-tab-fabric`} className="pt-6">
          {cards.length > 0 && (
            <dl className="grid grid-cols-2 gap-3">
              {cards.map((c) => (
                <div key={c.label} className="border border-ink/15 bg-white p-5 text-center">
                  <dt className="label text-ink-soft">{c.label}</dt>
                  <dd className="mt-3 font-editorial text-xl italic">{c.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {care.length > 0 ? (
            <div className="mt-3 border border-ink/15 bg-white p-5">
              <p className="label text-center text-ink-soft">Care</p>
              <ul className="mt-3">
                {care.map((line) => (
                  <li key={line} className="border-b border-ink/10 py-2.5 last:border-b-0">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            careNote && <p className="mt-3 border border-ink/15 bg-white p-5">{careNote}</p>
          )}
        </div>
      )}
    </div>
  );
}

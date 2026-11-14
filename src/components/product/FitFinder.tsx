"use client";

import { useRef, useState } from "react";
import type { SizeGuide } from "@/lib/data/product";

type Fit = "close" | "regular" | "relaxed";

/** Reads "40–42" as 42 and "13½" as 13.5. */
const upper = (cell: string | null) => {
  const nums = (cell ?? "").replace(/½/g, ".5").match(/\d+(\.\d+)?/g);
  return nums ? Math.max(...nums.map(Number)) : null;
};

/** Body measurement each size is cut for: bust for the women's chart, chest for the men's. */
function chartFor(guide: SizeGuide): { label: string; sizes: { size: string; max: number }[] } | null {
  const bustRow = guide.rows.find((r) => r[0]?.toLowerCase() === "bust");
  if (bustRow) {
    return { label: "bust", sizes: guide.columns.slice(1).flatMap((size, i) => { const max = upper(bustRow[i + 1]); return max ? [{ size, max }] : []; }) };
  }
  const chestCol = guide.columns.findIndex((c) => c.toLowerCase() === "chest");
  if (chestCol > 0) {
    return { label: "chest", sizes: guide.rows.flatMap((r) => { const max = upper(r[chestCol]); return r[0] && max ? [{ size: r[0], max }] : []; }) };
  }
  return null;
}

/**
 * Suggests a size from the customer's usual size or body measurement and how they like
 * clothes to fit, using the brand's own size chart. A guide, not a guarantee.
 */
export function FitFinder({ guide, sizes, onPick }: { guide: SizeGuide; sizes: { size: string; stock: number }[]; onPick: (size: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const chart = chartFor(guide);
  const [usual, setUsual] = useState("");
  const [measure, setMeasure] = useState("");
  const [fit, setFit] = useState<Fit>("regular");
  const [result, setResult] = useState<{ size: string | null; why: string } | null>(null);
  const order = sizes.map((s) => s.size);
  if (order.length === 0) return null;

  const recommend = () => {
    const m = Number(measure);
    let base: string | null = null;
    let why = "";
    if (chart && m > 0) {
      const hit = chart.sizes.find((s) => m <= s.max);
      if (!hit) {
        setResult({ size: null, why: `Your ${chart.label} is beyond our chart. We can make this piece to order for you.` });
        return;
      }
      base = hit.size;
      why = `A ${m} inch ${chart.label} sits in size ${hit.size} on our chart.`;
    } else if (usual) {
      base = usual;
      why = `Starting from your usual size ${usual}.`;
    } else {
      setResult({ size: null, why: "Choose your usual size or enter a measurement." });
      return;
    }
    // Sizes on the chart but not stocked (for example 20 and 22) are made to order.
    const scale = chart && chart.sizes.some((s) => s.size === base) ? chart.sizes.map((s) => s.size) : order;
    const at = scale.indexOf(base);
    const pick = fit === "relaxed" && at >= 0 && at < scale.length - 1 ? scale[at + 1] : base;
    if (fit === "relaxed" && pick !== base) why += ` For a relaxed fit we suggest one size up.`;
    if (fit === "close") why += ` For a close fit, stay with this size.`;
    setResult({ size: pick, why });
  };

  const stocked = result?.size ? sizes.find((s) => s.size === result.size) : undefined;

  return (
    <>
      <button type="button" className="text-link label cursor-pointer" onClick={() => dialog.current?.showModal()}>
        Find my size
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="fit-finder-title"
        className="m-auto w-[min(34rem,calc(100vw-2rem))] bg-ivory p-0 text-ink backdrop:bg-ink/50"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="space-y-6 p-6 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <h2 id="fit-finder-title" className="font-display text-3xl md:text-4xl">
              Find my size
            </h2>
            <button type="button" className="text-link label cursor-pointer" onClick={() => dialog.current?.close()}>
              Close
            </button>
          </div>
          <label className="block">
            <span className="label">Your usual size</span>
            <select value={usual} onChange={(e) => setUsual(e.target.value)} className="field mt-2 w-full">
              <option value="">Choose</option>
              {order.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          {chart && (
            <label className="block">
              <span className="label">Or your {chart.label} in inches (optional)</span>
              <input type="number" inputMode="decimal" min={20} max={80} step={0.5} value={measure} onChange={(e) => setMeasure(e.target.value)} className="field mt-2 w-full" />
            </label>
          )}
          <fieldset>
            <legend className="label">How do you like it to fit?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["close", "regular", "relaxed"] as const).map((f) => (
                <label key={f} className={`flex h-11 cursor-pointer items-center border px-4 font-semibold capitalize ${fit === f ? "border-ink bg-ink text-ivory" : "border-ink/30"}`}>
                  <input type="radio" name="fit" value={f} checked={fit === f} onChange={() => setFit(f)} className="sr-only" />
                  {f}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="button" className="btn" onClick={recommend}>
            Suggest a size
          </button>
          <div aria-live="polite">
            {result && (
              <div className="border-t border-ink/15 pt-5">
                {result.size && <p className="font-display text-3xl">We suggest size {result.size}</p>}
                <p className="mt-2 text-ink-soft">{result.why}</p>
                {result.size && stocked && stocked.stock > 0 && (
                  <button
                    type="button"
                    className="text-link label mt-4 cursor-pointer"
                    onClick={() => {
                      onPick(result.size!);
                      dialog.current?.close();
                    }}
                  >
                    Choose size {result.size} →
                  </button>
                )}
                {result.size && !(stocked && stocked.stock > 0) && <p className="mt-3">This size is made to order: production takes 5 to 7 days.</p>}
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}

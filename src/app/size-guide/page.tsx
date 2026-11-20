import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/content/ContentPage";
import { getSizeGuides } from "@/lib/data/content";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Size guide",
  description: "Women's and men's size charts for Ebonímode, with how our made-to-order sizes work.",
  alternates: { canonical: "/size-guide" },
};

export default async function SizeGuidePage() {
  const guides = await getSizeGuides();
  return (
    <>
      <PageHeader
        label="Help"
        title="Size guide"
        intro={<p>Measure over light clothing and compare with the charts below. Not sure? Ask us before you order.</p>}
      />
      {guides.length > 1 && (
        <nav aria-label="Charts" className="gutter -mt-4 mb-4 flex justify-center gap-8">
          {guides.map((g) => (
            <a key={g.department} href={`#${g.department}`} className="text-link label">
              {g.department === "women" ? "Women" : "Men"}
            </a>
          ))}
        </nav>
      )}
      <div className="gutter pb-16 md:pb-24">
        <div className="mx-auto max-w-5xl space-y-16">
          {guides.map((g) => (
            <section key={g.department} id={g.department} className="scroll-mt-28" aria-labelledby={`${g.department}-title`}>
              <h2 id={`${g.department}-title`} className="font-display text-xl md:text-2xl">
                {g.name}
              </h2>
              <p className="mt-3 text-ink-soft">
                All measurements in {g.unit === "in" ? "inches" : g.unit}.
              </p>
              <div className="mt-6 overflow-x-auto" tabIndex={0} role="region" aria-label={`${g.name} chart, scrolls sideways`}>
                <table className="w-full min-w-[36rem] border-collapse text-left">
                  <thead>
                    <tr>
                      {g.columns.map((c, i) => (
                        <th
                          key={c}
                          scope="col"
                          className={`label border-b border-ink py-3 pr-5 whitespace-nowrap ${i === 0 ? "sticky left-0 bg-ivory" : ""}`}
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((row, r) => (
                      <tr key={r} className="border-b border-ink/10">
                        {row.map((cell, c) =>
                          c === 0 ? (
                            <th key={c} scope="row" className="sticky left-0 bg-ivory py-3 pr-5 font-medium whitespace-nowrap">
                              {cell}
                            </th>
                          ) : (
                            <td key={c} className="py-3 pr-5 tabular-nums whitespace-nowrap">
                              {cell ?? "–"}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {g.notes && <p className="mt-4 text-base text-ink-soft">{g.notes}</p>}
            </section>
          ))}
          <p className="text-center text-ink-soft">
            Not sure of your size?{" "}
            <a href={contact.whatsappHref} className="text-link" target="_blank" rel="noopener">
              Message us on WhatsApp
            </a>{" "}
            before you order, or see our{" "}
            <Link href="/shipping-returns#returns" className="text-link">
              exchange policy
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}

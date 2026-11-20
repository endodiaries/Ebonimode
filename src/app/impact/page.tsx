import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/content/ContentPage";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { CORE_VALUES, FAQS } from "@/lib/content/brand";
import { BRAND_MISSION } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our impact",
  description: BRAND_MISSION,
  alternates: { canonical: "/impact" },
};

/** The values that are about people and the planet, in the owner's own words. */
const IMPACT = ["Sustainability & Conscious Production", "Ethical Craftsmanship", "Community Empowerment", "Cultural Authenticity"];

export default function ImpactPage() {
  const values = CORE_VALUES.filter((v) => IMPACT.includes(v.title));
  const handmade = FAQS.find((f) => f.q.startsWith("Are your Adire pieces"));
  return (
    <>
      <PageHeader label="Our impact" title="Fashion that cares for people and the planet" intro={<p>{BRAND_MISSION}</p>} />

      <section className="gutter pb-16 md:pb-24">
        <ul className="mx-auto grid max-w-[70rem] gap-px bg-ink/10 md:grid-cols-2">
          {values.map((v, i) => (
            <li key={v.title} className="bg-ivory p-8 md:p-12" data-reveal style={{ "--i": i % 2 } as React.CSSProperties}>
              <h2 className="font-display text-xl">{v.title}</h2>
              <p className="mt-4 text-pretty text-ink-soft">{v.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {handmade && (
        <section className="gutter bg-sand py-16 text-center md:py-24">
          <div className="mx-auto max-w-2xl" data-reveal>
            <h2 className="font-display text-xl md:text-2xl">Made by hand, never twice the same</h2>
            <p className="font-editorial mt-6 text-xl leading-snug md:text-2xl">{handmade.a.replace(/^No\.\s*/, "")}</p>
            <p className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-4">
              <Link href="/about" className="text-link label">
                Our story
              </Link>
              <Link href="/shop" className="text-link label">
                Shop the pieces
              </Link>
            </p>
          </div>
        </section>
      )}
      <RevealObserver />
    </>
  );
}

import Link from "next/link";
import { PrintName } from "@/components/brand/PrintName";

/**
 * Phase 0 placeholder home. The hero slideshow and full homepage arrive in
 * Phase 2; this page previews the print-filled name on the three colour
 * pairings the brief calls for.
 */
const pairings = [
  { bg: "bg-marigold", print: "a", note: "Green print on marigold" },
  { bg: "bg-sand", print: "b", note: "Blue print on sand" },
  { bg: "bg-ivory", print: "c", note: "Multicolour print on ivory" },
] as const;

export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">Ebonímode: Afrocentric modest fashion for women and men</h1>
      {pairings.map((p) => (
        <section key={p.print} className={`${p.bg} gutter overflow-hidden border-b border-ink/10 py-16 md:py-24`}>
          <p className="label mb-6">{p.note}</p>
          <PrintName print={p.print} className="text-[15vw] leading-none [&_.print-name]:[--print-size:clamp(10rem,30vw,26rem)]" />
        </section>
      ))}
      <section className="gutter py-20 text-center">
        <p className="font-editorial text-2xl italic">The full homepage arrives in Phase 2.</p>
        <p className="mt-6 flex justify-center gap-8">
          <Link href="/women" className="text-link label">
            Shop women →
          </Link>
          <Link href="/men" className="text-link label">
            Shop men →
          </Link>
        </p>
      </section>
    </>
  );
}

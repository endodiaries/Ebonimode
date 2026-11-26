import { PageHeader } from "@/components/content/ContentPage";
import type { LegalSection } from "@/lib/content/legal";

/** Renders a policy as numbered sections with a contents list, at a comfortable reading width. */
export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: LegalSection[] }) {
  const id = (i: number) => `section-${i + 1}`;
  return (
    <>
      <PageHeader label="Legal" title={title} intro={<p>Last updated {updated}</p>} />
      <div className="gutter pb-20 md:pb-28">
        <div className="mx-auto max-w-2xl">
          <nav aria-label="Contents" className="border-y border-ink/15 py-6">
            <p className="label text-ink-soft">Contents</p>
            <ol className="mt-4 grid gap-x-8 gap-y-2 text-base sm:grid-cols-2">
              {sections.map((s, i) => (
                <li key={s.heading}>
                  <a href={`#${id(i)}`} className="hover:underline">
                    {i + 1}. {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          {sections.map((s, i) => (
            <section key={s.heading} id={id(i)} className="scroll-mt-28 pt-12">
              <h2 className="font-display text-lg md:text-xl">
                {i + 1}. {s.heading}
              </h2>
              <div className="mt-4 space-y-4 text-pretty">
                {s.paragraphs?.map((p) => <p key={p}>{p}</p>)}
                {s.list && (
                  <ul className="list-disc space-y-2 pl-5">
                    {s.list.map((l) => (
                      <li key={l} className="pl-1">
                        {l}
                      </li>
                    ))}
                  </ul>
                )}
                {s.after?.map((p) => <p key={p}>{p}</p>)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

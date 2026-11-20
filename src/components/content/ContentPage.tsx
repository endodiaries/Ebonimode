import type { ReactNode } from "react";

/** The opening of every content page: a small label, the title in spaced capitals, a short intro. */
export function PageHeader({ label, title, intro }: { label?: string; title: string; intro?: ReactNode }) {
  return (
    <header className="gutter pt-14 pb-10 text-center md:pt-24 md:pb-14">
      {label && <p className="label text-ink-soft">{label}</p>}
      <h1 className="font-display mt-5 text-3xl text-balance md:text-5xl">{title}</h1>
      {intro && <div className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-ink-soft">{intro}</div>}
    </header>
  );
}

/** A titled block of reading text, kept to a comfortable line length. */
export function ProseSection({ title, children, id }: { title?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="gutter scroll-mt-28 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        {title && <h2 className="font-display mb-5 text-xl md:text-2xl">{title}</h2>}
        <div className="space-y-4 text-pretty [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">{children}</div>
      </div>
    </section>
  );
}

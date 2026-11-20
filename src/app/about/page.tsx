import type { Metadata } from "next";
import Link from "next/link";
import { CldImage } from "@/components/brand/CldImage";
import { PageHeader } from "@/components/content/ContentPage";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { ABOUT_STORY, CORE_VALUES, MISSION, VISION } from "@/lib/content/brand";
import { HOME_MEDIA } from "@/lib/home-media";
import { BRAND_STORY } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: BRAND_STORY,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const [first, ...rest] = ABOUT_STORY.paragraphs;
  return (
    <>
      <PageHeader label="Our brand story" title={ABOUT_STORY.title} intro={<p>{BRAND_STORY}</p>} />

      <section className="gutter pb-16 md:pb-24">
        <div className="mx-auto grid max-w-[80rem] items-center gap-10 md:grid-cols-2 md:gap-16">
          {cloudinaryEnabled && (
            <div className="card-studio relative aspect-[4/5] overflow-hidden" data-reveal>
              <span className="absolute inset-x-[4%] top-0 bottom-0">
                <CldImage
                  publicId={HOME_MEDIA.story.publicId}
                  alt={HOME_MEDIA.story.alt}
                  sizes="(min-width: 768px) 40rem, 100vw"
                  className="object-contain object-top"
                />
              </span>
            </div>
          )}
          <div data-reveal>
            <p className="font-editorial text-2xl leading-snug md:text-3xl md:leading-snug">{first}</p>
            {rest.map((p) => (
              <p key={p} className="mt-5 text-pretty text-ink-soft">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="gutter bg-sand py-16 md:py-24">
        <div className="mx-auto grid max-w-[70rem] gap-12 md:grid-cols-2 md:gap-16">
          {[
            { title: "Our vision", lines: VISION },
            { title: "Our mission", lines: MISSION },
          ].map((block) => (
            <div key={block.title} data-reveal>
              <h2 className="font-display text-xl md:text-2xl">{block.title}</h2>
              <p className="font-editorial mt-5 text-xl leading-snug">{block.lines[0]}</p>
              {block.lines.slice(1).map((l) => (
                <p key={l} className="mt-4 text-ink-soft">
                  {l}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="gutter py-16 md:py-24" aria-labelledby="values-title">
        <div className="mx-auto max-w-[80rem]">
          <h2 id="values-title" className="font-display text-center text-xl md:text-2xl">
            Our core values
          </h2>
          <ol className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_VALUES.map((v, i) => (
              <li key={v.title} className="border-t border-ink/15 pt-6" data-reveal style={{ "--i": i % 3 } as React.CSSProperties}>
                <p className="label text-ink-soft">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="font-display mt-3 text-lg">{v.title}</h3>
                <p className="mt-3 text-pretty text-ink-soft">{v.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-4">
            <Link href="/impact" className="text-link label">
              Our impact
            </Link>
            <Link href="/collections" className="text-link label">
              Explore the collections
            </Link>
          </p>
        </div>
      </section>
      <RevealObserver />
    </>
  );
}

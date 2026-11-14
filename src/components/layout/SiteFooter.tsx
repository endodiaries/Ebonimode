import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { StrataDivider } from "@/components/brand/StrataDivider";
import { BRAND_STORY, footerNav, paymentMethods, socialLinks } from "@/lib/site";
import logo from "@/assets/ebonimode-logo-light.png";

/** Strata divider, then the footer. The full logo sits here, straight on the green, with the name in ivory. */
export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <StrataDivider />
      <div className="gutter bg-emerald-deep pt-16 pb-[calc(var(--tabbar-h)+2.5rem)] text-ivory md:pb-12">
        <div className="mx-auto grid max-w-[90rem] gap-12 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div>
            <Link href="/" aria-label="Ebonímode home" className="inline-block">
              <Image src={logo} alt="Ebonímode logo" width={104} sizes="104px" className="h-auto w-[6.5rem]" />
            </Link>
            <p className="mt-6 max-w-sm font-editorial text-lg leading-snug italic text-ivory/90">{BRAND_STORY}</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="label mb-4 text-marigold">{group.title}</h2>
                <ul className="space-y-1">
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="inline-block py-1.5 text-base text-ivory/85 hover:text-ivory hover:underline">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-14 flex max-w-[90rem] flex-col gap-6 border-t border-gold/40 pt-6 text-base text-ivory/75 md:flex-row md:items-center md:justify-between">
          <p>
            © <CopyrightYear /> Ebonímode
          </p>
          {socialLinks.length > 0 && (
            <ul aria-label="Social" className="flex gap-6">
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a href={s.href} rel="noopener" target="_blank" className="label hover:text-ivory">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p>
            <span className="sr-only">We accept: </span>
            {paymentMethods.join(" · ")}
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Cached so the static shell can prerender; refreshes daily. */
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

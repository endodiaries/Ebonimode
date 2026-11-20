import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/content/ContentPage";
import { contact, socialLinks } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email, call or WhatsApp Ebonímode, or visit us in Lekki, Lagos.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const ways = [
    { label: "WhatsApp", value: contact.phone, href: contact.whatsappHref, note: "The quickest way to reach us, including for sizing and orders from abroad.", external: true },
    { label: "Email", value: contact.email, href: `mailto:${contact.email}`, note: "For orders, please include your order number." },
    { label: "Phone", value: contact.phone, href: contact.phoneHref },
    { label: "Address", value: contact.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`, external: true },
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ClothingStore",
            name: "Ebonímode",
            email: contact.email,
            telephone: contact.phone,
            address: { "@type": "PostalAddress", streetAddress: "25b Oladimeji Alo Street", addressLocality: "Lekki Phase I, Lagos", addressCountry: "NG" },
            sameAs: socialLinks.map((s) => s.href),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <PageHeader label="Contact" title="We would love to hear from you" />
      <div className="gutter pb-20 md:pb-28">
        <ul className="mx-auto grid max-w-4xl gap-px bg-ink/10 sm:grid-cols-2">
          {ways.map((w) => (
            <li key={w.label} className="bg-ivory p-8">
              <p className="label text-ink-soft">{w.label}</p>
              <a
                href={w.href}
                className="text-link mt-3 inline-block text-lg break-words"
                {...(w.external ? { target: "_blank", rel: "noopener" } : {})}
              >
                {w.value}
              </a>
              {w.note && <p className="mt-3 text-base text-ink-soft">{w.note}</p>}
            </li>
          ))}
        </ul>
        {socialLinks.length > 0 && (
          <div className="mt-12 text-center">
            <p className="label text-ink-soft">Follow us</p>
            <p className="mt-4 flex justify-center gap-8">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} className="text-link label" target="_blank" rel="noopener">
                  {s.label}
                </a>
              ))}
            </p>
          </div>
        )}
        <p className="mt-12 text-center text-ink-soft">
          Questions about delivery or returns? See our{" "}
          <Link href="/faqs" className="text-link">
            FAQs
          </Link>{" "}
          and{" "}
          <Link href="/shipping-returns" className="text-link">
            shipping & returns
          </Link>
          .
        </p>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/content/ContentPage";
import { FAQS } from "@/lib/content/brand";
import { getShippingRates } from "@/lib/data/checkout";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers about Ebonímode's hand-dyed Adire, sizing, delivery and returns.",
  alternates: { canonical: "/faqs" },
};

/** Practical questions, answered only with facts from the owner's own policies. */
function ordersFaq(fees: string) {
  return [
  {
    q: "Which sizes do you make?",
    a: "Women's sizes 8 to 18 are made ready to ship. Sizes below 8 or above 18 are made to order in 5 to 7 days. Men's pieces come in S to XXL.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders are prepared within 1 to 3 working days. After dispatch, delivery takes 1 to 3 working days within Lagos, 2 to 5 working days elsewhere in Nigeria, and 5 to 10 working days internationally.",
  },
  {
    q: "How much is delivery?",
    a: `${fees} Your fee is shown at checkout.`,
  },
  {
    q: "Can I return or exchange a piece?",
    a: "Yes, within 5 days of delivery, if the piece is unused, unworn, unwashed and has its tags and packaging. Eligible returns receive store credit. Sale items and pop-up purchases are final sale.",
  },
  {
    q: "How can I pay?",
    a: "Securely with Paystack: card, bank transfer or USSD.",
  },
  ];
}

const naira = (n: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default async function FaqsPage() {
  // Fees come from the delivery rates the owner sets, so this answer never goes stale.
  const rates = (await getShippingRates()).filter((r) => r.countries.includes("NG"));
  const fees = rates.length ? `${rates.map((r) => `${r.name} ${naira(r.priceNgn)}`).join(", ")}.` : "Delivery fees depend on your location.";
  const GROUPS = [
    { title: "About our pieces", items: FAQS },
    { title: "Orders and delivery", items: ordersFaq(fees) },
  ];
  const all = GROUPS.flatMap((g) => g.items);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: all.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <PageHeader label="Help" title="Frequently asked questions" />
      <div className="gutter pb-20 md:pb-28">
        <div className="mx-auto max-w-3xl space-y-14">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h2 className="font-display text-xl md:text-2xl">{g.title}</h2>
              <div className="mt-6 border-t border-ink/15">
                {g.items.map((f) => (
                  <details key={f.q} className="group border-b border-ink/15">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg [&::-webkit-details-marker]:hidden">
                      {f.q}
                      <span aria-hidden="true" className="text-2xl leading-none transition-transform duration-[var(--dur-ui)] group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="pb-6 text-pretty text-ink-soft">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
          <p className="text-center text-ink-soft">
            Still have a question?{" "}
            <Link href="/contact" className="text-link">
              Contact us
            </Link>{" "}
            or message us on{" "}
            <a href={contact.whatsappHref} className="text-link" target="_blank" rel="noopener">
              WhatsApp
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}

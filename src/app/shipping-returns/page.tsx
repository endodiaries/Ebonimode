import type { Metadata } from "next";
import { PageHeader, ProseSection } from "@/components/content/ContentPage";
import { RETURNS_POLICY, SHIPPING_POLICY } from "@/lib/content/brand";
import { getShippingRates } from "@/lib/data/checkout";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: "Delivery times and fees across Nigeria and worldwide, and how returns and exchanges work at Ebonímode.",
  alternates: { canonical: "/shipping-returns" },
};

const naira = (n: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default async function ShippingReturnsPage() {
  const rates = (await getShippingRates()).filter((r) => r.countries.includes("NG"));
  return (
    <>
      <PageHeader label="Help" title="Shipping & returns" />
      <nav aria-label="On this page" className="gutter -mt-4 mb-6 flex justify-center gap-8">
        <a href="#delivery" className="text-link label">
          Delivery
        </a>
        <a href="#returns" className="text-link label">
          Returns
        </a>
      </nav>

      <ProseSection title="Delivery & shipping policy" id="delivery">
        <h3 className="label pt-2">Order processing</h3>
        {SHIPPING_POLICY.processing.map((p) => (
          <p key={p}>{p}</p>
        ))}

        <h3 className="label pt-4">Shipping timelines</h3>
        <ul>
          {SHIPPING_POLICY.timelines.map((t) => (
            <li key={t.where}>
              <strong className="font-medium">{t.where}:</strong> {t.when}
            </li>
          ))}
        </ul>
        {SHIPPING_POLICY.timelineNotes.map((p) => (
          <p key={p} className="text-ink-soft">
            {p}
          </p>
        ))}

        <h3 className="label pt-4">Delivery fees within Nigeria</h3>
        {rates.length > 0 && (
          <table className="w-full border-collapse text-left">
            <tbody>
              {rates.map((r) => (
                <tr key={r.id} className="border-b border-ink/15">
                  <th scope="row" className="py-3 font-normal">
                    {r.name}
                  </th>
                  <td className="py-3 text-right tabular-nums">{naira(r.priceNgn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p>{SHIPPING_POLICY.feesNote}</p>

        <h3 className="label pt-4">International orders</h3>
        <p>International orders are delivered by DHL Express.</p>
        {SHIPPING_POLICY.international.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </ProseSection>

      <div className="gutter">
        <hr className="mx-auto my-6 max-w-2xl border-ink/15" />
      </div>

      <ProseSection title="Returns, exchanges & refunds" id="returns">
        <p>{RETURNS_POLICY.intro}</p>
        <h3 className="label pt-4">Eligibility for returns</h3>
        <p>To qualify for a return:</p>
        <ul>
          {RETURNS_POLICY.eligibility.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <h3 className="label pt-4">Non-returnable items</h3>
        <p>The following purchases are considered final sale:</p>
        <ul>
          {RETURNS_POLICY.finalSale.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p>{RETURNS_POLICY.finalSaleNote}</p>
        <h3 className="label pt-4">Exchanges</h3>
        {RETURNS_POLICY.exchanges.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <h3 className="label pt-4">Refunds & store credit</h3>
        {RETURNS_POLICY.refunds.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <h3 className="label pt-4">Return & exchange shipping</h3>
        <p>{RETURNS_POLICY.shipping}</p>
        <h3 className="label pt-4">Damaged or incorrect orders</h3>
        {RETURNS_POLICY.damaged.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="pt-2">
          Contact us at{" "}
          <a href={`mailto:${contact.email}`} className="text-link">
            {contact.email}
          </a>{" "}
          or on{" "}
          <a href={contact.whatsappHref} className="text-link" target="_blank" rel="noopener">
            WhatsApp ({contact.phone})
          </a>
          .
        </p>
      </ProseSection>
      <div className="pb-16 md:pb-24" />
    </>
  );
}

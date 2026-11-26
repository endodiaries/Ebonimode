import type { Metadata } from "next";
import { LegalPage } from "@/components/content/LegalPage";
import { LEGAL_UPDATED, TERMS } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "Terms of sale",
  description: "The terms that apply when you shop with Ebonímode: orders, payment, delivery, returns and more.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalPage title="Terms of sale" updated={LEGAL_UPDATED} sections={TERMS} />;
}

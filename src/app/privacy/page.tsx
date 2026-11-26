import type { Metadata } from "next";
import { LegalPage } from "@/components/content/LegalPage";
import { LEGAL_UPDATED, PRIVACY } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Ebonímode collects, uses and protects your personal information, and your rights under the Nigeria Data Protection Act 2023.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage title="Privacy policy" updated={LEGAL_UPDATED} sections={PRIVACY} />;
}

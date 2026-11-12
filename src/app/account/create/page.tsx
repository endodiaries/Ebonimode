import type { Metadata } from "next";
import { SignUpForm } from "@/components/account/AuthForms";
import { AuthShell } from "@/components/account/AuthShell";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthShell title="Create an account" deck="Save your favourites and track your orders.">
      <SignUpForm />
    </AuthShell>
  );
}

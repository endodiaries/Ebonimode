import type { Metadata } from "next";
import { SignInForm } from "@/components/account/AuthForms";
import { AuthShell } from "@/components/account/AuthShell";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthShell title="Sign in" deck="Welcome back.">
      <SignInForm />
    </AuthShell>
  );
}

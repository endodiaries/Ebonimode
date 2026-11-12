import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/account/AuthForms";
import { AuthShell } from "@/components/account/AuthShell";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthShell title="Reset your password" deck="Tell us your email and we will send a link.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}

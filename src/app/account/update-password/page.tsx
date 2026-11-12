import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/account/AuthForms";
import { AuthShell } from "@/components/account/AuthShell";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthShell title="Choose a new password" deck="Make it one you will remember.">
      <UpdatePasswordForm />
    </AuthShell>
  );
}

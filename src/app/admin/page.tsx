import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** Admin gate. The dashboard itself arrives in Phase 7; anyone who is not an admin gets a 404. */
export default function AdminPage() {
  return (
    <section className="gutter mx-auto w-full max-w-3xl py-16 md:py-24">
      <Suspense fallback={<div className="h-40 animate-pulse bg-sand" aria-hidden="true" />}>
        <AdminHome />
      </Suspense>
    </section>
  );
}

async function AdminHome() {
  const user = await requireAdmin();
  return (
    <>
      <p className="label text-ink-soft">Admin</p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl">You are signed in as an admin.</h1>
      <p className="mt-6">{user.email}</p>
      <p className="mt-6 font-editorial text-xl italic">The dashboard arrives in Phase 7.</p>
    </>
  );
}

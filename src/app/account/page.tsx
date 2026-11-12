import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { isAdmin, requireUser } from "@/lib/auth";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <section className="gutter mx-auto w-full max-w-3xl py-16 md:py-24">
      <p className="label text-ink-soft">Your account</p>
      {/* The session is request-time data, so it streams in behind this boundary. */}
      <Suspense fallback={<div className="mt-4 h-64 animate-pulse bg-sand" aria-hidden="true" />}>
        <AccountDetails />
      </Suspense>
    </section>
  );
}

async function AccountDetails() {
  const user = await requireUser("/account");
  const admin = await isAdmin();
  const firstName = user.fullName?.split(" ")[0];

  return (
    <>
      <h1 className="mt-4 font-display text-4xl md:text-5xl">{firstName ? `Hello, ${firstName}.` : "Hello."}</h1>
      <dl className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
        <div className="flex flex-wrap justify-between gap-2 py-4">
          <dt className="label self-center text-ink-soft">Name</dt>
          <dd>{user.fullName ?? "Not set yet"}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2 py-4">
          <dt className="label self-center text-ink-soft">Email</dt>
          <dd className="break-all">{user.email}</dd>
        </div>
      </dl>
      <p className="mt-8 font-editorial text-xl italic">
        Your orders, wishlist and saved addresses will appear here soon.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-8">
        {admin && (
          <Link href="/admin" className="text-link label">
            Open admin →
          </Link>
        )}
        <form action={signOut}>
          <button type="submit" className="text-link label min-h-11 cursor-pointer">
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}

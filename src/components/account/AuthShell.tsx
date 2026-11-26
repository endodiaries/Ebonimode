import { Suspense, type ReactNode } from "react";

/** Shared frame for the sign-in, create-account and password pages. */
export function AuthShell({ title, deck, children }: { title: string; deck: string; children: ReactNode }) {
  return (
    <section className="gutter mx-auto w-full max-w-md py-16 md:py-24">
      <h1 className="text-center font-display text-3xl text-balance md:text-4xl">{title}</h1>
      <p className="mt-4 mb-10 text-center font-editorial text-xl italic">{deck}</p>
      {/* The forms read the URL (?next=, ?error=), which is request-time data. */}
      <Suspense fallback={<div className="h-80 animate-pulse bg-sand" aria-hidden="true" />}>{children}</Suspense>
    </section>
  );
}

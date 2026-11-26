import Link from "next/link";

export default function NotFound() {
  return (
    <section className="gutter mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center py-24 text-center">
      <p className="label text-ink-soft">404</p>
      <h1 className="mt-4 font-display text-3xl text-balance md:text-5xl">This page has moved on.</h1>
      <p className="mt-6 font-editorial text-xl italic">Let us take you somewhere beautiful instead.</p>
      <p className="mt-10 flex flex-wrap justify-center gap-8">
        <Link href="/women" className="text-link label">
          Shop women →
        </Link>
        <Link href="/men" className="text-link label">
          Shop men →
        </Link>
        <Link href="/" className="text-link label">
          Home →
        </Link>
      </p>
    </section>
  );
}

import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="gutter flex h-[var(--announcement-h)] items-center justify-center bg-ink text-ivory sm:justify-between">
      <p className="label truncate text-[0.625rem] tracking-[0.08em] sm:text-[0.6875rem] sm:tracking-[0.16em]">
        Women’s sizes below 8 or above 18 made to order in 5 to 7 days
        {/* Too long for phones: the installment teaser also lives on product and cart pages. */}
        <span className="hidden sm:inline">
          <span aria-hidden="true" className="mx-2">
            ·
          </span>
          Pay in installments
        </span>
      </p>
      <nav aria-label="Support" className="hidden gap-6 sm:flex">
        <Link href="/account/orders" className="label text-[0.6875rem] hover:underline">
          Track order
        </Link>
        <Link href="/faqs" className="label text-[0.6875rem] hover:underline">
          Help
        </Link>
      </nav>
    </div>
  );
}

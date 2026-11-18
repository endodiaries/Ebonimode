import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="gutter flex h-[var(--announcement-h)] items-center justify-center bg-ink text-ivory sm:justify-between">
      {/* Phones get a shorter line so the made-to-order note is never cut off. */}
      <p className="truncate text-sm font-semibold sm:hidden">Sizes below 8 or above 18: made to order</p>
      <p className="label hidden truncate sm:block">
        Women’s sizes below 8 or above 18 made to order in 5 to 7 days
        <span className="hidden lg:inline">
          <span aria-hidden="true" className="mx-2">
            ·
          </span>
          Pay in installments
        </span>
      </p>
      <nav aria-label="Support" className="hidden shrink-0 gap-6 pl-6 sm:flex">
        <Link href="/account/orders" className="label hover:underline">
          Track order
        </Link>
        <Link href="/faqs" className="label hover:underline">
          Help
        </Link>
      </nav>
    </div>
  );
}

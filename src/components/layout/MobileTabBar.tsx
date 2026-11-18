"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BagIcon, HeartIcon, HomeIcon, SearchIcon, ShopIcon } from "@/components/icons";

const tabs = [
  { label: "Home", href: "/", Icon: HomeIcon },
  { label: "Shop", href: "/shop", Icon: ShopIcon },
  { label: "Search", href: "/search", Icon: SearchIcon },
  { label: "Wishlist", href: "/wishlist", Icon: HeartIcon },
  { label: "Bag", href: "/cart", Icon: BagIcon },
];

/** Thumb-reach navigation on phones. Hidden from md up. */
export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Quick navigation"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory md:hidden"
    >
      <ul className="grid h-[var(--tabbar-h)] grid-cols-5">
        {tabs.map(({ label, href, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-sm font-semibold ${
                  active ? "text-emerald" : "text-ink"
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

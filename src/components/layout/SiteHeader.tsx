"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import wordmark from "@/assets/ebonimode-wordmark.png";
import { AccountIcon, BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { colourFamilyToken } from "@/lib/colour";
import type { MenuData } from "@/lib/data/home";
import { primaryNav, footerNav } from "@/lib/site";
import { CurrencySwitcher } from "./CurrencySwitcher";

/** Base icon button. Display is set per use so `hidden md:flex` isn't overridden. */
const iconBtn =
  "h-11 min-w-11 items-center justify-center gap-1.5 text-ink transition-colors duration-[var(--dur-micro)] hover:text-emerald";

/**
 * Sticky header with the print-filled name in the centre (no logo).
 * Hides on scroll down, returns on scroll up. On desktop each department opens a
 * mega-menu with categories, colour swatches and a featured colour story.
 */
export function SiteHeader({ menu }: { menu: MenuData }) {
  const [hidden, setHidden] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        if (Math.abs(delta) > 6) {
          setHidden(delta > 0 && y > 120);
          lastY.current = y;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  return (
    <header
      className="sticky top-0 z-40 border-b border-ink/10 bg-ivory transition-transform duration-[var(--dur-section)] ease-entrance will-change-transform"
      style={{
        transform: hidden && !menuOpen && !openMenu ? "translateY(-100%)" : "translateY(0)",
        viewTransitionName: "site-header",
      }}
      onFocusCapture={() => setHidden(false)}
      onMouseLeave={() => setOpenMenu(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpenMenu(null);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpenMenu(null);
      }}
    >
      <div className="gutter grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Left: department nav (desktop) / menu button (mobile) */}
        <div className="flex items-center">
          <button
            type="button"
            className={`${iconBtn} -ml-2.5 flex md:hidden`}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
          <nav aria-label="Departments" className="hidden md:block">
            <ul className="flex gap-8">
              {primaryNav.map((l) => (
                <li key={l.href} onMouseEnter={() => setOpenMenu(l.label)}>
                  <Link
                    href={l.href}
                    className="label inline-flex h-11 items-center hover:text-emerald aria-expanded:text-emerald"
                    aria-haspopup="true"
                    aria-expanded={openMenu === l.label}
                    onFocus={() => setOpenMenu(l.label)}
                    onClick={() => setOpenMenu(null)}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Centre: the handwritten wordmark from the logo */}
        <Link href="/" aria-label="Ebonímode home" className="block transition-opacity duration-[var(--dur-ui)] hover:opacity-70">
          <Image src={wordmark} alt="" priority className="h-8 w-auto sm:h-10 lg:h-11" sizes="15rem" />
        </Link>

        {/* Right: utilities */}
        <div className="flex items-center justify-end gap-0.5 sm:gap-2">
          <Link href="/search" className={`${iconBtn} hidden sm:flex`} aria-label="Search">
            <SearchIcon />
          </Link>
          <Link href="/account" className={`${iconBtn} hidden md:flex`} aria-label="Account">
            <AccountIcon />
          </Link>
          <Link href="/account/wishlist" className={`${iconBtn} hidden md:flex`} aria-label="Wishlist">
            <HeartIcon />
          </Link>
          <Link href="/cart" className={`${iconBtn} -mr-2.5 flex sm:mr-0`} aria-label="Bag, 0 items">
            <BagIcon />
            <span className="label tabular-nums" aria-hidden="true">
              0
            </span>
          </Link>
          <div className="hidden lg:block">
            <CurrencySwitcher id="currency-header" />
          </div>
        </div>
      </div>

      {/* Desktop mega-menu: one panel per department, shown on hover or keyboard focus */}
      {primaryNav.map((l) => (
        <MegaPanel key={l.label} label={l.label} href={l.href} menu={menu} open={openMenu === l.label} onNavigate={() => setOpenMenu(null)} />
      ))}

      {/* Mobile menu drawer (native dialog: focus trap and Esc for free) */}
      <dialog
        ref={dialogRef}
        aria-label="Menu"
        onClose={() => setMenuOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setMenuOpen(false)}
        className="m-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-ivory p-0 text-ink backdrop:bg-ink/40"
      >
        <div className="gutter flex h-[var(--header-h)] items-center justify-between border-b border-ink/10">
          <span className="label">Menu</span>
          <button type="button" className={`${iconBtn} -mr-2.5 flex`} aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <nav aria-label="Mobile" className="gutter py-6">
          <ul className="space-y-1">
            {primaryNav.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 font-display text-3xl hover:text-emerald"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {footerNav.slice(1).map((group) => (
            <div key={group.title} className="mt-8">
              <p className="label mb-3 text-ink-soft">{group.title}</p>
              <ul>
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={() => setMenuOpen(false)} className="block py-2.5 hover:text-emerald">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-8 border-t border-ink/10 pt-4">
            <CurrencySwitcher id="currency-drawer" />
          </div>
        </nav>
      </dialog>
    </header>
  );
}

function MegaPanel({
  label,
  href,
  menu,
  open,
  onNavigate,
}: {
  label: string;
  href: string;
  menu: MenuData;
  open: boolean;
  onNavigate: () => void;
}) {
  const dept = label === "Women" ? "women" : label === "Men" ? "men" : null;
  const categories = dept ? menu.categories.filter((c) => c.department === dept || c.department === null) : [];
  const families = dept ? (menu.colours.find((c) => c.department === dept)?.families ?? []) : [];
  const featured = menu.collections[dept === "men" ? 1 : 0] ?? menu.collections[0];
  const item = "block py-1.5 hover:text-emerald hover:underline";

  return (
    <div
      className="mega absolute inset-x-0 top-full hidden border-b border-ink/10 bg-ivory md:block"
      data-open={open ? "" : undefined}
      inert={!open}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) onNavigate();
      }}
    >
      <div className="gutter mx-auto grid max-w-[90rem] grid-cols-[1fr_1fr_minmax(0,20rem)] gap-12 py-10">
        {dept ? (
          <>
            <div>
              <p className="label mb-4 text-ink-soft">Shop {label.toLowerCase()}</p>
              <ul>
                <li>
                  <Link href={href} className={item}>
                    All {label.toLowerCase()}
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/category/${c.slug}`} className={item}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label mb-4 text-ink-soft">Shop by colour</p>
              <ul className="grid grid-cols-2 gap-x-6">
                {families.map((f) => (
                  <li key={f}>
                    <Link href={`/shop?department=${dept}&colour=${f}`} className={`${item} flex items-center gap-3 capitalize`}>
                      <span
                        className="h-4 w-4 border border-ink/20"
                        style={{ backgroundColor: colourFamilyToken[f] ?? "transparent" }}
                        aria-hidden="true"
                      />
                      {f}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="col-span-2">
            <p className="label mb-4 text-ink-soft">Colour stories</p>
            <ul className="grid grid-cols-2 gap-x-12">
              {menu.collections.map((c) => (
                <li key={c.slug}>
                  <Link href={`/collections/${c.slug}`} className={`${item} flex items-center gap-3 font-display text-2xl`}>
                    <span className="h-5 w-5 border border-ink/20" style={{ backgroundColor: c.themeHex }} aria-hidden="true" />
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={href} className={`${item} mt-3`}>
                  All collections
                </Link>
              </li>
            </ul>
          </div>
        )}
        {featured && (
          /* Featured colour story. A colour field until its banner photo is uploaded. */
          <Link href={`/collections/${featured.slug}`} className="group block">
            <span className="block aspect-[4/3]" style={{ backgroundColor: featured.themeHex }} aria-hidden="true" />
            <span className="label mt-3 block text-ink-soft">Featured story</span>
            <span className="mt-1 block font-display text-2xl group-hover:underline">{featured.name}</span>
          </Link>
        )}
      </div>
    </div>
  );
}

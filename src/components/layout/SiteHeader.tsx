"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PrintName } from "@/components/brand/PrintName";
import { AccountIcon, BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { primaryNav, footerNav } from "@/lib/site";
import { CurrencySwitcher } from "./CurrencySwitcher";

/** Base icon button. Display is set per use so `hidden md:flex` isn't overridden. */
const iconBtn =
  "h-11 min-w-11 items-center justify-center gap-1.5 text-ink transition-colors duration-[var(--dur-micro)] hover:text-emerald";

/**
 * Sticky header with the print-filled name in the centre (no logo).
 * Hides on scroll down, returns on scroll up. Mega-menu arrives in Phase 2.
 */
export function SiteHeader() {
  const [hidden, setHidden] = useState(false);
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
      style={{ transform: hidden && !menuOpen ? "translateY(-100%)" : "translateY(0)" }}
      onFocusCapture={() => setHidden(false)}
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
                <li key={l.href}>
                  <Link href={l.href} className="label inline-flex h-11 items-center hover:text-emerald">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Centre: the print-filled name */}
        <Link href="/" aria-label="Ebonímode home" className="block">
          <PrintName className="text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] [&_.print-name]:[--print-size:7rem]" />
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

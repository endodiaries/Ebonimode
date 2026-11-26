import type { Metadata, Viewport } from "next";
import { Archivo, Jost, Marcellus } from "next/font/google";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WishlistSync } from "@/components/account/WishlistSync";
import { CurrencyProvider } from "@/lib/currency";
import { getDisplayCurrencies, getMenuData } from "@/lib/data/home";
import { BRAND_NAME, BRAND_STORY, siteUrl } from "@/lib/site";
import "./globals.css";

/** Text and UI: Jost, a clean geometric sans. */
const jost = Jost({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-jost",
  display: "swap",
});

/** Hero posters: Archivo in its widest, heaviest cut, for chunky poster headlines. */
const poster = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/** Headings: Marcellus, a soft, flared classical face that reads feminine in spaced capitals. */
const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-marcellus",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND_NAME} | Afrocentric modest fashion for women and men`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_STORY,
  applicationName: BRAND_NAME,
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    locale: "en_NG",
    description: BRAND_STORY,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [menu, currencies] = await Promise.all([getMenuData(), getDisplayCurrencies()]);
  return (
    <html lang="en-NG" className={`${jost.variable} ${marcellus.variable} ${poster.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="label sr-only z-50 bg-ink px-4 py-3 text-ivory focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        <CurrencyProvider currencies={currencies}>
        <SiteHeader menu={menu} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <MobileTabBar />
        <WishlistSync />
        </CurrencyProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WishlistSync } from "@/components/account/WishlistSync";
import { CurrencyProvider } from "@/lib/currency";
import { getDisplayCurrencies, getMenuData } from "@/lib/data/home";
import { BRAND_NAME, BRAND_STORY, siteUrl } from "@/lib/site";
import "./globals.css";

/** One typeface for the whole site, as fashion houses do: Jost, a clean geometric sans. */
const jost = Jost({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-jost",
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
    <html lang="en-NG" className={jost.variable}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="label sr-only z-50 bg-ink px-4 py-3 text-ivory focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        <CurrencyProvider currencies={currencies}>
        <AnnouncementBar />
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

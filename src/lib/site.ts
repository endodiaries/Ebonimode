/** Site-wide copy and navigation. Brand copy is verbatim from the brief. */

export const BRAND_NAME = "Ebonímode";

export const BRAND_STORY =
  "At Ebonímode, we believe that modest fashion can be elegant, culturally expressive, and deeply responsible. Our brand blends timeless Afrocentric design with ethical, sustainable practices, creating clothing that cares for both people and the planet.";

export const BRAND_MISSION =
  "Our mission is to craft timeless, Afrocentric modest fashion that celebrates culture, champions sustainability, empowers women, and uplifts the next generation of artisans while honouring both our heritage and the earth.";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export type NavLink = { label: string; href: string };

export const primaryNav: NavLink[] = [
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Collections", href: "/collections" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Women", href: "/women" },
      { label: "Men", href: "/men" },
      { label: "New in", href: "/shop?sort=new" },
      { label: "Collections", href: "/collections" },
      { label: "Shop all", href: "/shop" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "About", href: "/about" },
      { label: "Our impact", href: "/impact" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Size guide", href: "/size-guide" },
      { label: "Shipping & returns", href: "/shipping-returns" },
      { label: "FAQs", href: "/faqs" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of sale", href: "/terms" },
    ],
  },
];

/** The owner's own accounts (Required Details doc, November 2026); env can override them. */
export const socialLinks: NavLink[] = [
  { label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/ebonimode_" },
  { label: "TikTok", href: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://www.tiktok.com/@ebonimode" },
].filter((l) => l.href);

/** Customer contact details, as the owner supplied them. */
export const contact = {
  email: "talktoebonimode@gmail.com",
  phone: "+234 809 945 4494",
  phoneHref: "tel:+2348099454494",
  whatsappHref: "https://wa.me/2348099454494",
  address: "25b Oladimeji Alo Street, Lekki Phase I, Lagos",
} as const;

/** Methods Paystack supports for a Nigerian merchant. */
export const paymentMethods = ["Visa", "Mastercard", "Verve", "Bank transfer", "USSD"];

import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/account", "/admin", "/auth", "/cart", "/checkout", "/search", "/wishlist"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

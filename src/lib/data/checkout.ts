import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export type ShippingRate = { id: string; name: string; priceNgn: number; minDays: number | null; maxDays: number | null; countries: string[] };

/** Active delivery rates with the countries their zone serves. Fees are set by the owner. */
export async function getShippingRates(): Promise<ShippingRate[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("shipping");
  try {
    const { data, error } = await createPublicClient()
      .from("shipping_rates")
      .select("id,name,price_ngn,min_days,max_days,is_active,shipping_zones(countries,is_active)")
      .eq("is_active", true)
      .order("price_ngn");
    if (error) throw error;
    type Row = { id: string; name: string; price_ngn: number; min_days: number | null; max_days: number | null; shipping_zones: { countries: string[]; is_active: boolean } | null };
    return ((data ?? []) as unknown as Row[])
      .filter((r) => r.shipping_zones?.is_active)
      .map((r) => ({
        id: r.id,
        name: r.name,
        priceNgn: Number(r.price_ngn),
        minDays: r.min_days,
        maxDays: r.max_days,
        countries: r.shipping_zones?.countries ?? [],
      }));
  } catch (e) {
    console.error("getShippingRates failed", e);
    return [];
  }
}

/** Nigeria's 36 states and the FCT, for the address form. */
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara",
];

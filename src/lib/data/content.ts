import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { SizeGuide } from "./product";

export type DepartmentGuide = SizeGuide & { department: "women" | "men" };

/** The admin-editable size charts, women's first. */
export async function getSizeGuides(): Promise<DepartmentGuide[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("size-guides");
  try {
    const { data, error } = await createPublicClient()
      .from("size_guides")
      .select("department,name,unit,table_data,notes,sort_order")
      .order("sort_order");
    if (error) throw error;
    type Row = { department: "women" | "men"; name: string; unit: string; notes: string | null; table_data: { columns: string[]; rows: (string | null)[][] } };
    return ((data ?? []) as unknown as Row[]).map((g) => ({
      department: g.department,
      name: g.name,
      unit: g.unit,
      columns: g.table_data.columns,
      rows: g.table_data.rows,
      notes: g.notes,
    }));
  } catch (e) {
    console.error("getSizeGuides failed", e);
    return [];
  }
}

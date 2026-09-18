import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

/** Fetches the single site_settings row. Cached per-request via React's fetch dedupe. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").single();
  if (!data) {
    throw new Error("site_settings row missing — did you run the seed migration?");
  }
  return data;
}

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
type AnySupabase = SupabaseClient<any, any, any>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

/** Generates a unique slug for `table`, appending -2, -3, ... on collision. */
export async function uniqueSlug(
  supabase: AnySupabase,
  table: string,
  title: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(title) || "item";
  let candidate = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let query = supabase.from(table).select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query;
    if (!data || data.length === 0) return candidate;
    candidate = `${base}-${n++}`;
  }
}

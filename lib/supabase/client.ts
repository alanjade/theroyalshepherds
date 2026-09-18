"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser client — safe to use in Client Components. Uses the anon key only.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

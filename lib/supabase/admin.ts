import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client. SERVER-ONLY. Bypasses RLS entirely.
// Never import this file from a Client Component or anything that ships to
// the browser — the `server-only` import above makes that a build error.
// Use only for operations that genuinely require elevated privileges:
// e.g. membership number generation edge cases, signed URL issuance,
// admin user provisioning.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

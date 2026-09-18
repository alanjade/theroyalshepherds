import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Server client — use in Server Components, Server Actions, Route Handlers.
// Respects RLS as the current logged-in user (or anon).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no request context — safe to
            // ignore because middleware refreshes the session on navigation.
          }
        },
      },
    }
  );
}

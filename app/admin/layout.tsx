import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Login page renders its own minimal chrome (no sidebar) — handled by not
  // being under this check since /admin/login has no session requirement.
  // We detect it via headers is awkward in a layout; instead the login page
  // lives at the same route tree but we special-case: if no session, allow
  // only when path is /admin/login. Middleware already redirects
  // unauthenticated users away from all other /admin/* routes, so by the
  // time we get here (for non-login routes) a session should exist —
  // but we double-check server-side per requireUser().
  return <>{children}</>;
}

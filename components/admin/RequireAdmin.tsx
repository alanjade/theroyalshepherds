import { requireUser, type Role } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

const ROLE_RANK: Record<Role, number> = { officer: 1, editor: 2, admin: 3, super_admin: 4 };

/**
 * Server wrapper for every /admin/* page except /admin/login: verifies the
 * session (redirecting to login if absent — belt-and-braces alongside
 * middleware), enforces a minimum role, and renders the persistent admin
 * chrome (sidebar/header) around the page content.
 */
export async function RequireAdmin({
  minRole = "officer", children,
}: { minRole?: Role; children: React.ReactNode }) {
  const { profile } = await requireUser();

  if (ROLE_RANK[profile.role as Role] < ROLE_RANK[minRole]) {
    return (
      <AdminShell userName={profile.full_name} role={profile.role}>
        <div className="rounded-xl2 border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-700">You don&apos;t have permission to view this page.</p>
        </div>
      </AdminShell>
    );
  }

  return <AdminShell userName={profile.full_name} role={profile.role}>{children}</AdminShell>;
}

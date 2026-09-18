import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "super_admin" | "admin" | "editor" | "officer";

const ROLE_RANK: Record<Role, number> = {
  officer: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
};

/**
 * Returns the current authenticated user + profile, or null.
 * Use in Server Components / Server Actions / Route Handlers.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  return { user, profile };
}

/** Redirects to /admin/login if not authenticated. Call at the top of protected pages/actions. */
export async function requireUser() {
  const session = await getCurrentUser();
  if (!session) redirect("/admin/login");
  return session;
}

/** Requires the caller's role to be at least `minRole` in the hierarchy. Throws — callers should catch/render an unauthorized state. */
export async function requireRole(minRole: Role) {
  const session = await requireUser();
  const currentRole = session.profile.role as Role;
  if (ROLE_RANK[currentRole] < ROLE_RANK[minRole]) {
    throw new AuthorizationError(`Requires role >= ${minRole}`);
  }
  return session;
}

/** Fine-grained permission check. Extend PERMISSIONS as the app grows. */
const PERMISSIONS: Record<string, Role> = {
  "members.manage": "admin",
  "members.archive": "admin",
  "officers.manage": "admin",
  "ranks.manage": "admin",
  "units.manage": "admin",
  "events.manage": "editor",
  "news.manage": "editor",
  "gallery.manage": "editor",
  "resources.manage": "editor",
  "applications.review": "admin",
  "applications.approve": "admin",
  "messages.manage": "officer",
  "settings.manage": "admin",
  "audit.view": "admin",
  "profiles.manage": "super_admin",
};

export async function requirePermission(permission: keyof typeof PERMISSIONS) {
  const minRole = PERMISSIONS[permission] ?? "super_admin";
  return requireRole(minRole);
}

export class AuthorizationError extends Error {}

/** Records an administrative action. Call from Server Actions after a mutation succeeds. */
export async function logAudit(
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createClient();
  await supabase.rpc("log_audit_event", {
    p_action: action,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_metadata: metadata,
  });
}

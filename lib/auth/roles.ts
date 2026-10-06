// Client-safe role helpers (no "server-only" import) shared by server and client code.

export type Role = "super_admin" | "admin" | "editor" | "officer";

export const ROLE_RANK: Record<Role, number> = {
  officer: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
};

/** True if `role` is at least `minRole` in the hierarchy. */
export function hasRole(role: string | null | undefined, minRole: Role): boolean {
  if (!role || !(role in ROLE_RANK)) return false;
  return ROLE_RANK[role as Role] >= ROLE_RANK[minRole];
}

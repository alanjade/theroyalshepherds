"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission, logAudit } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true; id?: string } | { success: false; error: string };

// super_admin is deliberately not grantable from the UI.
const GRANTABLE_ROLES = ["admin", "editor", "officer"] as const;
type GrantableRole = (typeof GRANTABLE_ROLES)[number];

const isGrantable = (r: string): r is GrantableRole => (GRANTABLE_ROLES as readonly string[]).includes(r);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function serviceKeyMissing() {
  return !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

/** Gives an existing member a staff login. Only super admins can do this. */
export async function grantAccess(formData: FormData): Promise<ActionResult> {
  await requirePermission("profiles.manage");
  if (serviceKeyMissing()) {
    return { success: false, error: "SUPABASE_SERVICE_ROLE_KEY is not set on the server, so accounts can't be created yet." };
  }

  const memberId = String(formData.get("member_id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!memberId) return { success: false, error: "Choose a member." };
  if (!EMAIL_RE.test(email)) return { success: false, error: "Enter a valid email address." };
  if (!isGrantable(role)) return { success: false, error: "Choose a role." };
  if (password.length < 8) return { success: false, error: "The password must be at least 8 characters." };

  const supabase = await createClient();
  const { data: member } = await supabase.from("members").select("id, full_name").eq("id", memberId).single();
  if (!member) return { success: false, error: "Member not found." };

  const { data: existing } = await supabase.from("profiles").select("id").eq("member_id", memberId).maybeSingle();
  if (existing) return { success: false, error: "This member already has an account." };

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: member.full_name },
  });
  if (createError || !created.user) {
    const taken = /already|registered|exists/i.test(createError?.message ?? "");
    return { success: false, error: taken ? "An account with this email already exists." : "Could not create the account." };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id, full_name: member.full_name, email, role, member_id: memberId,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id); // don't leave a login with no profile
    return { success: false, error: "Could not set up the profile. Nothing was created." };
  }

  await logAudit("access_granted", "profiles", created.user.id, { member_id: memberId, role });
  revalidatePath("/admin/users");
  return { success: true, id: created.user.id };
}

async function loadTarget(profileId: string, actingUserId: string) {
  if (profileId === actingUserId) return { error: "You can't change your own access." } as const;
  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("id, role").eq("id", profileId).single();
  if (!target) return { error: "Account not found." } as const;
  if (target.role === "super_admin") return { error: "Super admin accounts can't be changed here." } as const;
  return { admin, target } as const;
}

export async function changeAccessRole(profileId: string, role: string): Promise<ActionResult> {
  const { user } = await requirePermission("profiles.manage");
  if (serviceKeyMissing()) return { success: false, error: "SUPABASE_SERVICE_ROLE_KEY is not set on the server." };
  if (!isGrantable(role)) return { success: false, error: "Invalid role." };
  const t = await loadTarget(profileId, user.id);
  if ("error" in t) return { success: false, error: t.error as string };
  const { error } = await t.admin.from("profiles").update({ role }).eq("id", profileId);
  if (error) return { success: false, error: "Could not change the role." };
  await logAudit("access_role_changed", "profiles", profileId, { role });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function resetAccessPassword(profileId: string, password: string): Promise<ActionResult> {
  const { user } = await requirePermission("profiles.manage");
  if (serviceKeyMissing()) return { success: false, error: "SUPABASE_SERVICE_ROLE_KEY is not set on the server." };
  if (password.length < 8) return { success: false, error: "The password must be at least 8 characters." };
  const t = await loadTarget(profileId, user.id);
  if ("error" in t) return { success: false, error: t.error as string };
  const { error } = await t.admin.auth.admin.updateUserById(profileId, { password });
  if (error) return { success: false, error: "Could not reset the password." };
  await logAudit("access_password_reset", "profiles", profileId);
  return { success: true };
}

/** Removes the login. The member record is untouched. */
export async function revokeAccess(profileId: string): Promise<ActionResult> {
  const { user } = await requirePermission("profiles.manage");
  if (serviceKeyMissing()) return { success: false, error: "SUPABASE_SERVICE_ROLE_KEY is not set on the server." };
  const t = await loadTarget(profileId, user.id);
  if ("error" in t) return { success: false, error: t.error as string };
  const { error } = await t.admin.auth.admin.deleteUser(profileId);
  if (error) return { success: false, error: "Could not remove the account." };
  await logAudit("access_revoked", "profiles", profileId);
  revalidatePath("/admin/users");
  return { success: true };
}

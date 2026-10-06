"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, logAudit } from "@/lib/auth";

type ActionResult = { success: true } | { success: false; error: string };

/** Lets the signed-in user choose their own password and clears the "must change" flag. */
export async function changeOwnPassword(password: string, confirm: string): Promise<ActionResult> {
  const { user } = await requireUser();
  if (password.length < 8) return { success: false, error: "The password must be at least 8 characters." };
  if (password !== confirm) return { success: false, error: "The two passwords don't match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    const same = /different|same/i.test(error.message);
    return { success: false, error: same ? "Choose a password different from your current one." : "Could not change the password. Please try again." };
  }

  await supabase.from("profiles").update({ must_change_password: false }).eq("id", user.id);
  await logAudit("password_changed", "profiles", user.id);
  return { success: true };
}

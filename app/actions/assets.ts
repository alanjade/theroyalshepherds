"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission, logAudit } from "@/lib/auth";
import { assetSchema, checkoutSchema, checkinSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true; id?: string } | { success: false; error: string };

function refresh(assetId?: string) {
  revalidatePath("/admin/assets");
  if (assetId) revalidatePath(`/admin/assets/${assetId}`);
  revalidatePath("/admin");
}

function clean<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v]));
}

// ---------------------------------------------------------------------------
// Inventory (admin+)
// ---------------------------------------------------------------------------
export async function createAsset(formData: FormData): Promise<ActionResult> {
  await requirePermission("assets.manage");
  const parsed = assetSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };

  const supabase = await createClient();
  const { data, error } = await supabase.from("assets").insert(clean(parsed.data)).select("id").single();
  if (error) {
    return { success: false, error: error.code === "23505" ? "That asset tag is already in use." : "Could not add the asset." };
  }
  await logAudit("asset_created", "assets", data.id, { name: parsed.data.name });
  refresh();
  return { success: true, id: data.id };
}

export async function updateAsset(assetId: string, formData: FormData): Promise<ActionResult> {
  await requirePermission("assets.manage");
  const parsed = assetSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };

  const supabase = await createClient();
  const values = clean(parsed.data);
  if (!values.asset_tag) delete values.asset_tag; // keep the existing tag
  const { error } = await supabase.from("assets").update(values).eq("id", assetId);
  if (error) {
    return { success: false, error: error.code === "23505" ? "That asset tag is already in use." : "Could not update the asset." };
  }
  await logAudit("asset_updated", "assets", assetId, { name: parsed.data.name });
  refresh(assetId);
  return { success: true };
}

/** Admin-only status changes that are not loans: available / maintenance / retired. */
export async function setAssetStatus(assetId: string, status: string): Promise<ActionResult> {
  await requirePermission("assets.manage");
  if (!["available", "maintenance", "retired"].includes(status)) return { success: false, error: "Invalid status." };

  const supabase = await createClient();
  const { data: asset } = await supabase.from("assets").select("status").eq("id", assetId).single();
  if (!asset) return { success: false, error: "Asset not found." };
  if (asset.status === "checked_out") return { success: false, error: "Check the asset in before changing its status." };

  const { error } = await supabase.from("assets").update({ status }).eq("id", assetId);
  if (error) return { success: false, error: "Could not update the asset." };
  await logAudit("asset_status_changed", "assets", assetId, { status });
  refresh(assetId);
  return { success: true };
}

export async function deleteAsset(assetId: string): Promise<ActionResult> {
  await requirePermission("assets.manage");
  const supabase = await createClient();
  const { data: asset } = await supabase.from("assets").select("status").eq("id", assetId).single();
  if (asset?.status === "checked_out") return { success: false, error: "Check the asset in before deleting it." };

  const { error } = await supabase.from("assets").delete().eq("id", assetId);
  if (error) return { success: false, error: "Could not delete the asset." };
  await logAudit("asset_deleted", "assets", assetId);
  refresh();
  return { success: true };
}

// ---------------------------------------------------------------------------
// Check out / check in (officer+)
// ---------------------------------------------------------------------------
export async function checkOutAsset(formData: FormData): Promise<ActionResult> {
  await requirePermission("assets.checkout");
  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  const d = parsed.data;

  if (!d.member_id && !d.borrower_name?.trim()) {
    return { success: false, error: "Choose a member or enter a borrower name." };
  }
  if (d.due_date && d.due_date < new Date().toISOString().slice(0, 10)) {
    return { success: false, error: "The due date can't be in the past." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("checkout_asset", {
    p_asset_id: d.asset_id,
    p_member_id: d.member_id || null,
    p_borrower_name: d.borrower_name ?? "",
    p_due_date: d.due_date || null,
    p_condition: d.condition_out,
    p_notes: d.notes_out ?? "",
  });
  if (error) return { success: false, error: error.message || "Could not check out the asset." };

  await logAudit("asset_checked_out", "assets", d.asset_id, { checkout_id: data, member_id: d.member_id || null, borrower: d.borrower_name || null, due_date: d.due_date || null });
  refresh(d.asset_id);
  return { success: true, id: data as string };
}

export async function checkInAsset(formData: FormData): Promise<ActionResult> {
  await requirePermission("assets.checkout");
  const raw = Object.fromEntries(formData.entries());
  const parsed = checkinSchema.safeParse({ ...raw, needs_maintenance: raw.needs_maintenance === "on" });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  const d = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("checkin_asset", {
    p_asset_id: d.asset_id,
    p_condition: d.condition_in,
    p_notes: d.notes_in ?? "",
    p_needs_maintenance: d.needs_maintenance,
  });
  if (error) return { success: false, error: error.message || "Could not check in the asset." };

  await logAudit("asset_checked_in", "assets", d.asset_id, { checkout_id: data, condition: d.condition_in, needs_maintenance: d.needs_maintenance });
  refresh(d.asset_id);
  return { success: true, id: data as string };
}

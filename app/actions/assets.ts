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

function duplicateMessage(error: { code?: string; message?: string }) {
  if (error.code !== "23505") return null;
  return error.message?.includes("serial") ? "That serial number is already registered." : "That asset tag is already in use.";
}

async function openQuantity(supabase: Awaited<ReturnType<typeof createClient>>, assetId: string) {
  const { data } = await supabase.from("asset_checkouts").select("quantity").eq("asset_id", assetId).is("checked_in_at", null);
  return (data ?? []).reduce((n: number, l: any) => n + l.quantity, 0);
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

  // Individual items are always 1 unit with an optional serial; bulk stock has a quantity and no serial.
  const values = clean({
    ...parsed.data,
    quantity: parsed.data.tracking === "individual" ? 1 : parsed.data.quantity,
    serial_number: parsed.data.tracking === "bulk" ? "" : parsed.data.serial_number,
  });

  const supabase = await createClient();
  const { data, error } = await supabase.from("assets").insert(values).select("id").single();
  if (error) return { success: false, error: duplicateMessage(error) ?? "Could not add the asset." };
  await logAudit("asset_created", "assets", data.id, { name: parsed.data.name });
  refresh();
  return { success: true, id: data.id };
}

export async function updateAsset(assetId: string, formData: FormData): Promise<ActionResult> {
  await requirePermission("assets.manage");
  const parsed = assetSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };

  const supabase = await createClient();
  const { data: existing } = await supabase.from("assets").select("tracking, status").eq("id", assetId).single();
  if (!existing) return { success: false, error: "Asset not found." };

  // The type (individual / bulk) is fixed once created.
  const bulk = existing.tracking === "bulk";
  const out = await openQuantity(supabase, assetId);
  const quantity = bulk ? parsed.data.quantity : 1;
  if (bulk && quantity < out) {
    return { success: false, error: `${out} unit${out === 1 ? " is" : "s are"} currently checked out, so the total can't be lower than that.` };
  }

  const values = clean({ ...parsed.data, quantity, serial_number: bulk ? "" : parsed.data.serial_number });
  delete values.tracking;
  if (!values.asset_tag) delete values.asset_tag; // keep the existing tag
  // Keep the status in step with the new total (e.g. more stock added while everything was out).
  if (bulk && existing.status !== "maintenance" && existing.status !== "retired") {
    values.status = out >= quantity && quantity > 0 ? "checked_out" : "available";
  }
  const { error } = await supabase.from("assets").update(values).eq("id", assetId);
  if (error) return { success: false, error: duplicateMessage(error) ?? "Could not update the asset." };
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
  if ((await openQuantity(supabase, assetId)) > 0) return { success: false, error: "Check in everything that is out before changing the status." };

  const { error } = await supabase.from("assets").update({ status }).eq("id", assetId);
  if (error) return { success: false, error: "Could not update the asset." };
  await logAudit("asset_status_changed", "assets", assetId, { status });
  refresh(assetId);
  return { success: true };
}

export async function deleteAsset(assetId: string): Promise<ActionResult> {
  await requirePermission("assets.manage");
  const supabase = await createClient();
  if ((await openQuantity(supabase, assetId)) > 0) return { success: false, error: "Check in everything that is out before deleting this asset." };

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
    p_quantity: d.quantity,
  });
  if (error) return { success: false, error: error.message || "Could not check out the asset." };

  await logAudit("asset_checked_out", "assets", d.asset_id, { checkout_id: data, quantity: d.quantity, member_id: d.member_id || null, borrower: d.borrower_name || null, due_date: d.due_date || null });
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
  if (d.written_off > d.quantity) return { success: false, error: "Written-off units can't exceed the quantity returned." };
  const { data, error } = await supabase.rpc("checkin_asset", {
    p_checkout_id: d.checkout_id,
    p_quantity: d.quantity,
    p_written_off: d.written_off,
    p_condition: d.condition_in,
    p_notes: d.notes_in ?? "",
    p_needs_maintenance: d.needs_maintenance,
  });
  if (error) return { success: false, error: error.message || "Could not check in the asset." };

  await logAudit("asset_checked_in", "assets", d.asset_id, { checkout_id: d.checkout_id, quantity: d.quantity, written_off: d.written_off, condition: d.condition_in, needs_maintenance: d.needs_maintenance });
  refresh(d.asset_id);
  return { success: true, id: data as string };
}

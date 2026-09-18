"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission, requireRole, logAudit } from "@/lib/auth";
import { uniqueSlug } from "@/lib/utils/slug";
import { parseCsv } from "@/lib/utils/csv";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import { eventSchema, newsSchema, memberSchema } from "@/lib/validation/schemas";
import { sendEmail, templates } from "@/lib/email";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true; id?: string } | { success: false; error: string };

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
export async function createEvent(formData: FormData): Promise<ActionResult> {
  await requirePermission("events.manage");
  const raw = Object.fromEntries(formData.entries());
  const parsed = eventSchema.safeParse({ ...raw, registration_enabled: raw.registration_enabled === "on" });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };

  const supabase = await createClient();
  const slug = await uniqueSlug(supabase, "events", parsed.data.title);
  const { data, error } = await supabase.from("events").insert({
    ...parsed.data,
    slug,
    end_date: parsed.data.end_date || null,
    start_time: parsed.data.start_time || null,
    end_time: parsed.data.end_time || null,
    registration_deadline: parsed.data.registration_deadline || null,
  }).select("id").single();
  if (error) return { success: false, error: "Could not create event." };

  await logAudit("event_created", "events", data.id, { title: parsed.data.title });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { success: true, id: data.id };
}

export async function updateEventStatus(eventId: string, status: string): Promise<ActionResult> {
  await requirePermission("events.manage");
  const supabase = await createClient();
  const { error } = await supabase.from("events").update({ status }).eq("id", eventId);
  if (error) return { success: false, error: "Could not update event." };
  await logAudit("event_updated", "events", eventId, { status });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { success: true };
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  await requirePermission("events.manage");
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return { success: false, error: "Could not delete event." };
  await logAudit("event_deleted", "events", eventId);
  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { success: true };
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------
export async function createNews(formData: FormData): Promise<ActionResult> {
  const { profile } = await requirePermission("news.manage");
  const raw = Object.fromEntries(formData.entries());
  const parsed = newsSchema.safeParse({ ...raw, featured: raw.featured === "on" });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };

  const supabase = await createClient();
  const slug = await uniqueSlug(supabase, "news", parsed.data.title);
  const { data, error } = await supabase.from("news").insert({
    ...parsed.data,
    slug,
    content: parsed.data.content ? sanitizeHtml(parsed.data.content) : null,
    author_id: profile.id,
    published_at: parsed.data.status === "published" ? new Date().toISOString() : null,
  }).select("id").single();
  if (error) return { success: false, error: "Could not create article." };

  await logAudit("news_created", "news", data.id, { title: parsed.data.title });
  if (parsed.data.status === "published") await logAudit("news_published", "news", data.id);
  revalidatePath("/admin/news");
  revalidatePath("/news");
  return { success: true, id: data.id };
}

export async function deleteNews(id: string): Promise<ActionResult> {
  await requirePermission("news.manage");
  const supabase = await createClient();
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) return { success: false, error: "Could not delete article." };
  await logAudit("news_deleted", "news", id);
  revalidatePath("/admin/news");
  revalidatePath("/news");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------
export async function createMember(formData: FormData): Promise<ActionResult> {
  await requirePermission("members.manage");
  const raw = Object.fromEntries(formData.entries());
  const parsed = memberSchema.safeParse({ ...raw, public_profile: raw.public_profile === "on" });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };

  // Membership numbers must be generated server-side, atomically, never by the client.
  const supabase = await createClient();
  const { data: numberResult, error: numberError } = await supabase.rpc("generate_membership_number");
  if (numberError || !numberResult) return { success: false, error: "Could not generate membership number." };

  const { data, error } = await supabase.from("members").insert({
    ...parsed.data,
    membership_number: numberResult,
    rank_id: parsed.data.rank_id || null,
    unit_id: parsed.data.unit_id || null,
    date_of_birth: parsed.data.date_of_birth || null,
  }).select("id").single();
  if (error) return { success: false, error: "Could not create member." };

  await logAudit("member_created", "members", data.id, { membership_number: numberResult });
  revalidatePath("/admin/members");
  return { success: true, id: data.id };
}

export type BulkImportResult = {
  success: true;
  created: number;
  errors: { row: number; name: string; message: string }[];
} | { success: false; error: string };

/**
 * Bulk-creates members from an uploaded CSV. Each row is validated and
 * inserted independently — one bad row is reported and skipped rather than
 * aborting the whole batch. Membership numbers are still generated
 * server-side per row via the same RPC createMember uses, so numbering
 * stays consistent and race-free whether a member was added one at a time
 * or via import.
 *
 * Expected columns (header row required): full_name, phone, email,
 * date_of_birth, gender, address, church, guardian_name, guardian_phone,
 * emergency_contact, rank, unit, public_profile, short_bio, occupation.
 * `rank` and `unit` are matched by name (case-insensitive) against existing
 * ranks/units — unmatched names are left blank rather than failing the row,
 * since rank/unit are optional on a member.
 */
export async function bulkCreateMembers(formData: FormData): Promise<BulkImportResult> {
  await requirePermission("members.manage");

  const file = formData.get("csv_file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please choose a CSV file." };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: "File is too large (2MB limit)." };
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return { success: false, error: "No data rows found in the CSV." };
  }
  if (rows.length > 500) {
    return { success: false, error: "Please import 500 members or fewer per file." };
  }

  const supabase = await createClient();
  const [{ data: ranks }, { data: units }] = await Promise.all([
    supabase.from("ranks").select("id, name"),
    supabase.from("units").select("id, name"),
  ]);
  const rankByName = new Map((ranks ?? []).map((r) => [r.name.trim().toLowerCase(), r.id]));
  const unitByName = new Map((units ?? []).map((u) => [u.name.trim().toLowerCase(), u.id]));

  const errors: { row: number; name: string; message: string }[] = [];
  let created = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const rowNumber = i + 2; // +1 for header, +1 for 1-indexing
    const name = row.full_name || "(unnamed row)";

    const parsed = memberSchema.safeParse({
      full_name: row.full_name,
      status: "active",
      public_profile: /^(yes|true|1)$/i.test(row.public_profile ?? ""),
      short_bio: row.short_bio || "",
      occupation: row.occupation || "",
      phone: row.phone || "",
      email: row.email || "",
      date_of_birth: row.date_of_birth || "",
      gender: row.gender || "",
      address: row.address || "",
      church: row.church || "",
      guardian_name: row.guardian_name || "",
      guardian_phone: row.guardian_phone || "",
      emergency_contact: row.emergency_contact || "",
    });

    if (!parsed.success) {
      errors.push({ row: rowNumber, name, message: parsed.error.issues[0]?.message ?? "Invalid data." });
      continue;
    }

    const { data: numberResult, error: numberError } = await supabase.rpc("generate_membership_number");
    if (numberError || !numberResult) {
      errors.push({ row: rowNumber, name, message: "Could not generate a membership number." });
      continue;
    }

    const rankId = row.rank ? rankByName.get(row.rank.trim().toLowerCase()) ?? null : null;
    const unitId = row.unit ? unitByName.get(row.unit.trim().toLowerCase()) ?? null : null;

    const { error: insertError } = await supabase.from("members").insert({
      ...parsed.data,
      membership_number: numberResult,
      rank_id: rankId,
      unit_id: unitId,
      date_of_birth: parsed.data.date_of_birth || null,
    });

    if (insertError) {
      errors.push({ row: rowNumber, name, message: "Could not save this member." });
      continue;
    }
    created++;
  }

  if (created > 0) {
    await logAudit("member_created", "members", null, { source: "bulk_import", created, failed: errors.length });
    revalidatePath("/admin/members");
  }

  return { success: true, created, errors };
}

export async function archiveMember(memberId: string): Promise<ActionResult> {
  await requirePermission("members.archive");
  const supabase = await createClient();
  const { error } = await supabase.from("members").update({ status: "archived" }).eq("id", memberId);
  if (error) return { success: false, error: "Could not archive member." };
  await logAudit("member_archived", "members", memberId);
  revalidatePath("/admin/members");
  return { success: true };
}

export async function restoreMember(memberId: string): Promise<ActionResult> {
  await requirePermission("members.archive");
  const supabase = await createClient();
  const { error } = await supabase.from("members").update({ status: "active" }).eq("id", memberId);
  if (error) return { success: false, error: "Could not restore member." };
  await logAudit("member_updated", "members", memberId, { status: "active" });
  revalidatePath("/admin/members");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Membership applications
// ---------------------------------------------------------------------------
export async function reviewApplication(id: string, status: "reviewing" | "rejected", notes?: string): Promise<ActionResult> {
  await requirePermission("applications.review");
  const supabase = await createClient();
  const { error } = await supabase.from("membership_applications").update({ status, reviewer_notes: notes || null }).eq("id", id);
  if (error) return { success: false, error: "Could not update application." };
  await logAudit(status === "rejected" ? "application_rejected" : "application_reviewed", "membership_applications", id);
  revalidatePath("/admin/applications");
  return { success: true };
}

export async function approveApplication(id: string): Promise<ActionResult> {
  await requirePermission("applications.approve");
  const supabase = await createClient();

  // Runs the atomic, server-side workflow: validate -> create member ->
  // generate membership number -> mark application approved. Defined as a
  // SECURITY DEFINER Postgres function so it can't be raced or partially
  // applied from the client.
  const { data: memberId, error } = await supabase.rpc("approve_application", { p_application_id: id });
  if (error) return { success: false, error: error.message || "Could not approve application." };

  const { data: application } = await supabase.from("membership_applications").select("email, full_name").eq("id", id).single();
  const { data: member } = await supabase.from("members").select("membership_number").eq("id", memberId).single();
  if (application && member) {
    await sendEmail({ to: application.email, ...templates.applicationApproved(application.full_name, member.membership_number) });
  }

  revalidatePath("/admin/applications");
  revalidatePath("/admin/members");
  return { success: true, id: memberId };
}

// ---------------------------------------------------------------------------
// Contact messages
// ---------------------------------------------------------------------------
export async function markMessageRead(id: string, isRead: boolean): Promise<ActionResult> {
  await requirePermission("messages.manage");
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
  if (error) return { success: false, error: "Could not update message." };
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function archiveMessage(id: string): Promise<ActionResult> {
  await requirePermission("messages.manage");
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").update({ is_archived: true }).eq("id", id);
  if (error) return { success: false, error: "Could not archive message." };
  revalidatePath("/admin/messages");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
export async function updateSiteSettings(formData: FormData): Promise<ActionResult> {
  await requirePermission("settings.manage");
  const supabase = await createClient();
  const raw = Object.fromEntries(formData.entries());

  const stats = [0, 1, 2, 3]
    .map((i) => ({ label: (raw[`stat_label_${i}`] as string)?.trim(), value: (raw[`stat_value_${i}`] as string)?.trim() }))
    .filter((s) => s.label && s.value);

  const homepage = {
    hero_title: raw.hero_title, hero_subtitle: raw.hero_subtitle, hero_image: raw.hero_image || undefined,
    cta_primary: raw.cta_primary, cta_secondary: raw.cta_secondary,
    stats,
  };
  const keywords = ((raw.seo_keywords as string) ?? "")
    .split(",").map((k) => k.trim()).filter(Boolean);

  const seo = {
    site_title: raw.seo_title, meta_description: raw.seo_description,
    keywords, og_image: raw.seo_og_image || undefined,
  };

  const { error } = await supabase.from("site_settings").update({
    company_name: raw.company_name, company_motto: raw.company_motto, company_description: raw.company_description,
    address: raw.address || null, phone: raw.phone || null, email: raw.email || null, whatsapp: raw.whatsapp || null,
    facebook_url: raw.facebook_url || null, instagram_url: raw.instagram_url || null, youtube_url: raw.youtube_url || null,
    tiktok_url: raw.tiktok_url || null, x_url: raw.x_url || null,
    homepage, seo,
  }).eq("id", true);
  if (error) return { success: false, error: "Could not update settings." };

  await logAudit("settings_updated", "site_settings", null);
  revalidatePath("/", "layout");
  return { success: true };
}

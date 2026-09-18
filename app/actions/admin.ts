"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission, requireRole, logAudit } from "@/lib/auth";
import { uniqueSlug } from "@/lib/utils/slug";
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

  const homepage = {
    hero_title: raw.hero_title, hero_subtitle: raw.hero_subtitle,
    cta_primary: raw.cta_primary, cta_secondary: raw.cta_secondary,
  };
  const seo = { site_title: raw.seo_title, meta_description: raw.seo_description };

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

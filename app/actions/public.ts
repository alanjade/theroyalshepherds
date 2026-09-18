"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  contactMessageSchema, membershipApplicationSchema, eventRegistrationSchema,
} from "@/lib/validation/schemas";
import { sendEmail, templates } from "@/lib/email";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

// Simple in-memory rate limit (best-effort; for production scale, back this
// with Redis or a Supabase table keyed by IP + route).
const rateLimitHits = new Map<string, number[]>();
function isRateLimited(key: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const hits = (rateLimitHits.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  rateLimitHits.set(key, hits);
  return hits.length > max;
}

export async function submitContactMessage(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactMessageSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Please check the form for errors." };
  if (parsed.data.company_website) return { success: false, error: "Submission rejected." }; // honeypot
  if (isRateLimited(`contact:${parsed.data.email}`)) return { success: false, error: "Too many submissions. Please try again later." };

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || null,
    subject: parsed.data.subject || null, message: parsed.data.message,
  });
  if (error) return { success: false, error: "Something went wrong. Please try again." };
  return { success: true };
}

export async function submitMembershipApplication(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = membershipApplicationSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Please check the form for errors." };
  if (isRateLimited(`apply:${parsed.data.email}`)) return { success: false, error: "Too many submissions. Please try again later." };

  const supabase = await createClient();
  const { error } = await supabase.from("membership_applications").insert(parsed.data);
  if (error) return { success: false, error: "Something went wrong. Please try again." };

  await sendEmail({ to: parsed.data.email, ...templates.applicationReceived(parsed.data.full_name) });
  return { success: true };
}

export async function registerForEvent(eventId: string, formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = eventRegistrationSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Please check the form for errors." };
  if (isRateLimited(`register:${parsed.data.email}`)) return { success: false, error: "Too many attempts. Please try again later." };

  // Use the anon client so RLS's registrations_public_insert policy (which
  // re-checks the event is published/open) is the actual source of truth.
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("id, title, registration_capacity").eq("id", eventId).single();
  if (!event) return { success: false, error: "Event not found." };

  if (event.registration_capacity) {
    const { count } = await supabase.from("event_registrations").select("id", { count: "exact", head: true }).eq("event_id", eventId);
    if ((count ?? 0) >= event.registration_capacity) return { success: false, error: "This event is full." };
  }

  const { error } = await supabase.from("event_registrations").insert({
    event_id: eventId, name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || null,
    membership_status: parsed.data.membership_status, member_id: parsed.data.member_id || null,
    notes: parsed.data.notes || null,
  });
  if (error) {
    if (error.code === "23505") return { success: false, error: "You have already registered for this event with this email." };
    return { success: false, error: "Something went wrong. Please try again." };
  }

  await sendEmail({ to: parsed.data.email, ...templates.eventRegistrationConfirmed(parsed.data.name, event.title) });
  revalidatePath(`/events`);
  return { success: true };
}

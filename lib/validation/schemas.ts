import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  subject: z.string().max(200).optional().or(z.literal("")),
  message: z.string().min(10).max(4000),
  // Honeypot field for basic bot protection — must stay empty
  company_website: z.string().max(0).optional().or(z.literal("")),
});

export const membershipApplicationSchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(6).max(30),
  date_of_birth: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  gender: z.enum(["male", "female"]),
  address: z.string().min(5).max(500),
  church: z.string().min(2).max(200),
  parent_or_guardian_name: z.string().max(120).optional().or(z.literal("")),
  parent_or_guardian_phone: z.string().max(30).optional().or(z.literal("")),
  emergency_contact: z.string().max(200).optional().or(z.literal("")),
  previous_experience: z.string().max(2000).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
});

export const eventRegistrationSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  membership_status: z.enum(["member", "non_member"]),
  member_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const eventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(10000).optional().or(z.literal("")),
  short_description: z.string().max(300).optional().or(z.literal("")),
  start_date: z.string(),
  end_date: z.string().optional().or(z.literal("")),
  start_time: z.string().optional().or(z.literal("")),
  end_time: z.string().optional().or(z.literal("")),
  location: z.string().max(300).optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  registration_enabled: z.boolean().default(false),
  registration_deadline: z.string().optional().or(z.literal("")),
  registration_capacity: z.coerce.number().int().positive().optional().nullable(),
  status: z.enum(["draft", "published", "cancelled", "completed"]).default("draft"),
});

export const newsSchema = z.object({
  title: z.string().min(3).max(200),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  content: z.string().max(50000).optional().or(z.literal("")),
  category_id: z.string().uuid().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
});

export const memberSchema = z.object({
  full_name: z.string().min(2).max(120),
  status: z.enum(["active", "inactive", "suspended", "archived"]).default("active"),
  public_profile: z.boolean().default(false),
  short_bio: z.string().max(1000).optional().or(z.literal("")),
  rank_id: z.string().uuid().optional().nullable(),
  unit_id: z.string().uuid().optional().nullable(),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  gender: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  church: z.string().max(200).optional().or(z.literal("")),
  guardian_name: z.string().max(120).optional().or(z.literal("")),
  guardian_phone: z.string().max(30).optional().or(z.literal("")),
  emergency_contact: z.string().max(200).optional().or(z.literal("")),
});

// Hand-written types matching supabase/migrations/0001_init_schema.sql.
// Once the project is linked, regenerate with:
//   npx supabase gen types typescript --project-id <ref> > types/database.ts
// and re-apply any manual additions below.

export type Role = "super_admin" | "admin" | "editor" | "officer";
export type MemberStatus = "active" | "inactive" | "suspended" | "archived";
export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type NewsStatus = "draft" | "published" | "archived";
export type ApplicationStatus = "pending" | "reviewing" | "approved" | "rejected";
export type ResourceVisibility = "public" | "members" | "admin";
export type ResourceCategory =
  | "Forms" | "Training" | "Notices" | "Guidelines" | "Publications" | "Documents" | "Other";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; full_name: string; email: string; avatar_url: string | null;
          role: Role; member_id: string | null; created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; full_name: string; email: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      site_settings: {
        Row: {
          id: boolean; company_name: string; company_motto: string; company_description: string;
          logo_url: string | null; favicon_url: string | null; address: string | null; phone: string | null;
          email: string | null; whatsapp: string | null; facebook_url: string | null; instagram_url: string | null;
          youtube_url: string | null; tiktok_url: string | null; x_url: string | null; timezone: string;
          homepage: Record<string, unknown>; seo: Record<string, unknown>; updated_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
      };
      ranks: {
        Row: { id: string; name: string; short_name: string | null; description: string | null; display_order: number; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["ranks"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["ranks"]["Row"]>;
      };
      units: {
        Row: { id: string; name: string; description: string | null; display_order: number; active: boolean; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["units"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["units"]["Row"]>;
      };
      members: {
        Row: {
          id: string; membership_number: string; full_name: string; photo_url: string | null;
          rank_id: string | null; unit_id: string | null; status: MemberStatus; public_profile: boolean;
          short_bio: string | null; occupation: string | null; phone: string | null; email: string | null; date_of_birth: string | null;
          gender: string | null; address: string | null; church: string | null; guardian_name: string | null;
          guardian_phone: string | null; emergency_contact: string | null; private_notes: string | null;
          joined_at: string; created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["members"]["Row"]> & { membership_number: string; full_name: string };
        Update: Partial<Database["public"]["Tables"]["members"]["Row"]>;
      };
      officer_positions: {
        Row: { id: string; title: string; display_order: number; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["officer_positions"]["Row"]> & { title: string };
        Update: Partial<Database["public"]["Tables"]["officer_positions"]["Row"]>;
      };
      officers: {
        Row: {
          id: string; member_id: string; position_id: string; rank_id: string | null; start_date: string;
          end_date: string | null; photo_url: string | null; public_visible: boolean; display_order: number;
          created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["officers"]["Row"]> & { member_id: string; position_id: string };
        Update: Partial<Database["public"]["Tables"]["officers"]["Row"]>;
      };
      events: {
        Row: {
          id: string; title: string; slug: string; description: string | null; short_description: string | null;
          featured_image: string | null; start_date: string; end_date: string | null; start_time: string | null;
          end_time: string | null; location: string | null; category: string | null; registration_enabled: boolean;
          registration_deadline: string | null; registration_capacity: number | null; status: EventStatus;
          created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & { title: string; slug: string; start_date: string };
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
      };
      event_registrations: {
        Row: {
          id: string; event_id: string; name: string; email: string; phone: string | null;
          membership_status: string | null; member_id: string | null; notes: string | null; created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["event_registrations"]["Row"]> & { event_id: string; name: string; email: string };
        Update: Partial<Database["public"]["Tables"]["event_registrations"]["Row"]>;
      };
      news_categories: {
        Row: { id: string; name: string; slug: string; display_order: number };
        Insert: Partial<Database["public"]["Tables"]["news_categories"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["news_categories"]["Row"]>;
      };
      news: {
        Row: {
          id: string; title: string; slug: string; excerpt: string | null; content: string | null;
          featured_image: string | null; category_id: string | null; author_id: string | null; status: NewsStatus;
          featured: boolean; published_at: string | null; created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["news"]["Row"]> & { title: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["news"]["Row"]>;
      };
      gallery_albums: {
        Row: {
          id: string; title: string; slug: string; description: string | null; cover_image: string | null;
          event_id: string | null; album_date: string | null; published: boolean; created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["gallery_albums"]["Row"]> & { title: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["gallery_albums"]["Row"]>;
      };
      gallery_photos: {
        Row: { id: string; album_id: string; image_url: string; caption: string | null; alt_text: string | null; display_order: number; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["gallery_photos"]["Row"]> & { album_id: string; image_url: string };
        Update: Partial<Database["public"]["Tables"]["gallery_photos"]["Row"]>;
      };
      membership_applications: {
        Row: {
          id: string; full_name: string; email: string; phone: string | null; date_of_birth: string | null;
          gender: string | null; address: string | null; church: string | null; parent_or_guardian_name: string | null;
          parent_or_guardian_phone: string | null; emergency_contact: string | null; previous_experience: string | null;
          message: string | null; status: ApplicationStatus; reviewer_notes: string | null; reviewed_by: string | null;
          member_id: string | null; created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["membership_applications"]["Row"]> & { full_name: string; email: string };
        Update: Partial<Database["public"]["Tables"]["membership_applications"]["Row"]>;
      };
      resources: {
        Row: {
          id: string; title: string; description: string | null; category: ResourceCategory; file_url: string;
          file_name: string; file_size: number | null; visibility: ResourceVisibility; uploaded_by: string | null;
          created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["resources"]["Row"]> & { title: string; category: ResourceCategory; file_url: string; file_name: string };
        Update: Partial<Database["public"]["Tables"]["resources"]["Row"]>;
      };
      contact_messages: {
        Row: { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; is_read: boolean; is_archived: boolean; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]> & { name: string; email: string; message: string };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]>;
      };
      audit_logs: {
        Row: { id: string; user_id: string | null; action: string; entity_type: string | null; entity_id: string | null; metadata: Record<string, unknown>; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> & { action: string };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
      };
    };
    Views: {
      public_members: {
        Row: { id: string; full_name: string; photo_url: string | null; rank_id: string | null; unit_id: string | null; short_bio: string | null; occupation: string | null };
      };
    };
    Functions: {
      generate_membership_number: { Args: Record<string, never>; Returns: string };
      approve_application: { Args: { p_application_id: string }; Returns: string };
      log_audit_event: { Args: { p_action: string; p_entity_type: string; p_entity_id: string | null; p_metadata: Record<string, unknown> }; Returns: void };
    };
  };
}

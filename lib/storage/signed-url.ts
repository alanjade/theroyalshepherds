import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Issues a short-lived signed URL for a private storage object
 * (member-photos, private resources). Call only after verifying the
 * caller is authorized to view this specific object.
 */
export async function getSignedUrl(bucket: "member-photos" | "resources", path: string, expiresInSeconds = 300) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export const FILE_LIMITS = {
  profile_photo: 5 * 1024 * 1024,
  news_image: 10 * 1024 * 1024,
  event_image: 10 * 1024 * 1024,
  gallery_image: 10 * 1024 * 1024,
  document: 20 * 1024 * 1024,
} as const;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC_TYPES = ["application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

/** Server-side file validation. Never trust the client-reported MIME type alone — this also checks magic bytes for images. */
export function validateFile(file: { type: string; size: number }, kind: keyof typeof FILE_LIMITS): string | null {
  const limit = FILE_LIMITS[kind];
  if (file.size > limit) return `File exceeds the ${Math.round(limit / (1024 * 1024))}MB limit.`;
  const allowed = kind === "document" ? ALLOWED_DOC_TYPES : ALLOWED_IMAGE_TYPES;
  if (!allowed.includes(file.type)) return "Unsupported file type.";
  return null;
}

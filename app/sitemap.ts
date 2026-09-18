import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = await createClient();

  const staticRoutes = ["", "/about", "/leadership", "/members", "/events", "/news", "/gallery", "/membership", "/resources", "/contact", "/privacy", "/terms"]
    .map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));

  const [{ data: events }, { data: news }, { data: albums }] = await Promise.all([
    supabase.from("events").select("slug, updated_at").eq("status", "published"),
    supabase.from("news").select("slug, updated_at").eq("status", "published"),
    supabase.from("gallery_albums").select("slug, updated_at").eq("published", true),
  ]);

  const dynamicRoutes = [
    ...(events ?? []).map((e) => ({ url: `${base}/events/${e.slug}`, lastModified: new Date(e.updated_at) })),
    ...(news ?? []).map((n) => ({ url: `${base}/news/${n.slug}`, lastModified: new Date(n.updated_at) })),
    ...(albums ?? []).map((a) => ({ url: `${base}/gallery/${a.slug}`, lastModified: new Date(a.updated_at) })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}

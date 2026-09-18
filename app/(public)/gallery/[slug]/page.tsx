import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDate } from "@/lib/utils/dates";
import { Lightbox } from "@/components/public/Lightbox";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: album } = await supabase.from("gallery_albums").select("title, description, cover_image").eq("slug", slug).eq("published", true).single();
  if (!album) return {};
  return { title: album.title, description: album.description ?? undefined };
}

export default async function AlbumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: album } = await supabase.from("gallery_albums").select("*, gallery_photos(*)").eq("slug", slug).eq("published", true).single();
  if (!album) notFound();

  const photos = (album.gallery_photos ?? []).sort((a: any, b: any) => a.display_order - b.display_order);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-royal-900">{album.title}</h1>
        {album.album_date && <p className="mt-2 text-sm text-charcoal/50">{formatDate(album.album_date)}</p>}
        {album.description && <p className="mt-4 text-charcoal/70 max-w-2xl">{album.description}</p>}

        <Lightbox photos={photos.map((p: any) => ({ src: p.image_url, alt: p.alt_text ?? album.title, caption: p.caption }))} />
      </div>
    </div>
  );
}

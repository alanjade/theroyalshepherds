import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils/dates";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: albums } = await supabase.from("gallery_albums").select("*, gallery_photos(image_url)")
    .eq("published", true).order("album_date", { ascending: false });

  return (
    <div className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Moments" title="Gallery" description="Photo albums from our activities and events." />
        {albums && albums.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((a) => (
              <Link key={a.id} href={`/gallery/${a.slug}`} className="group rounded-xl2 overflow-hidden border border-royal-100 shadow-card">
                <div className="relative aspect-[4/3] bg-royal-100">
                  {(a.cover_image || a.gallery_photos?.[0]?.image_url) ? (
                    <Image src={a.cover_image || a.gallery_photos[0].image_url} alt={a.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-royal-300"><ImageIcon className="h-8 w-8" /></div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-royal-900">{a.title}</h3>
                  {a.album_date && <p className="text-xs text-charcoal/50 mt-1">{formatDate(a.album_date)}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={ImageIcon} title="No published albums yet" />
        )}
      </div>
    </div>
  );
}

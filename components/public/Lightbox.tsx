"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Photo = { src: string; alt: string; caption?: string | null };

export function Lightbox({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-8">
        {photos.map((p, i) => (
          <button key={i} onClick={() => setOpenIndex(i)} className="relative aspect-square rounded-lg overflow-hidden bg-royal-100 group">
            <Image src={p.src} alt={p.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button onClick={() => setOpenIndex(null)} aria-label="Close" className="absolute top-4 right-4 text-white p-2"><X /></button>
          {openIndex > 0 && (
            <button onClick={() => setOpenIndex(openIndex - 1)} aria-label="Previous" className="absolute left-4 text-white p-2"><ChevronLeft /></button>
          )}
          {openIndex < photos.length - 1 && (
            <button onClick={() => setOpenIndex(openIndex + 1)} aria-label="Next" className="absolute right-4 text-white p-2"><ChevronRight /></button>
          )}
          <div className="relative max-w-4xl max-h-[80vh] w-full aspect-[4/3]">
            <Image src={photos[openIndex]!.src} alt={photos[openIndex]!.alt} fill className="object-contain" />
          </div>
          {photos[openIndex]!.caption && <p className="absolute bottom-6 text-white/80 text-sm">{photos[openIndex]!.caption}</p>}
        </div>
      )}
    </>
  );
}

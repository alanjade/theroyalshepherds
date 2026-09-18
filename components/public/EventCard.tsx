import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate, formatTime } from "@/lib/utils/dates";
import type { Database } from "@/types/database";

type Event = Database["public"]["Tables"]["events"]["Row"];

export function EventCard({ event }: { event: Event }) {
  return (
    <Card className="group flex flex-col h-full">
      <div className="relative aspect-[16/10] bg-royal-100">
        {event.featured_image ? (
          <Image src={event.featured_image} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-royal-300">
            <Calendar className="h-10 w-10" />
          </div>
        )}
        {event.category && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-royal-900">
            {event.category}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-lg text-royal-900 line-clamp-2">{event.title}</h3>
        <div className="mt-3 space-y-1.5 text-sm text-charcoal/70">
          <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gold-600 shrink-0" /> {formatDate(event.start_date)}</p>
          {event.start_time && (
            <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold-600 shrink-0" /> {formatTime(event.start_time)}</p>
          )}
          {event.location && (
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold-600 shrink-0" /> {event.location}</p>
          )}
        </div>
        {event.short_description && (
          <p className="mt-3 text-sm text-charcoal/70 line-clamp-2">{event.short_description}</p>
        )}
        <Link href={`/events/${event.slug}`} className="mt-4 text-sm font-semibold text-royal-700 hover:text-gold-600">
          View Event &rarr;
        </Link>
      </div>
    </Card>
  );
}

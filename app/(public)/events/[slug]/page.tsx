import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, Clock, MapPin } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils/dates";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("title, short_description, featured_image")
    .eq("slug", slug).eq("status", "published").single();
  if (!event) return {};
  return {
    title: event.title,
    description: event.short_description ?? undefined,
    openGraph: { images: event.featured_image ? [event.featured_image] : undefined },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("slug", slug).eq("status", "published").single();
  if (!event) notFound();

  const registrationOpen = event.registration_enabled &&
    (!event.registration_deadline || new Date(event.registration_deadline) > new Date());

  let spotsLeft: number | null = null;
  if (event.registration_enabled && event.registration_capacity) {
    const { count } = await supabase.from("event_registrations").select("id", { count: "exact", head: true }).eq("event_id", event.id);
    spotsLeft = event.registration_capacity - (count ?? 0);
  }

  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/9] rounded-xl2 overflow-hidden bg-royal-100 mb-10">
          {event.featured_image ? (
            <Image src={event.featured_image} alt={event.title} fill className="object-cover" priority />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-royal-300">
              <Calendar className="h-16 w-16" />
            </div>
          )}
        </div>

        {event.category && <p className="text-gold-600 font-semibold uppercase text-xs tracking-wide mb-2">{event.category}</p>}
        <h1 className="font-display text-3xl md:text-4xl font-bold text-royal-900">{event.title}</h1>

        <div className="mt-6 flex flex-wrap gap-6 text-sm text-charcoal/70">
          <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gold-600" />{formatDate(event.start_date)}{event.end_date && ` – ${formatDate(event.end_date)}`}</span>
          {event.start_time && <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold-600" />{formatTime(event.start_time)}{event.end_time && ` – ${formatTime(event.end_time)}`}</span>}
          {event.location && <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold-600" />{event.location}</span>}
        </div>

        {event.description && (
          <div className="mt-8 prose prose-royal max-w-none text-charcoal/80 leading-relaxed whitespace-pre-line">
            {event.description}
          </div>
        )}

        {event.registration_enabled && (
          <div className="mt-12 rounded-xl2 border border-royal-100 bg-royal-50/50 p-6">
            <h2 className="font-display text-xl font-bold text-royal-900 mb-1">Register for this Event</h2>
            {spotsLeft !== null && (
              <p className="text-sm text-charcoal/60 mb-4">
                {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} remaining` : "This event is full."}
              </p>
            )}
            {registrationOpen && (spotsLeft === null || spotsLeft > 0) ? (
              <RegistrationForm eventId={event.id} />
            ) : (
              <p className="text-sm text-charcoal/60">
                {spotsLeft !== null && spotsLeft <= 0 ? "Registration is full." : "Registration is closed for this event."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard } from "@/components/public/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Events" };

const PAGE_SIZE = 9;

export default async function EventsPage({
  searchParams,
}: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const filter = sp.when === "past" ? "past" : "upcoming";
  const search = sp.search?.trim();

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase.from("events").select("*", { count: "exact" }).eq("status", "published");
  query = filter === "past" ? query.lt("start_date", today).order("start_date", { ascending: false })
                             : query.gte("start_date", today).order("start_date");
  if (search) query = query.ilike("title", `%${search}%`);
  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data: events, count } = await query;

  return (
    <div className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="What's Happening" title="Events" />

        <form className="flex flex-wrap gap-3 justify-center mb-10" action="/events">
          <input type="hidden" name="when" value={filter} />
          <input name="search" defaultValue={search} placeholder="Search events…"
            className="rounded-full border border-royal-200 px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-royal-300" />
          <div className="flex rounded-full border border-royal-200 overflow-hidden text-sm">
            <a href={`/events?when=upcoming${search ? `&search=${search}` : ""}`}
               className={`px-4 py-2 ${filter === "upcoming" ? "bg-royal-900 text-white" : "bg-white text-royal-900"}`}>Upcoming</a>
            <a href={`/events?when=past${search ? `&search=${search}` : ""}`}
               className={`px-4 py-2 ${filter === "past" ? "bg-royal-900 text-white" : "bg-white text-royal-900"}`}>Past</a>
          </div>
        </form>

        {events && events.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        ) : (
          <EmptyState icon={Calendar} title="No events found" />
        )}

        <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} basePath="/events"
          searchParams={{ when: filter, search }} />
      </div>
    </div>
  );
}

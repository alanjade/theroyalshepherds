import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { StatCard } from "@/components/admin/StatCard";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils/dates";
import {
  Users, UserCheck, ClipboardList, Calendar, Newspaper, Images, Mail,
  UserPlus, CalendarPlus, FilePlus, Upload, ClipboardCheck,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: totalMembers }, { count: activeMembers }, { count: pendingApps },
    { count: upcomingEvents }, { count: publishedNews }, { count: photos },
    { count: unreadMessages }, { data: recentApps }, { data: recentEvents }, { data: recentMessages },
  ] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }),
    supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("membership_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "published").gte("start_date", today),
    supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("gallery_photos").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("membership_applications").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("events").select("*").order("start_date", { ascending: false }).limit(5),
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <RequireAdmin minRole="officer">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-royal-900">Dashboard</h1>
          <p className="text-sm text-charcoal/60">Overview of company activity.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Members" value={totalMembers ?? 0} icon={Users} href="/admin/members" />
          <StatCard label="Active Members" value={activeMembers ?? 0} icon={UserCheck} href="/admin/members" />
          <StatCard label="Pending Applications" value={pendingApps ?? 0} icon={ClipboardList} href="/admin/applications" />
          <StatCard label="Upcoming Events" value={upcomingEvents ?? 0} icon={Calendar} href="/admin/events" />
          <StatCard label="Published News" value={publishedNews ?? 0} icon={Newspaper} href="/admin/news" />
          <StatCard label="Gallery Photos" value={photos ?? 0} icon={Images} href="/admin/gallery" />
          <StatCard label="Unread Messages" value={unreadMessages ?? 0} icon={Mail} href="/admin/messages" />
        </div>

        <div>
          <h2 className="font-semibold text-royal-900 mb-3 text-sm">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button href="/admin/members?new=1" size="sm" variant="outline"><UserPlus className="h-4 w-4" /> Add Member</Button>
            <Button href="/admin/events?new=1" size="sm" variant="outline"><CalendarPlus className="h-4 w-4" /> Create Event</Button>
            <Button href="/admin/news?new=1" size="sm" variant="outline"><FilePlus className="h-4 w-4" /> Publish News</Button>
            <Button href="/admin/gallery?new=1" size="sm" variant="outline"><Upload className="h-4 w-4" /> Upload Photos</Button>
            <Button href="/admin/applications" size="sm" variant="outline"><ClipboardCheck className="h-4 w-4" /> Review Applications</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl2 border border-royal-100 p-5">
            <h3 className="font-semibold text-royal-900 text-sm mb-3">Recent Applications</h3>
            {recentApps && recentApps.length > 0 ? (
              <ul className="space-y-3">
                {recentApps.map((a) => (
                  <li key={a.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{a.full_name}</span>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-charcoal/50">No applications yet.</p>}
          </div>

          <div className="lg:col-span-1 bg-white rounded-xl2 border border-royal-100 p-5">
            <h3 className="font-semibold text-royal-900 text-sm mb-3">Recent / Upcoming Events</h3>
            {recentEvents && recentEvents.length > 0 ? (
              <ul className="space-y-3">
                {recentEvents.map((e) => (
                  <li key={e.id} className="flex items-center justify-between text-sm gap-2">
                    <span className="truncate">{e.title}</span>
                    <StatusBadge status={e.status} />
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-charcoal/50">No events yet.</p>}
          </div>

          <div className="lg:col-span-1 bg-white rounded-xl2 border border-royal-100 p-5">
            <h3 className="font-semibold text-royal-900 text-sm mb-3">Recent Messages</h3>
            {recentMessages && recentMessages.length > 0 ? (
              <ul className="space-y-3">
                {recentMessages.map((m) => (
                  <li key={m.id} className="text-sm">
                    <p className="font-medium truncate">{m.name}</p>
                    <p className="text-charcoal/50 text-xs truncate">{m.subject || m.message}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-charcoal/50">No messages yet.</p>}
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}

import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { EventFormDialog } from "@/components/admin/EventFormDialog";
import { EventRowActions } from "@/components/admin/EventRowActions";
import { formatDate } from "@/lib/utils/dates";
import { Calendar, Plus } from "lucide-react";

export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const showNew = sp.new === "1";
  const supabase = await createClient();
  const { data: events } = await supabase.from("events").select("*").order("start_date", { ascending: false });

  return (
    <RequireAdmin minRole="editor">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-royal-900">Events</h1>
            <p className="text-sm text-charcoal/60">{events?.length ?? 0} total events</p>
          </div>
          <Button href="/admin/events?new=1" size="sm"><Plus className="h-4 w-4" /> Create Event</Button>
        </div>

        <DataTable
          columns={[
            { header: "Title", render: (e: any) => e.title },
            { header: "Date", render: (e: any) => formatDate(e.start_date) },
            { header: "Category", render: (e: any) => e.category ?? "—" },
            { header: "Registration", render: (e: any) => e.registration_enabled ? "Enabled" : "Disabled" },
            { header: "Status", render: (e: any) => <StatusBadge status={e.status} /> },
          ]}
          rows={events ?? []}
          emptyIcon={Calendar}
          emptyTitle="No events yet"
          emptyAction={<Button href="/admin/events?new=1" size="sm">Create your first event</Button>}
          rowActions={(e: any) => <EventRowActions event={e} />}
        />
      </div>

      {showNew && <EventFormDialog />}
    </RequireAdmin>
  );
}

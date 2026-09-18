import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { formatDateTime } from "@/lib/utils/dates";
import { History } from "lucide-react";

export default async function AdminAuditLogsPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase.from("audit_logs").select("*, profiles(full_name)")
    .order("created_at", { ascending: false }).limit(100);
  return (
    <RequireAdmin minRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-royal-900">Audit Logs</h1>
          <p className="text-sm text-charcoal/60">Recent administrative actions (latest 100).</p>
        </div>
        <DataTable
          columns={[
            { header: "Date", render: (l: any) => formatDateTime(l.created_at) },
            { header: "User", render: (l: any) => l.profiles?.full_name ?? "System" },
            { header: "Action", render: (l: any) => l.action },
            { header: "Entity", render: (l: any) => l.entity_type ?? "—" },
          ]}
          rows={logs ?? []}
          emptyIcon={History}
          emptyTitle="No audit activity yet"
        />
      </div>
    </RequireAdmin>
  );
}

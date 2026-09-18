import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApplicationRowActions } from "@/components/admin/ApplicationRowActions";
import { ClipboardList } from "lucide-react";
import { formatDate } from "@/lib/utils/dates";

export default async function AdminApplicationsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("membership_applications").select("*");
  if (sp.status) query = query.eq("status", sp.status);
  const { data: applications } = await query.order("created_at", { ascending: false });

  return (
    <RequireAdmin minRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-royal-900">Membership Applications</h1>
          <p className="text-sm text-charcoal/60">{applications?.length ?? 0} total applications</p>
        </div>

        <form className="flex gap-3" action="/admin/applications">
          <select name="status" defaultValue={sp.status ?? ""} className="rounded-lg border border-royal-200 px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button type="submit" className="rounded-lg border border-royal-200 px-4 py-2 text-sm font-medium hover:bg-royal-50">Filter</button>
        </form>

        <DataTable
          columns={[
            { header: "Name", render: (a: any) => a.full_name },
            { header: "Email", render: (a: any) => a.email },
            { header: "Phone", render: (a: any) => a.phone ?? "—" },
            { header: "Submitted", render: (a: any) => formatDate(a.created_at) },
            { header: "Status", render: (a: any) => <StatusBadge status={a.status} /> },
          ]}
          rows={applications ?? []}
          emptyIcon={ClipboardList}
          emptyTitle="No applications found"
          rowActions={(a: any) => <ApplicationRowActions application={a} />}
        />
      </div>
    </RequireAdmin>
  );
}

import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { Building2 } from "lucide-react";

export default async function AdminDepartmentsPage() {
  const supabase = await createClient();
  const { data: departments } = await supabase.from("departments").select("*").order("display_order");
  return (
    <RequireAdmin minRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-royal-900">Departments</h1>
          <p className="text-sm text-charcoal/60">Demo departments seeded — rename or replace to match your company.</p>
        </div>
        <DataTable
          columns={[
            { header: "Name", render: (d: any) => d.name },
            { header: "Description", render: (d: any) => d.description ?? "—" },
            { header: "Active", render: (d: any) => d.active ? "Yes" : "No" },
          ]}
          rows={departments ?? []}
          emptyIcon={Building2}
          emptyTitle="No departments configured yet"
        />
      </div>
    </RequireAdmin>
  );
}

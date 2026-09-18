import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { Shield } from "lucide-react";

export default async function AdminUnitsPage() {
  const supabase = await createClient();
  const { data: units } = await supabase.from("units").select("*").order("display_order");
  return (
    <RequireAdmin minRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-royal-900">Units</h1>
          <p className="text-sm text-charcoal/60">Demo units/platoons seeded — rename or replace to match your company's actual structure.</p>
        </div>
        <DataTable
          columns={[
            { header: "Name", render: (u: any) => u.name },
            { header: "Description", render: (u: any) => u.description ?? "—" },
            { header: "Active", render: (u: any) => u.active ? "Yes" : "No" },
          ]}
          rows={units ?? []}
          emptyIcon={Shield}
          emptyTitle="No units configured yet"
        />
      </div>
    </RequireAdmin>
  );
}

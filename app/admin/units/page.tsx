import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { Shield } from "lucide-react";

export default async function AdminUnitsPage() {
  const supabase = await createClient();
  const { data: units } = await supabase.from("units").select("*").order("display_order");
  return (
    <RequireAdmin minRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-royal-900">Units</h1>
          <p className="text-sm text-charcoal/60">Groups are listed on the Members page in this order. Use the arrows to change it.</p>
        </div>
        <DataTable
          columns={[
            { header: "Name", render: (u: any) => u.name },
            { header: "Description", render: (u: any) => u.description ?? "—" },
            { header: "Active", render: (u: any) => u.active ? "Yes" : "No" },
            { header: "Order", render: (u: any) => u.display_order },
          ]}
          rows={units ?? []}
          rowActions={(u: any) => {
            const list = units ?? [];
            return <ReorderButtons table="units" id={u.id} isFirst={list[0]?.id === u.id} isLast={list[list.length - 1]?.id === u.id} />;
          }}
          emptyIcon={Shield}
          emptyTitle="No units configured yet"
        />
      </div>
    </RequireAdmin>
  );
}

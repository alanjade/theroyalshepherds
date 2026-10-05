import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { Shield } from "lucide-react";

export default async function AdminRanksPage() {
  const supabase = await createClient();
  const { data: ranks } = await supabase.from("ranks").select("*").order("display_order");
  return (
    <RequireAdmin minRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-royal-900">Ranks</h1>
          <p className="text-sm text-charcoal/60">Ranks are listed on the Members page from top to bottom in this order. Use the arrows to change it.</p>
        </div>
        <DataTable
          columns={[
            { header: "Name", render: (r: any) => r.name },
            { header: "Short Name", render: (r: any) => r.short_name ?? "—" },
            { header: "Description", render: (r: any) => r.description ?? "—" },
            { header: "Order", render: (r: any) => r.display_order },
          ]}
          rows={ranks ?? []}
          rowActions={(r: any) => {
            const list = ranks ?? [];
            return <ReorderButtons table="ranks" id={r.id} isFirst={list[0]?.id === r.id} isLast={list[list.length - 1]?.id === r.id} />;
          }}
          emptyIcon={Shield}
          emptyTitle="No ranks configured yet"
        />
      </div>
    </RequireAdmin>
  );
}

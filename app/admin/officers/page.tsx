import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { Star } from "lucide-react";

export default async function AdminOfficersPage() {
  const supabase = await createClient();
  const { data: officers } = await supabase.from("officers")
    .select("*, members(full_name), officer_positions(title), ranks(name)").order("display_order");
  return (
    <RequireAdmin minRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-royal-900">Officers</h1>
          <p className="text-sm text-charcoal/60">Assign members to leadership positions for public display.</p>
        </div>
        <DataTable
          columns={[
            { header: "Member", render: (o: any) => o.members?.full_name ?? "—" },
            { header: "Position", render: (o: any) => o.officer_positions?.title ?? "—" },
            { header: "Rank", render: (o: any) => o.ranks?.name ?? "—" },
            { header: "Public", render: (o: any) => o.public_visible ? "Yes" : "No" },
          ]}
          rows={officers ?? []}
          emptyIcon={Star}
          emptyTitle="No officers assigned yet"
        />
      </div>
    </RequireAdmin>
  );
}

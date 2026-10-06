import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { OfficerFormDialog } from "@/components/admin/OfficerFormDialog";
import { OfficerRowActions } from "@/components/admin/OfficerRowActions";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { Star, Plus } from "lucide-react";

export default async function AdminOfficersPage({
  searchParams,
}: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const showNew = sp.new === "1";

  const supabase = await createClient();
  const { data: officers } = await supabase.from("officers")
    .select("*, members(full_name), officer_positions(title), ranks(name)")
    .order("display_order").order("created_at");

  let memberOptions: { id: string; label: string }[] = [];
  let positions: { id: string; title: string }[] = [];
  if (showNew) {
    const [{ data: members }, { data: pos }] = await Promise.all([
      supabase.from("members").select("id, full_name, ranks(name)")
        .eq("status", "active").order("display_order").order("full_name").limit(1000),
      supabase.from("officer_positions").select("id, title").order("display_order"),
    ]);
    memberOptions = (members ?? []).map((m: any) => ({
      id: m.id,
      label: m.ranks?.name ? `${m.full_name} — ${m.ranks.name}` : m.full_name,
    }));
    positions = pos ?? [];
  }

  const list = officers ?? [];
  return (
    <RequireAdmin minRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-royal-900">Officers</h1>
            <p className="text-sm text-charcoal/60">Assign members to leadership positions. They appear on the public Leadership page in this order.</p>
          </div>
          <Button href="/admin/officers?new=1" size="sm"><Plus className="h-4 w-4" /> Assign Officer</Button>
        </div>
        <DataTable
          columns={[
            { header: "Member", render: (o: any) => o.members?.full_name ?? "—" },
            { header: "Position", render: (o: any) => o.officer_positions?.title ?? "—" },
            { header: "Rank", render: (o: any) => o.ranks?.name ?? "—" },
            { header: "Public", render: (o: any) => o.public_visible ? "Yes" : "No" },
            { header: "Order", render: (o: any) => (
              <ReorderButtons table="officers" id={o.id}
                isFirst={list[0]?.id === o.id} isLast={list[list.length - 1]?.id === o.id} />
            ) },
          ]}
          rows={list}
          emptyIcon={Star}
          emptyTitle="No officers assigned yet"
          emptyAction={<Button href="/admin/officers?new=1" size="sm">Assign your first officer</Button>}
          rowActions={(o: any) => <OfficerRowActions officer={o} />}
        />
      </div>
      {showNew && <OfficerFormDialog members={memberOptions} positions={positions} />}
    </RequireAdmin>
  );
}

import Link from "next/link";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable } from "@/components/admin/DataTable";
import { AssetDialogs } from "@/components/admin/AssetDialogs";
import { AssetRowActions } from "@/components/admin/AssetRowActions";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { hasRole } from "@/lib/auth/roles";
import { formatDate } from "@/lib/utils/dates";
import { summarize } from "@/lib/utils/assets";
import { Package, PackageCheck, PackageOpen, AlertTriangle, Plus } from "lucide-react";

export default async function AdminAssetsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { profile } = await requireUser();
  const canManage = hasRole(profile.role, "admin");
  const supabase = await createClient();
  const search = (sp.search ?? "").trim().toLowerCase();
  const statusFilter = sp.status ?? "";

  // Small inventory: load it once with the open loans, then search / filter / count in memory.
  const { data } = await supabase
    .from("assets")
    .select("*, asset_checkouts(id, borrower_name, quantity, due_date, checked_out_at, checked_in_at)")
    .is("asset_checkouts.checked_in_at", null)
    .order("name")
    .limit(1000);

  const all = (data ?? []).map((a: any) => ({ ...a, ...summarize(a) }));
  const active = all.filter((a) => a.status !== "retired");
  const stats = {
    total: active.length,
    available: active.filter((a) => a.available > 0).length,
    out: all.filter((a) => a.out > 0).length,
    overdue: all.filter((a) => a.overdue).length,
  };

  const rows = all.filter((a) => {
    if (search && ![a.name, a.asset_tag, a.category, a.serial_number].some((v) => v?.toLowerCase().includes(search))) return false;
    switch (statusFilter) {
      case "available": return a.available > 0;
      case "checked_out": return a.out > 0;
      case "overdue": return a.overdue;
      case "maintenance": case "retired": return a.status === statusFilter;
      default: return true;
    }
  });

  return (
    <RequireAdmin minRole="officer">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-royal-900">Assets</h1>
            <p className="text-sm text-charcoal/60">Company equipment and who currently has it.</p>
          </div>
          {canManage && <Button href="/admin/assets?new=1" size="sm"><Plus className="h-4 w-4" /> Add Asset</Button>}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Assets" value={stats.total} icon={Package} href="/admin/assets" />
          <StatCard label="Available" value={stats.available} icon={PackageCheck} href="/admin/assets?status=available" />
          <StatCard label="Checked Out" value={stats.out} icon={PackageOpen} href="/admin/assets?status=checked_out" />
          <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} href="/admin/assets?status=overdue" />
        </div>

        <form className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3" action="/admin/assets">
          <input name="search" defaultValue={search} placeholder="Search name, tag, serial, category…"
            className="col-span-2 rounded-lg border border-royal-200 px-3 py-2 text-sm w-full sm:w-72" />
          <select name="status" defaultValue={statusFilter} className="rounded-lg border border-royal-200 px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="checked_out">Checked out</option>
            <option value="overdue">Overdue</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
          </select>
          <Button type="submit" variant="outline" size="sm">Filter</Button>
          <Button href="/admin/assets" variant="ghost" size="sm">Clear</Button>
        </form>

        <DataTable
          columns={[
            {
              header: "Asset",
              render: (a: any) => (
                <Link href={`/admin/assets/${a.id}` as any} className="font-medium text-royal-900 hover:text-gold-600">
                  {a.name}
                  <span className="block text-xs font-normal text-charcoal/50">{a.asset_tag}</span>
                </Link>
              ),
            },
            { header: "Category", render: (a: any) => a.category ?? "—" },
            {
              header: "Serial / Stock",
              render: (a: any) => a.tracking === "bulk"
                ? <span><strong>{a.available}</strong> of {a.quantity} available</span>
                : (a.serial_number ?? "—"),
            },
            { header: "Status", render: (a: any) => <StatusBadge status={a.display} /> },
            {
              header: "With",
              render: (a: any) => {
                if (a.loans.length === 0) return "—";
                return (
                  <span className="space-y-0.5 block">
                    {a.loans.slice(0, 2).map((l: any) => (
                      <span key={l.id} className="block">
                        {l.borrower_name}{a.tracking === "bulk" && ` × ${l.quantity}`}
                        {l.due_date && <span className="block text-xs text-charcoal/50">Due {formatDate(l.due_date)}</span>}
                      </span>
                    ))}
                    {a.loans.length > 2 && <span className="block text-xs text-charcoal/50">+{a.loans.length - 2} more</span>}
                  </span>
                );
              },
            },
          ]}
          rows={rows}
          emptyIcon={Package}
          emptyTitle={search || statusFilter ? "No assets match your filters" : "No assets yet"}
          emptyAction={canManage && !search && !statusFilter ? <Button href="/admin/assets?new=1" size="sm">Add your first asset</Button> : undefined}
          rowActions={(a: any) => <AssetRowActions asset={a} canManage={canManage} />}
        />
      </div>

      <AssetDialogs sp={sp} canManage={canManage} />
    </RequireAdmin>
  );
}

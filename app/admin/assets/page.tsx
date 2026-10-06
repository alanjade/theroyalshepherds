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
import { isOverdue, todayInTz } from "@/lib/utils/assets";
import { Package, PackageCheck, PackageOpen, AlertTriangle, Plus } from "lucide-react";

export default async function AdminAssetsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { profile } = await requireUser();
  const canManage = hasRole(profile.role, "admin");
  const supabase = await createClient();
  const today = todayInTz();
  const search = (sp.search ?? "").replace(/[,()%*]/g, " ").trim();
  const statusFilter = sp.status ?? "";

  // Overdue = open loan past its due date.
  const { data: overdueLoans } = await supabase
    .from("asset_checkouts").select("asset_id").is("checked_in_at", null).lt("due_date", today);
  const overdueIds = (overdueLoans ?? []).map((l: any) => l.asset_id);

  let query = supabase
    .from("assets")
    .select("*, asset_checkouts(id, borrower_name, member_id, due_date, checked_out_at, checked_in_at)")
    .is("asset_checkouts.checked_in_at", null)
    .order("name")
    .limit(500);
  if (search) query = query.or(`name.ilike.%${search}%,asset_tag.ilike.%${search}%,category.ilike.%${search}%,serial_number.ilike.%${search}%`);
  if (statusFilter === "overdue") query = query.in("id", overdueIds.length ? overdueIds : ["00000000-0000-0000-0000-000000000000"]);
  else if (statusFilter) query = query.eq("status", statusFilter);

  const [{ data: assets }, { count: total }, { count: available }, { count: out }] = await Promise.all([
    query,
    supabase.from("assets").select("id", { count: "exact", head: true }).neq("status", "retired"),
    supabase.from("assets").select("id", { count: "exact", head: true }).eq("status", "available"),
    supabase.from("assets").select("id", { count: "exact", head: true }).eq("status", "checked_out"),
  ]);

  const openLoan = (a: any) => (a.asset_checkouts ?? []).find((l: any) => !l.checked_in_at);

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
          <StatCard label="Active Assets" value={total ?? 0} icon={Package} href="/admin/assets" />
          <StatCard label="Available" value={available ?? 0} icon={PackageCheck} href="/admin/assets?status=available" />
          <StatCard label="Checked Out" value={out ?? 0} icon={PackageOpen} href="/admin/assets?status=checked_out" />
          <StatCard label="Overdue" value={overdueIds.length} icon={AlertTriangle} href="/admin/assets?status=overdue" />
        </div>

        <form className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3" action="/admin/assets">
          <input name="search" defaultValue={search} placeholder="Search name, tag, category…"
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
              header: "Status",
              render: (a: any) => <StatusBadge status={a.status === "checked_out" && isOverdue(openLoan(a)?.due_date) ? "overdue" : a.status} />,
            },
            {
              header: "With",
              render: (a: any) => {
                const loan = openLoan(a);
                if (!loan) return "—";
                return (
                  <span>
                    {loan.borrower_name}
                    {loan.due_date && <span className="block text-xs text-charcoal/50">Due {formatDate(loan.due_date)}</span>}
                  </span>
                );
              },
            },
            { header: "Condition", render: (a: any) => <span className="capitalize">{a.condition}</span> },
          ]}
          rows={assets ?? []}
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

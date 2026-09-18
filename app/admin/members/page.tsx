import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { MemberFormDialog } from "@/components/admin/MemberFormDialog";
import { MemberRowActions } from "@/components/admin/MemberRowActions";
import { Users, Plus } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 20;

export default async function AdminMembersPage({
  searchParams,
}: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const search = sp.search?.trim();
  const showNew = sp.new === "1";

  const supabase = await createClient();
  let query = supabase.from("members").select("*, ranks(name), units(name)", { count: "exact" });
  if (search) query = query.ilike("full_name", `%${search}%`);
  if (sp.status) query = query.eq("status", sp.status);
  query = query.order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const { data: members, count } = await query;

  const [{ data: ranks }, { data: units }] = await Promise.all([
    supabase.from("ranks").select("id, name").order("display_order"),
    supabase.from("units").select("id, name").order("display_order"),
  ]);

  return (
    <RequireAdmin minRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-royal-900">Members</h1>
            <p className="text-sm text-charcoal/60">{count ?? 0} total members</p>
          </div>
          <Button href="/admin/members?new=1" size="sm"><Plus className="h-4 w-4" /> Add Member</Button>
        </div>

        <form className="flex flex-wrap gap-3" action="/admin/members">
          <input name="search" defaultValue={search} placeholder="Search by name…"
            className="rounded-lg border border-royal-200 px-3 py-2 text-sm w-64" />
          <select name="status" defaultValue={sp.status ?? ""} className="rounded-lg border border-royal-200 px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="archived">Archived</option>
          </select>
          <Button type="submit" variant="outline" size="sm">Filter</Button>
        </form>

        <DataTable
          columns={[
            { header: "Name", render: (m: any) => <Link href={`/admin/members/${m.id}`} className="font-medium text-royal-900 hover:text-gold-600">{m.full_name}</Link> },
            { header: "Membership #", render: (m: any) => m.membership_number },
            { header: "Rank", render: (m: any) => m.ranks?.name ?? "—" },
            { header: "Unit", render: (m: any) => m.units?.name ?? "—" },
            { header: "Status", render: (m: any) => <StatusBadge status={m.status} /> },
            { header: "Public Profile", render: (m: any) => m.public_profile ? "Yes" : "No" },
          ]}
          rows={members ?? []}
          emptyIcon={Users}
          emptyTitle="No members found"
          emptyAction={<Button href="/admin/members?new=1" size="sm">Add your first member</Button>}
          rowActions={(m: any) => <MemberRowActions member={m} />}
        />

        <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} basePath="/admin/members" searchParams={{ search, status: sp.status }} />
      </div>

      {showNew && <MemberFormDialog ranks={ranks ?? []} units={units ?? []} />}
    </RequireAdmin>
  );
}

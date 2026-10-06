import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { UserGrantDialog } from "@/components/admin/UserGrantDialog";
import { UserRowActions } from "@/components/admin/UserRowActions";
import { KeyRound, Plus } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin", admin: "Admin", editor: "Editor", officer: "Officer",
};

export default async function AdminUsersPage({
  searchParams,
}: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const showNew = sp.new === "1";
  const { user } = await requireUser();

  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles")
    .select("id, full_name, email, role, member_id, created_at").order("created_at");

  const memberIds = (profiles ?? []).map((p: any) => p.member_id).filter(Boolean);
  const { data: linked } = memberIds.length
    ? await supabase.from("members").select("id, membership_number").in("id", memberIds)
    : { data: [] as any[] };
  const numberById = new Map((linked ?? []).map((m: any) => [m.id, m.membership_number]));

  let memberOptions: { id: string; label: string; email: string | null }[] = [];
  if (showNew) {
    const { data: members } = await supabase.from("members")
      .select("id, full_name, email, ranks(name)").eq("status", "active")
      .order("display_order").order("full_name").limit(1000);
    const taken = new Set(memberIds);
    memberOptions = (members ?? []).filter((m: any) => !taken.has(m.id)).map((m: any) => ({
      id: m.id, email: m.email,
      label: m.ranks?.name ? `${m.full_name} — ${m.ranks.name}` : m.full_name,
    }));
  }

  return (
    <RequireAdmin minRole="super_admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-royal-900">Admin Access</h1>
            <p className="text-sm text-charcoal/60">Choose which members can sign in to this admin area, and what they can do.</p>
          </div>
          <Button href="/admin/users?new=1" size="sm"><Plus className="h-4 w-4" /> Grant Access</Button>
        </div>
        <DataTable
          columns={[
            { header: "Name", render: (p: any) => p.full_name },
            { header: "Email", render: (p: any) => p.email },
            { header: "Role", render: (p: any) => ROLE_LABEL[p.role] ?? p.role },
            { header: "Member No.", render: (p: any) => numberById.get(p.member_id) ?? "—" },
          ]}
          rows={profiles ?? []}
          emptyIcon={KeyRound}
          emptyTitle="No accounts yet"
          rowActions={(p: any) => <UserRowActions profile={p} isSelf={p.id === user.id} />}
        />
      </div>
      {showNew && <UserGrantDialog members={memberOptions} />}
    </RequireAdmin>
  );
}

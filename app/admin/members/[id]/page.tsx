import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { MemberPhotoUpload } from "@/components/admin/MemberPhotoUpload";
import { MemberEditDialog } from "@/components/admin/MemberEditDialog";
import { Pencil } from "lucide-react";

export default async function MemberDetailPage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const showEdit = sp.edit === "1";
  const supabase = await createClient();
  const { data: member } = await supabase.from("members").select("*, ranks(name), units(name)").eq("id", id).single();
  if (!member) notFound();

  let ranks: any[] = [], units: any[] = [];
  if (showEdit) {
    const [r, u] = await Promise.all([
      supabase.from("ranks").select("id, name").order("display_order"),
      supabase.from("units").select("id, name").order("display_order"),
    ]);
    ranks = r.data ?? []; units = u.data ?? [];
  }

  const rows: [string, React.ReactNode][] = [
    ["Membership Number", member.membership_number],
    ["Status", <StatusBadge key="s" status={member.status} />],
    ["Rank", (member as any).ranks?.name ?? "—"],
    ["Unit", (member as any).units?.name ?? "—"],
    ["Phone", member.phone ?? "—"],
    ["Email", member.email ?? "—"],
    ["Date of Birth", member.date_of_birth ?? "—"],
    ["Address", member.address ?? "—"],
    ["Guardian", member.guardian_name ?? "—"],
    ["Guardian Phone", member.guardian_phone ?? "—"],
    ["Emergency Contact", member.emergency_contact ?? "—"],
    ["Public Profile", member.public_profile ? "Yes" : "No"],
    ["Joined", member.joined_at],
  ];

  return (
    <RequireAdmin minRole="admin">
      <div className="max-w-2xl space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-royal-900">{member.full_name}</h1>
            <p className="text-sm text-charcoal/60">Private member record — visible to staff only.</p>
          </div>
          <Button href={`/admin/members/${member.id}?edit=1`} size="sm"><Pencil className="h-4 w-4" /> Edit Profile</Button>
        </div>
        <div className="bg-white rounded-xl2 border border-royal-100 p-5">
          <MemberPhotoUpload memberId={member.id} photoUrl={member.photo_url} name={member.full_name} />
        </div>
        <div className="bg-white rounded-xl2 border border-royal-100 divide-y divide-royal-100">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between px-5 py-3 text-sm">
              <span className="text-charcoal/60">{label}</span>
              <span className="font-medium text-royal-900">{value}</span>
            </div>
          ))}
        </div>
      </div>
      {showEdit && <MemberEditDialog member={member} ranks={ranks} units={units} />}
    </RequireAdmin>
  );
}

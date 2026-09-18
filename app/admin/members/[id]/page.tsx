import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: member } = await supabase.from("members").select("*, ranks(name), units(name)").eq("id", id).single();
  if (!member) notFound();

  const rows: [string, React.ReactNode][] = [
    ["Membership Number", member.membership_number],
    ["Status", <StatusBadge key="s" status={member.status} />],
    ["Rank", (member as any).ranks?.name ?? "—"],
    ["Unit", (member as any).units?.name ?? "—"],
    ["Phone", member.phone ?? "—"],
    ["Email", member.email ?? "—"],
    ["Date of Birth", member.date_of_birth ?? "—"],
    ["Address", member.address ?? "—"],
    ["Church", member.church ?? "—"],
    ["Guardian", member.guardian_name ?? "—"],
    ["Guardian Phone", member.guardian_phone ?? "—"],
    ["Emergency Contact", member.emergency_contact ?? "—"],
    ["Public Profile", member.public_profile ? "Yes" : "No"],
    ["Joined", member.joined_at],
  ];

  return (
    <RequireAdmin minRole="admin">
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-royal-900">{member.full_name}</h1>
          <p className="text-sm text-charcoal/60">Private member record — visible to staff only.</p>
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
    </RequireAdmin>
  );
}

import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { OfficerCard } from "@/components/public/OfficerCard";
import { Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Members" };

// Only members with public_profile = true are ever shown here — enforced by
// the public_members view + RLS, never a raw `members` select.
export default async function MembersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("public_members")
    .select("id, full_name, photo_url, short_bio, occupation, ranks(name, display_order), units(name, display_order)");

  // Ranked members first (most senior first), then group members
  // (Seniors > Intermediates > Junior > Anchor), then alphabetically.
  const members = (data ?? []).slice().sort((a: any, b: any) => {
    const ra = a.ranks?.display_order ?? 999, rb = b.ranks?.display_order ?? 999;
    if (ra !== rb) return ra - rb;
    const ua = a.units?.display_order ?? 999, ub = b.units?.display_order ?? 999;
    if (ua !== ub) return ua - ub;
    return String(a.full_name).localeCompare(String(b.full_name));
  });

  return (
    <div className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Our Community" title="Members"
          description="The officers, men and women of The Royal Shepherds." />
        {members.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10">
            {members.map((m: any) => (
              <OfficerCard key={m.id} name={m.full_name} position={m.units?.name ?? "Member"}
                rank={m.ranks?.name} photoUrl={m.photo_url} bio={m.short_bio} occupation={m.occupation} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Users} title="No public member profiles yet"
            description="Members can choose to make their profile public from their membership record." />
        )}
      </div>
    </div>
  );
}

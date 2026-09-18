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
  const { data: members } = await supabase.from("public_members").select("*, ranks(name), units(name)");

  return (
    <div className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Our Community" title="Members"
          description="A selection of members who have chosen to share a public profile." />
        {members && members.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10">
            {members.map((m: any) => (
              <OfficerCard key={m.id} name={m.full_name} position={m.units?.name ?? "Member"}
                rank={m.ranks?.name} photoUrl={m.photo_url} bio={m.short_bio} />
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

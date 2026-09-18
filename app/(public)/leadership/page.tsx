import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { OfficerCard } from "@/components/public/OfficerCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leadership" };

export default async function LeadershipPage() {
  const supabase = await createClient();
  const { data: officers } = await supabase
    .from("officers")
    .select("*, members(full_name, photo_url, short_bio), officer_positions(title), ranks(name)")
    .eq("public_visible", true)
    .order("display_order");

  return (
    <div className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Our Team" title="Leadership"
          description="Meet the officers leading our company in faith and service." />
        {officers && officers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10">
            {officers.map((o: any) => (
              <OfficerCard key={o.id} name={o.members?.full_name ?? "[Member]"}
                position={o.officer_positions?.title ?? "[Position]"} rank={o.ranks?.name}
                photoUrl={o.photo_url ?? o.members?.photo_url} bio={o.members?.short_bio} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Users} title="Leadership information coming soon" />
        )}
      </div>
    </div>
  );
}

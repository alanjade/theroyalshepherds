import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { OfficerCard } from "@/components/public/OfficerCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leadership" };
export const dynamic = "force-dynamic";

export default async function LeadershipPage() {
  const supabase = await createClient();
  const { data: officers } = await supabase
    .from("officers")
    .select("*, members(full_name, photo_url, short_bio), officer_positions(title, church_appointed), ranks(name)")
    .eq("public_visible", true)
    .order("display_order");

  const all = officers ?? [];
  // Church-appointed roles (patrons, patronesses, chaplain) are shown first, in their own section.
  const sponsors = all.filter((o: any) => o.officer_positions?.church_appointed);
  const company = all.filter((o: any) => !o.officer_positions?.church_appointed);

  const grid = (list: any[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10">
      {list.map((o: any) => (
        <OfficerCard key={o.id} name={o.members?.full_name ?? "[Member]"}
          position={o.officer_positions?.title ?? "[Position]"} rank={o.ranks?.name}
          photoUrl={o.photo_url ?? o.members?.photo_url} bio={o.members?.short_bio} />
      ))}
    </div>
  );

  return (
    <div className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Our Team" title="Leadership"
          description="Meet the officers leading our company in faith and service." />
        {all.length === 0 ? (
          <EmptyState icon={Users} title="Leadership information coming soon" />
        ) : (
          <div className="space-y-16">
            {sponsors.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-royal-900 text-center mb-2">Patrons &amp; Chaplain</h2>
                <p className="text-sm text-charcoal/60 text-center mb-10">Our sponsors and spiritual heads, appointed by the church.</p>
                {grid(sponsors)}
              </section>
            )}
            {company.length > 0 && (
              <section>
                {sponsors.length > 0 && (
                  <h2 className="font-display text-xl font-bold text-royal-900 text-center mb-10">Company Officers</h2>
                )}
                {grid(company)}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

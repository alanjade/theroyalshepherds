import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { OfficerCard } from "@/components/public/OfficerCard";
import { Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Members" };

// Always render fresh so newly published members appear immediately.
export const dynamic = "force-dynamic";

// Only members with public_profile = true are ever shown here — enforced by
// the public_members view + RLS, never a raw `members` select.
export default async function MembersPage() {
  const supabase = await createClient();

  // Fetch members, ranks and units separately and join in code. This avoids
  // relying on PostgREST inferring relationships through the view.
  const [membersRes, ranksRes, unitsRes] = await Promise.all([
    supabase.from("public_members")
      .select("id, full_name, photo_url, short_bio, occupation, rank_id, unit_id, display_order")
      .limit(1000),
    supabase.from("ranks").select("id, name, display_order"),
    supabase.from("units").select("id, name, display_order"),
  ]);
  if (membersRes.error) console.error("public_members query failed:", membersRes.error.message);

  const rankById = new Map((ranksRes.data ?? []).map((r: any) => [r.id, r]));
  const unitById = new Map((unitsRes.data ?? []).map((u: any) => [u.id, u]));

  // Sorted by unit order, then rank order, then the order set in admin, then alphabetically.
  const members = (membersRes.data ?? [])
    .map((m: any) => ({ ...m, rank: rankById.get(m.rank_id), unit: unitById.get(m.unit_id) }))
    .sort((a: any, b: any) => {
      const ua = a.unit?.display_order ?? 999, ub = b.unit?.display_order ?? 999;
      if (ua !== ub) return ua - ub;
      const ra = a.rank?.display_order ?? 999, rb = b.rank?.display_order ?? 999;
      if (ra !== rb) return ra - rb;
      if ((a.display_order ?? 0) !== (b.display_order ?? 0)) return (a.display_order ?? 0) - (b.display_order ?? 0);
      return String(a.full_name).localeCompare(String(b.full_name));
    });

  // Group into one section per unit (in unit order); members without a unit go last.
  const sections: { name: string; order: number; members: any[] }[] = [];
  for (const m of members as any[]) {
    const name = m.unit?.name ?? "Members";
    let sec = sections.find((s) => s.name === name);
    if (!sec) { sec = { name, order: m.unit?.display_order ?? 999, members: [] }; sections.push(sec); }
    sec.members.push(m);
  }
  sections.sort((a, b) => a.order - b.order);

  return (
    <div className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Our Community" title="Members"
          description="The officers, men and women of The Royal Shepherds." />
        {members.length > 0 ? (
          <div className="space-y-16">
            {sections.map((sec) => (
              <section key={sec.name}>
                <h2 className="font-display text-xl font-bold text-royal-900 text-center mb-10">{sec.name}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10">
                  {sec.members.map((m: any) => (
                    <OfficerCard key={m.id} name={m.full_name} position={m.rank?.name ?? sec.name}
                      photoUrl={m.photo_url} bio={m.short_bio} occupation={m.occupation} />
                  ))}
                </div>
              </section>
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

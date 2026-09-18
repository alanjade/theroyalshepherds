import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileText, Download } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resources" };

export default async function ResourcesPage() {
  const supabase = await createClient();
  // RLS's resources_public_read policy already gates by visibility + role —
  // this select returns exactly what the current caller is allowed to see.
  const { data: resources } = await supabase.from("resources").select("*").order("category").order("title");

  const grouped = (resources ?? []).reduce<Record<string, typeof resources>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Downloads" title="Resources" description="Forms, guidelines and publications for members and the public." />
        {Object.keys(grouped).length > 0 ? (
          <div className="space-y-10">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h2 className="font-display font-bold text-royal-900 mb-3">{category}</h2>
                <ul className="divide-y divide-royal-100 border border-royal-100 rounded-xl2 overflow-hidden">
                  {items!.map((r) => (
                    <li key={r.id} className="flex items-center justify-between px-5 py-4 bg-white">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gold-600 shrink-0" />
                        <div>
                          <p className="font-medium text-royal-900 text-sm">{r.title}</p>
                          {r.description && <p className="text-xs text-charcoal/60">{r.description}</p>}
                        </div>
                      </div>
                      <a href={`/api/resources/${r.id}/download`} className="flex items-center gap-1.5 text-sm font-semibold text-royal-700 hover:text-gold-600 shrink-0">
                        <Download className="h-4 w-4" /> Download
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={FileText} title="No resources available" />
        )}
      </div>
    </div>
  );
}

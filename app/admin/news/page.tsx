import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { NewsFormDialog } from "@/components/admin/NewsFormDialog";
import { NewsRowActions } from "@/components/admin/NewsRowActions";
import { Newspaper, Plus } from "lucide-react";

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: news }, { data: categories }] = await Promise.all([
    supabase.from("news").select("*, news_categories(name)").order("created_at", { ascending: false }),
    supabase.from("news_categories").select("id, name").order("display_order"),
  ]);

  return (
    <RequireAdmin minRole="editor">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-royal-900">News</h1>
            <p className="text-sm text-charcoal/60">{news?.length ?? 0} articles</p>
          </div>
          <Button href="/admin/news?new=1" size="sm"><Plus className="h-4 w-4" /> Publish News</Button>
        </div>

        <DataTable
          columns={[
            { header: "Title", render: (n: any) => n.title },
            { header: "Category", render: (n: any) => n.news_categories?.name ?? "—" },
            { header: "Featured", render: (n: any) => n.featured ? "Yes" : "No" },
            { header: "Status", render: (n: any) => <StatusBadge status={n.status} /> },
          ]}
          rows={news ?? []}
          emptyIcon={Newspaper}
          emptyTitle="No articles yet"
          emptyAction={<Button href="/admin/news?new=1" size="sm">Publish your first article</Button>}
          rowActions={(n: any) => <NewsRowActions article={n} />}
        />
      </div>

      {sp.new === "1" && <NewsFormDialog categories={categories ?? []} />}
    </RequireAdmin>
  );
}

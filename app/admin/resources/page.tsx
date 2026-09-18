import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { FileText } from "lucide-react";

export default async function AdminResourcesPage() {
  const supabase = await createClient();
  const { data: resources } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
  return (
    <RequireAdmin minRole="editor">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-royal-900">Resources</h1>
          <p className="text-sm text-charcoal/60">Forms, guidelines, publications — visibility-controlled downloads.</p>
        </div>
        <DataTable
          columns={[
            { header: "Title", render: (r: any) => r.title },
            { header: "Category", render: (r: any) => r.category },
            { header: "Visibility", render: (r: any) => r.visibility },
            { header: "File", render: (r: any) => r.file_name },
          ]}
          rows={resources ?? []}
          emptyIcon={FileText}
          emptyTitle="No resources uploaded yet"
        />
      </div>
    </RequireAdmin>
  );
}

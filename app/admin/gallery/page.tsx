import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Images } from "lucide-react";

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: albums } = await supabase.from("gallery_albums").select("*, gallery_photos(id)").order("created_at", { ascending: false });
  return (
    <RequireAdmin minRole="editor">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-royal-900">Gallery</h1>
          <p className="text-sm text-charcoal/60">Manage photo albums. Upload multiple images per album, set a cover, and publish when ready.</p>
        </div>
        <DataTable
          columns={[
            { header: "Album", render: (a: any) => a.title },
            { header: "Photos", render: (a: any) => a.gallery_photos?.length ?? 0 },
            { header: "Published", render: (a: any) => <StatusBadge status={a.published ? "active" : "draft"} /> },
          ]}
          rows={albums ?? []}
          emptyIcon={Images}
          emptyTitle="No albums yet"
        />
      </div>
    </RequireAdmin>
  );
}

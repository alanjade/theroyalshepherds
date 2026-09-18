import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import { MessageRowActions } from "@/components/admin/MessageRowActions";
import { formatDateTime } from "@/lib/utils/dates";
import { Mail } from "lucide-react";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase.from("contact_messages").select("*")
    .eq("is_archived", false).order("created_at", { ascending: false });
  return (
    <RequireAdmin minRole="officer">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-royal-900">Messages</h1>
          <p className="text-sm text-charcoal/60">Contact form submissions.</p>
        </div>
        <DataTable
          columns={[
            { header: "Name", render: (m: any) => <span className={m.is_read ? "" : "font-bold"}>{m.name}</span> },
            { header: "Email", render: (m: any) => m.email },
            { header: "Subject", render: (m: any) => m.subject || "—" },
            { header: "Received", render: (m: any) => formatDateTime(m.created_at) },
          ]}
          rows={messages ?? []}
          emptyIcon={Mail}
          emptyTitle="No messages"
          rowActions={(m: any) => <MessageRowActions message={m} />}
        />
      </div>
    </RequireAdmin>
  );
}

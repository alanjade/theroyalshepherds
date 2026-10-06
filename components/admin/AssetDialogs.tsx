import { createClient } from "@/lib/supabase/server";
import { AssetFormDialog } from "@/components/admin/AssetFormDialog";
import { AssetCheckoutDialog } from "@/components/admin/AssetCheckoutDialog";
import { AssetCheckinDialog } from "@/components/admin/AssetCheckinDialog";

/**
 * Renders whichever asset dialog the URL asks for (?new=1, ?edit=<id>, ?checkout=<id>, ?checkin=<id>).
 * Add/edit are admin-only; check-out/in are open to every admin-area role.
 */
export async function AssetDialogs({
  sp, canManage, basePath = "/admin/assets",
}: {
  sp: Record<string, string | undefined>;
  canManage: boolean;
  basePath?: string;
}) {
  const supabase = await createClient();

  if (canManage && sp.new === "1") return <AssetFormDialog basePath={basePath} />;

  if (canManage && sp.edit) {
    const { data: asset } = await supabase.from("assets").select("*").eq("id", sp.edit).single();
    if (asset) return <AssetFormDialog asset={asset} basePath={basePath} />;
  }

  if (sp.checkout) {
    const [{ data: asset }, { data: members }] = await Promise.all([
      supabase.from("assets").select("id, name, asset_tag, condition, status").eq("id", sp.checkout).single(),
      supabase.from("members").select("id, full_name, ranks(name)")
        .eq("status", "active").order("full_name").limit(1000),
    ]);
    if (asset && asset.status === "available") {
      const options = (members ?? []).map((m: any) => ({
        id: m.id, label: m.ranks?.name ? `${m.full_name} — ${m.ranks.name}` : m.full_name,
      }));
      return <AssetCheckoutDialog asset={asset} members={options} basePath={basePath} />;
    }
  }

  if (sp.checkin) {
    const [{ data: asset }, { data: loan }] = await Promise.all([
      supabase.from("assets").select("id, name, asset_tag, condition, status").eq("id", sp.checkin).single(),
      supabase.from("asset_checkouts").select("borrower_name").eq("asset_id", sp.checkin).is("checked_in_at", null).maybeSingle(),
    ]);
    if (asset && asset.status === "checked_out" && loan) {
      return <AssetCheckinDialog asset={asset} borrower={loan.borrower_name} basePath={basePath} />;
    }
  }

  return null;
}

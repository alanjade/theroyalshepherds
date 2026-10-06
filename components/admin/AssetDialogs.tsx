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
      supabase.from("assets").select("id, name, asset_tag, condition, status, tracking, quantity").eq("id", sp.checkout).single(),
      supabase.from("members").select("id, full_name, ranks(name)")
        .eq("status", "active").order("full_name").limit(1000),
    ]);
    const { data: open } = asset
      ? await supabase.from("asset_checkouts").select("quantity").eq("asset_id", asset.id).is("checked_in_at", null)
      : { data: [] as { quantity: number }[] };
    const available = asset ? asset.quantity - (open ?? []).reduce((n: number, l: any) => n + l.quantity, 0) : 0;
    if (asset && asset.status === "available" && available > 0) {
      const options = (members ?? []).map((m: any) => ({
        id: m.id, label: m.ranks?.name ? `${m.full_name} — ${m.ranks.name}` : m.full_name,
      }));
      return <AssetCheckoutDialog asset={asset} available={available} members={options} basePath={basePath} />;
    }
  }

  if (sp.checkin) {
    const [{ data: asset }, { data: loan }] = await Promise.all([
      supabase.from("assets").select("id, name, asset_tag, condition, tracking").eq("id", sp.checkin).single(),
      supabase.from("asset_checkouts").select("id, borrower_name, quantity, due_date")
        .eq("asset_id", sp.checkin).is("checked_in_at", null).order("checked_out_at"),
    ]);
    if (asset && loan && loan.length > 0) {
      return <AssetCheckinDialog asset={asset} loans={loan} basePath={basePath} />;
    }
  }

  return null;
}

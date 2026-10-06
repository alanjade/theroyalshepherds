import Link from "next/link";
import { notFound } from "next/navigation";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { DataTable } from "@/components/admin/DataTable";
import { AssetDialogs } from "@/components/admin/AssetDialogs";
import { AssetRowActions } from "@/components/admin/AssetRowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { hasRole } from "@/lib/auth/roles";
import { formatDate, formatDateTime } from "@/lib/utils/dates";
import { summarize } from "@/lib/utils/assets";
import { ArrowLeft, History } from "lucide-react";

export default async function AssetDetailPage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { profile } = await requireUser();
  const canManage = hasRole(profile.role, "admin");
  const supabase = await createClient();

  const [{ data: asset }, { data: loans }] = await Promise.all([
    supabase.from("assets").select("*").eq("id", id).single(),
    supabase.from("asset_checkouts").select("*").eq("asset_id", id).order("checked_out_at", { ascending: false }).limit(200),
  ]);
  if (!asset) notFound();

  const sum = summarize({ ...asset, asset_checkouts: loans ?? [] });
  const bulk = asset.tracking === "bulk";
  const basePath = `/admin/assets/${id}`;

  const info: [string, string | null][] = [
    ["Type", bulk ? "Bulk stock" : "Individual item"],
    ["Category", asset.category],
    bulk ? ["Stock", `${sum.available} of ${asset.quantity} available`] : ["Serial number", asset.serial_number],
    ["Storage location", asset.location],
    ["Condition", asset.condition],
  ];

  return (
    <RequireAdmin minRole="officer">
      <div className="space-y-6">
        <Link href="/admin/assets" className="inline-flex items-center gap-1 text-sm text-royal-700 hover:text-gold-600">
          <ArrowLeft className="h-4 w-4" /> All assets
        </Link>

        <div className="bg-white rounded-xl2 border border-royal-100 p-5 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-royal-900">{asset.name}</h1>
              <p className="text-sm text-charcoal/60">{asset.asset_tag}</p>
            </div>
            <StatusBadge status={sum.display} />
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
            {info.map(([label, value]) => (
              <div key={label}>
                <dt className="text-charcoal/50">{label}</dt>
                <dd className="font-medium capitalize">{value || "—"}</dd>
              </div>
            ))}
          </dl>
          {asset.description && <p className="text-sm text-charcoal/80">{asset.description}</p>}

          {sum.loans.length > 0 && (
            <div className="space-y-2">
              {sum.loans.map((l) => (
                <div key={l.id} className={`rounded-lg border p-3 text-sm ${l.due_date && l.due_date < new Date().toISOString().slice(0, 10) ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                  <p className="font-semibold">With {l.borrower_name}{bulk && ` — ${l.quantity} unit${l.quantity === 1 ? "" : "s"}`}</p>
                  <p className="text-charcoal/70">
                    Out since {formatDateTime(l.checked_out_at)}
                    {l.due_date && <> · due {formatDate(l.due_date)}</>}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-royal-100">
            <AssetRowActions asset={{ ...asset, available: sum.available, out: sum.out }} canManage={canManage} basePath={basePath} />
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-royal-900 mb-3 text-sm">Loan history</h2>
          <DataTable
            columns={[
              { header: "Borrower", render: (l: any) => bulk ? `${l.borrower_name} × ${l.quantity}` : l.borrower_name },
              { header: "Checked out", render: (l: any) => formatDateTime(l.checked_out_at) },
              { header: "Due", render: (l: any) => (l.due_date ? formatDate(l.due_date) : "—") },
              { header: "Returned", render: (l: any) => (l.checked_in_at ? formatDateTime(l.checked_in_at) : "Not yet") },
              {
                header: "Condition",
                render: (l: any) => <span className="capitalize">{l.condition_out ?? "—"}{l.condition_in ? ` → ${l.condition_in}` : ""}</span>,
              },
              { header: "Notes", render: (l: any) => [l.notes_out, l.notes_in].filter(Boolean).join(" · ") || "—" },
            ]}
            rows={loans ?? []}
            emptyIcon={History}
            emptyTitle="This asset has never been checked out"
          />
        </div>
      </div>

      <AssetDialogs sp={sp} canManage={canManage} basePath={basePath} />
    </RequireAdmin>
  );
}

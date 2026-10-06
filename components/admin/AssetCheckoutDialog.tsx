"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkOutAsset } from "@/app/actions/assets";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

const inputClass = "w-full rounded-lg border border-royal-200 px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium text-royal-900 mb-1";

export function AssetCheckoutDialog({
  asset, available, members, basePath = "/admin/assets",
}: {
  asset: { id: string; name: string; asset_tag: string | null; condition: string; tracking: string };
  available: number;
  members: { id: string; label: string }[];
  basePath?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [memberId, setMemberId] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  function close() { router.push(basePath); }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await checkOutAsset(formData);
      if (res.success) { router.push(basePath); router.refresh(); } else { setError(res.error); }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl2 shadow-card max-w-lg w-full max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-royal-100">
          <div>
            <h2 className="font-display font-bold text-royal-900">Check Out</h2>
            <p className="text-xs text-charcoal/60">{asset.asset_tag} · {asset.name}</p>
          </div>
          <button onClick={close} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <form action={handleSubmit} className="p-5 space-y-4">
          <input type="hidden" name="asset_id" value={asset.id} />
          <div>
            <label className={labelClass}>Member</label>
            <select name="member_id" value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputClass}>
              <option value="">Select a member…</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          {asset.tracking === "bulk" && (
            <div>
              <label className={labelClass}>Quantity * <span className="font-normal text-charcoal/50">({available} available)</span></label>
              <input type="number" name="quantity" min={1} max={available} defaultValue={1} required className={inputClass} />
            </div>
          )}
          {!memberId && (
            <div>
              <label className={labelClass}>…or borrower name (non-member)</label>
              <input name="borrower_name" maxLength={120} className={inputClass} placeholder="Full name" />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Due back</label><input type="date" name="due_date" min={today} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Condition going out</label>
              <select name="condition_out" defaultValue={asset.condition} className={inputClass}>
                <option value="new">New</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option>
              </select>
            </div>
          </div>
          <div><label className={labelClass}>Notes</label><textarea name="notes_out" rows={2} maxLength={1000} className={inputClass} /></div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Check Out"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

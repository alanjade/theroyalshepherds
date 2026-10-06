"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkInAsset } from "@/app/actions/assets";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

const inputClass = "w-full rounded-lg border border-royal-200 px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium text-royal-900 mb-1";

export function AssetCheckinDialog({
  asset, borrower, basePath = "/admin/assets",
}: {
  asset: { id: string; name: string; asset_tag: string | null; condition: string };
  borrower: string;
  basePath?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function close() { router.push(basePath); }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await checkInAsset(formData);
      if (res.success) { router.push(basePath); router.refresh(); } else { setError(res.error); }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl2 shadow-card max-w-lg w-full max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-royal-100">
          <div>
            <h2 className="font-display font-bold text-royal-900">Check In</h2>
            <p className="text-xs text-charcoal/60">{asset.asset_tag} · {asset.name} · from {borrower}</p>
          </div>
          <button onClick={close} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <form action={handleSubmit} className="p-5 space-y-4">
          <input type="hidden" name="asset_id" value={asset.id} />
          <div>
            <label className={labelClass}>Condition on return</label>
            <select name="condition_in" defaultValue={asset.condition} className={inputClass}>
              <option value="new">New</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="needs_maintenance" className="rounded" /> Needs repair / maintenance before it can be lent again
          </label>
          <div><label className={labelClass}>Notes</label><textarea name="notes_in" rows={2} maxLength={1000} className={inputClass} placeholder="Damage, missing parts…" /></div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Check In"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

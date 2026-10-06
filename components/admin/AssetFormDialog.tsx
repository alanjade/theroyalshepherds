"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAsset, updateAsset } from "@/app/actions/assets";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

const inputClass = "w-full rounded-lg border border-royal-200 px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium text-royal-900 mb-1";

type Asset = {
  id: string; name: string; asset_tag: string | null; category: string | null; serial_number: string | null;
  location: string | null; description: string | null; condition: string;
  tracking: string; quantity: number;
};

export function AssetFormDialog({ asset, basePath = "/admin/assets" }: { asset?: Asset; basePath?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const editing = !!asset;
  const [tracking, setTracking] = useState(asset?.tracking ?? "individual");
  const bulk = tracking === "bulk";

  function close() { router.push(basePath); }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = editing ? await updateAsset(asset!.id, formData) : await createAsset(formData);
      if (res.success) { router.push(basePath); router.refresh(); } else { setError(res.error); }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl2 shadow-card max-w-lg w-full max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-royal-100">
          <h2 className="font-display font-bold text-royal-900">{editing ? "Edit Asset" : "Add Asset"}</h2>
          <button onClick={close} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <form action={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Type</label>
            {editing ? (
              <>
                <input type="hidden" name="tracking" value={tracking} />
                <p className="text-sm rounded-lg bg-royal-50/60 px-3 py-2">{bulk ? "Bulk stock (quantity)" : "Individual item"} <span className="text-charcoal/50">· fixed once created</span></p>
              </>
            ) : (
              <select name="tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} className={inputClass}>
                <option value="individual">Individual item — tracked on its own (serial number)</option>
                <option value="bulk">Bulk stock — identical items counted by quantity</option>
              </select>
            )}
          </div>
          <div><label className={labelClass}>Name *</label><input name="name" required defaultValue={asset?.name} className={inputClass} placeholder="e.g. Brass band drum" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Asset tag</label>
              <input name="asset_tag" defaultValue={asset?.asset_tag ?? ""} className={inputClass} placeholder="Auto (AST-0001)" />
            </div>
            <div><label className={labelClass}>Category</label><input name="category" defaultValue={asset?.category ?? ""} className={inputClass} placeholder="e.g. Instruments" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bulk ? (
              <div>
                <label className={labelClass}>Total quantity *</label>
                <input type="number" name="quantity" min={1} max={100000} required defaultValue={asset?.quantity ?? 1} className={inputClass} />
              </div>
            ) : (
              <div><label className={labelClass}>Serial number</label><input name="serial_number" defaultValue={asset?.serial_number ?? ""} className={inputClass} /></div>
            )}
            <div><label className={labelClass}>Storage location</label><input name="location" defaultValue={asset?.location ?? ""} className={inputClass} placeholder="e.g. Store room" /></div>
          </div>
          <div>
            <label className={labelClass}>{bulk ? "Typical condition" : "Condition"}</label>
            <select name="condition" defaultValue={asset?.condition ?? "good"} className={inputClass}>
              <option value="new">New</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option>
            </select>
          </div>
          <div><label className={labelClass}>Description</label><textarea name="description" rows={3} defaultValue={asset?.description ?? ""} className={inputClass} /></div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : editing ? "Save Changes" : "Add Asset"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

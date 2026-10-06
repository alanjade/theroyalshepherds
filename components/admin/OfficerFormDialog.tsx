"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignOfficer } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

const inputClass = "w-full rounded-lg border border-royal-200 px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium text-royal-900 mb-1";

export function OfficerFormDialog({
  members, positions,
}: {
  members: { id: string; label: string }[];
  positions: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function close() { router.push("/admin/officers"); }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await assignOfficer(formData);
      if (res.success) {
        router.push("/admin/officers");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl2 shadow-card max-w-lg w-full max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-royal-100">
          <h2 className="font-display font-bold text-royal-900">Assign Officer</h2>
          <button onClick={close} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <form action={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Member *</label>
            <select name="member_id" required defaultValue="" className={inputClass}>
              <option value="" disabled>Select a member…</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Position</label>
            <select name="position_id" defaultValue="" className={inputClass}>
              <option value="">{positions.length ? "Select a position…" : "No positions yet — add one below"}</option>
              {positions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>…or add a new position</label>
            <input name="new_position" maxLength={100} placeholder="e.g. Company Secretary" className={inputClass} />
            <p className="text-xs text-charcoal/50 mt-1">If you type a new position it is used instead of the one selected above.</p>
            <label className="flex items-center gap-2 text-sm mt-2">
              <input type="checkbox" name="church_appointed" className="rounded" /> New position is appointed by the church (patron, chaplain…)
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="public_visible" defaultChecked className="rounded" /> Show on the public Leadership page
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Assign Officer"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

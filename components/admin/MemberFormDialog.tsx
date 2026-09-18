"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMember } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

const inputClass = "w-full rounded-lg border border-royal-200 px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium text-royal-900 mb-1";

export function MemberFormDialog({
  ranks, units,
}: { ranks: { id: string; name: string }[]; units: { id: string; name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function close() {
    router.push("/admin/members");
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await createMember(formData);
      if (res.success) {
        router.push("/admin/members");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl2 shadow-card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-royal-100">
          <h2 className="font-display font-bold text-royal-900">Add Member</h2>
          <button onClick={close} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <form action={handleSubmit} className="p-5 space-y-4">
          <div><label className={labelClass}>Full Name *</label><input name="full_name" required className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Rank</label>
              <select name="rank_id" className={inputClass}>
                <option value="">—</option>
                {ranks.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <select name="unit_id" className={inputClass}>
                <option value="">—</option>
                {units.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Phone</label><input name="phone" className={inputClass} /></div>
            <div><label className={labelClass}>Email</label><input name="email" type="email" className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Short Bio</label><textarea name="short_bio" rows={2} className={inputClass} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="public_profile" className="rounded" /> Show public profile on the website
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save Member"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

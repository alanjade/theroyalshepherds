"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMember } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

const inputClass = "w-full rounded-lg border border-royal-200 px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium text-royal-900 mb-1";

export function MemberEditDialog({
  member, ranks, units,
}: {
  member: any;
  ranks: { id: string; name: string }[];
  units: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const back = `/admin/members/${member.id}`;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateMember(member.id, formData);
      if (res.success) { router.push(back); router.refresh(); }
      else setError(res.error);
    });
  }

  const v = (x: string | null | undefined) => x ?? "";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl2 shadow-card max-w-lg w-full max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-royal-100">
          <h2 className="font-display font-bold text-royal-900">Edit Profile</h2>
          <button onClick={() => router.push(back)} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <form action={handleSubmit} className="p-5 space-y-4">
          <div><label className={labelClass}>Full Name *</label><input name="full_name" required defaultValue={member.full_name} className={inputClass} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Rank</label>
              <select name="rank_id" defaultValue={v(member.rank_id)} className={inputClass}>
                <option value="">—</option>
                {ranks.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <select name="unit_id" defaultValue={v(member.unit_id)} className={inputClass}>
                <option value="">—</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" defaultValue={member.status} className={inputClass}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" defaultValue={v(member.gender)} className={inputClass}>
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Phone</label><input name="phone" defaultValue={v(member.phone)} className={inputClass} /></div>
            <div><label className={labelClass}>Email</label><input name="email" type="email" defaultValue={v(member.email)} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Date of Birth</label><input name="date_of_birth" type="date" defaultValue={v(member.date_of_birth)} className={inputClass} /></div>
            <div><label className={labelClass}>Occupation</label><input name="occupation" defaultValue={v(member.occupation)} className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Address</label><input name="address" defaultValue={v(member.address)} className={inputClass} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Guardian Name</label><input name="guardian_name" defaultValue={v(member.guardian_name)} className={inputClass} /></div>
            <div><label className={labelClass}>Guardian Phone</label><input name="guardian_phone" defaultValue={v(member.guardian_phone)} className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Emergency Contact</label><input name="emergency_contact" defaultValue={v(member.emergency_contact)} className={inputClass} /></div>
          <div><label className={labelClass}>Short Bio</label><textarea name="short_bio" rows={3} defaultValue={v(member.short_bio)} className={inputClass} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="public_profile" defaultChecked={member.public_profile} className="rounded" /> Show public profile on the website
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.push(back)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save Changes"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

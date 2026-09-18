"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

const inputClass = "w-full rounded-lg border border-royal-200 px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium text-royal-900 mb-1";

export function EventFormDialog() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function close() { router.push("/admin/events"); }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await createEvent(formData);
      if (res.success) { router.push("/admin/events"); router.refresh(); }
      else setError(res.error);
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl2 shadow-card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-royal-100">
          <h2 className="font-display font-bold text-royal-900">Create Event</h2>
          <button onClick={close} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <form action={handleSubmit} className="p-5 space-y-4">
          <div><label className={labelClass}>Title *</label><input name="title" required className={inputClass} /></div>
          <div><label className={labelClass}>Short Description</label><input name="short_description" className={inputClass} /></div>
          <div><label className={labelClass}>Full Description</label><textarea name="description" rows={4} className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Start Date *</label><input name="start_date" type="date" required className={inputClass} /></div>
            <div><label className={labelClass}>End Date</label><input name="end_date" type="date" className={inputClass} /></div>
            <div><label className={labelClass}>Start Time</label><input name="start_time" type="time" className={inputClass} /></div>
            <div><label className={labelClass}>End Time</label><input name="end_time" type="time" className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Location</label><input name="location" className={inputClass} /></div>
          <div><label className={labelClass}>Category</label><input name="category" className={inputClass} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="registration_enabled" className="rounded" /> Enable registration
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Registration Deadline</label><input name="registration_deadline" type="datetime-local" className={inputClass} /></div>
            <div><label className={labelClass}>Capacity</label><input name="registration_capacity" type="number" min={1} className={inputClass} /></div>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" defaultValue="draft" className={inputClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save Event"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

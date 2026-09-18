"use client";

import { useState, useTransition } from "react";
import { submitMembershipApplication } from "@/app/actions/public";
import { Button } from "@/components/ui/Button";

const inputClass = "w-full rounded-lg border border-royal-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal-300";
const labelClass = "block text-sm font-medium text-royal-900 mb-1";

export function MembershipApplicationForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await submitMembershipApplication(formData);
      setResult(res.success ? { success: true } : { success: false, error: res.error });
    });
  }

  if (result?.success) {
    return (
      <p className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-4 text-sm font-medium">
        Thank you for applying! We&apos;ve emailed you a confirmation and will review your application soon.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={labelClass}>Full Name *</label><input name="full_name" required className={inputClass} /></div>
        <div><label className={labelClass}>Email *</label><input name="email" type="email" required className={inputClass} /></div>
        <div><label className={labelClass}>Phone *</label><input name="phone" required className={inputClass} /></div>
        <div><label className={labelClass}>Date of Birth *</label><input name="date_of_birth" type="date" required className={inputClass} /></div>
        <div>
          <label className={labelClass}>Gender *</label>
          <select name="gender" required className={inputClass}>
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div><label className={labelClass}>Church *</label><input name="church" required className={inputClass} /></div>
      </div>
      <div><label className={labelClass}>Address *</label><textarea name="address" rows={2} required className={inputClass} /></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={labelClass}>Parent/Guardian Name</label><input name="parent_or_guardian_name" className={inputClass} /></div>
        <div><label className={labelClass}>Parent/Guardian Phone</label><input name="parent_or_guardian_phone" className={inputClass} /></div>
      </div>
      <div><label className={labelClass}>Emergency Contact</label><input name="emergency_contact" className={inputClass} /></div>
      <div><label className={labelClass}>Previous Experience</label><textarea name="previous_experience" rows={3} className={inputClass} /></div>
      <div><label className={labelClass}>Anything else you&apos;d like us to know?</label><textarea name="message" rows={3} className={inputClass} /></div>
      {result?.error && <p className="text-sm text-red-600">{result.error}</p>}
      <Button type="submit" disabled={isPending} size="lg">{isPending ? "Submitting…" : "Submit Application"}</Button>
    </form>
  );
}

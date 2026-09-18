"use client";

import { useState, useTransition } from "react";
import { registerForEvent } from "@/app/actions/public";
import { Button } from "@/components/ui/Button";

export function RegistrationForm({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await registerForEvent(eventId, formData);
      setResult(res.success ? { success: true } : { success: false, error: res.error });
    });
  }

  if (result?.success) {
    return (
      <p className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm font-medium">
        You&apos;re registered! Check your email for confirmation.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="grid sm:grid-cols-2 gap-4">
      <Field label="Full Name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone" name="phone" />
      <div>
        <label className="block text-sm font-medium text-royal-900 mb-1">Membership Status</label>
        <select name="membership_status" required className="w-full rounded-lg border border-royal-200 px-3 py-2 text-sm">
          <option value="member">Existing Member</option>
          <option value="non_member">Not Yet a Member</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-royal-900 mb-1">Notes (optional)</label>
        <textarea name="notes" rows={3} className="w-full rounded-lg border border-royal-200 px-3 py-2 text-sm" />
      </div>
      {result?.error && <p className="sm:col-span-2 text-sm text-red-600">{result.error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending}>{isPending ? "Submitting…" : "Register"}</Button>
      </div>
    </form>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-royal-900 mb-1">{label}{required && " *"}</label>
      <input id={name} name={name} type={type} required={required}
        className="w-full rounded-lg border border-royal-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal-300" />
    </div>
  );
}

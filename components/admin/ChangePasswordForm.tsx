"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeOwnPassword } from "@/app/actions/account";
import { Button } from "@/components/ui/Button";

const inputClass = "w-full rounded-lg border border-royal-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal-300";

export function ChangePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await changeOwnPassword(password, confirm);
      if (res.success) { router.push("/admin"); router.refresh(); }
      else setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-royal-900 mb-1">New password</label>
        <input id="new-password" type="password" required minLength={8} autoComplete="new-password"
          value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-royal-900 mb-1">Confirm new password</label>
        <input id="confirm-password" type="password" required minLength={8} autoComplete="new-password"
          value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
      </div>
      <p className="text-xs text-charcoal/50">At least 8 characters. Use something only you know.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Saving…" : "Save new password"}</Button>
    </form>
  );
}

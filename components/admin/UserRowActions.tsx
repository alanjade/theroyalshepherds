"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeAccessRole, resetAccessPassword, revokeAccess } from "@/app/actions/users";

export function UserRowActions({
  profile, isSelf,
}: { profile: { id: string; role: string; full_name: string }; isSelf: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isSelf || profile.role === "super_admin") {
    return <span className="text-xs text-charcoal/40">{isSelf ? "You" : "Protected"}</span>;
  }

  function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.success) setError(res.error ?? "Something went wrong.");
      router.refresh();
    });
  }

  function reset() {
    const pw = prompt(`New temporary password for ${profile.full_name} (at least 8 characters):`);
    if (!pw) return;
    run(async () => {
      const res = await resetAccessPassword(profile.id, pw);
      if (res.success) alert("Password reset. Share the new password with the member.");
      return res;
    });
  }

  function revoke() {
    if (!confirm(`Remove ${profile.full_name}'s login? Their member record stays.`)) return;
    run(() => revokeAccess(profile.id));
  }

  return (
    <div className="space-y-1">
      <div className="inline-flex items-center gap-3">
        <select value={profile.role} disabled={pending} aria-label="Role"
          onChange={(e) => run(() => changeAccessRole(profile.id, e.target.value))}
          className="rounded-lg border border-royal-200 px-2 py-1 text-sm">
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="officer">Officer</option>
        </select>
        <button onClick={reset} disabled={pending} className="text-sm text-royal-700 hover:text-gold-600 font-medium">Reset password</button>
        <button onClick={revoke} disabled={pending} className="text-sm text-red-600 hover:text-red-800 font-medium">Remove</button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

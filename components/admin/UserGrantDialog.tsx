"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { grantAccess } from "@/app/actions/users";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

const inputClass = "w-full rounded-lg border border-royal-200 px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium text-royal-900 mb-1";

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function UserGrantDialog({
  members,
}: { members: { id: string; label: string; email: string | null }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState<{ email: string; password: string } | null>(null);

  function close() { router.push("/admin/users"); router.refresh(); }

  function onMemberChange(id: string) {
    const m = members.find((x) => x.id === id);
    if (m?.email && !email) setEmail(m.email);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await grantAccess(formData);
      if (res.success) setDone({ email: String(formData.get("email")), password: String(formData.get("password")) });
      else setError(res.error);
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl2 shadow-card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-royal-100">
          <h2 className="font-display font-bold text-royal-900">{done ? "Access granted" : "Grant Admin Access"}</h2>
          <button onClick={close} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        {done ? (
          <div className="p-5 space-y-4">
            <p className="text-sm">Share these sign-in details with the member. This password is not shown again.</p>
            <div className="rounded-lg bg-royal-50 p-4 text-sm space-y-1 font-mono break-all">
              <div>Email: {done.email}</div>
              <div>Password: {done.password}</div>
            </div>
            <div className="flex justify-end"><Button onClick={close}>Done</Button></div>
          </div>
        ) : (
          <form action={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className={labelClass}>Member *</label>
              <select name="member_id" required defaultValue="" onChange={(e) => onMemberChange(e.target.value)} className={inputClass}>
                <option value="" disabled>Select a member…</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Sign-in email *</label>
              <input name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Role *</label>
              <select name="role" required defaultValue="admin" className={inputClass}>
                <option value="admin">Admin — manage members, officers, applications and settings</option>
                <option value="editor">Editor — events, news, gallery and resources</option>
                <option value="officer">Officer — view the dashboard and messages</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Temporary password *</label>
              <div className="flex gap-2">
                <input name="password" type="text" required minLength={8} value={password}
                  onChange={(e) => setPassword(e.target.value)} className={inputClass + " font-mono"} />
                <Button type="button" variant="outline" size="sm" onClick={() => setPassword(generatePassword())}>Generate</Button>
              </div>
              <p className="text-xs text-charcoal/50 mt-1">At least 8 characters. Ask the member to change it after signing in.</p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Creating…" : "Grant Access"}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

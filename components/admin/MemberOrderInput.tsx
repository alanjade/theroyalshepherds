"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMemberOrder } from "@/app/actions/admin";

export function MemberOrderInput({ id, value }: { id: string; value: number }) {
  const router = useRouter();
  const [current, setCurrent] = useState(String(value));
  const [pending, startTransition] = useTransition();

  function save() {
    const n = Number(current);
    if (!Number.isFinite(n) || n === value) { setCurrent(String(value)); return; }
    startTransition(async () => { await updateMemberOrder(id, n); router.refresh(); });
  }

  return (
    <input
      type="number" min={0} value={current} disabled={pending}
      aria-label="Display order"
      onChange={(e) => setCurrent(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      className="w-20 rounded-lg border border-royal-200 px-2 py-1 text-sm"
    />
  );
}

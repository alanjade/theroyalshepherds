"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeOfficer, setOfficerVisibility } from "@/app/actions/admin";

export function OfficerRowActions({ officer }: { officer: { id: string; public_visible: boolean } }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => { await setOfficerVisibility(officer.id, !officer.public_visible); router.refresh(); });
  }
  function remove() {
    if (!confirm("Remove this officer assignment? The member stays in the members list.")) return;
    startTransition(async () => { await removeOfficer(officer.id); router.refresh(); });
  }

  return (
    <div className="inline-flex items-center gap-4">
      <button onClick={toggle} disabled={pending} className="text-sm text-royal-700 hover:text-gold-600 font-medium">
        {officer.public_visible ? "Hide" : "Show"}
      </button>
      <button onClick={remove} disabled={pending} className="text-sm text-red-600 hover:text-red-800 font-medium">Remove</button>
    </div>
  );
}

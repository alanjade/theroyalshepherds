"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveMember, restoreMember } from "@/app/actions/admin";

export function MemberRowActions({ member }: { member: { id: string; status: string } }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleArchive() {
    if (!confirm("Archive this member? They will no longer appear as active.")) return;
    startTransition(async () => { await archiveMember(member.id); router.refresh(); });
  }
  function handleRestore() {
    startTransition(async () => { await restoreMember(member.id); router.refresh(); });
  }

  return member.status === "archived" ? (
    <button onClick={handleRestore} disabled={isPending} className="text-sm text-royal-700 hover:text-gold-600 font-medium">Restore</button>
  ) : (
    <button onClick={handleArchive} disabled={isPending} className="text-sm text-red-600 hover:text-red-800 font-medium">Archive</button>
  );
}

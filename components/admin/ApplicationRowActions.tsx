"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveApplication, reviewApplication } from "@/app/actions/admin";

export function ApplicationRowActions({ application }: { application: { id: string; status: string } }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    if (!confirm("Approve this application? A member record and membership number will be created.")) return;
    startTransition(async () => {
      const res = await approveApplication(application.id);
      if (!res.success) alert(res.error);
      router.refresh();
    });
  }
  function handleReject() {
    if (!confirm("Reject this application?")) return;
    startTransition(async () => { await reviewApplication(application.id, "rejected"); router.refresh(); });
  }

  if (application.status === "approved") return <span className="text-xs text-charcoal/50">Converted to member</span>;
  if (application.status === "rejected") return <span className="text-xs text-charcoal/50">Rejected</span>;

  return (
    <div className="flex justify-end gap-3 text-sm">
      <button onClick={handleApprove} disabled={isPending} className="text-emerald-700 hover:text-emerald-900 font-medium">Approve</button>
      <button onClick={handleReject} disabled={isPending} className="text-red-600 hover:text-red-800 font-medium">Reject</button>
    </div>
  );
}

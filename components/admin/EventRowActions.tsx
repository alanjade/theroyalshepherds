"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEventStatus, deleteEvent } from "@/app/actions/admin";

export function EventRowActions({ event }: { event: { id: string; status: string } }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setStatus(status: string) {
    startTransition(async () => { await updateEventStatus(event.id, status); router.refresh(); });
  }
  function handleDelete() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    startTransition(async () => { await deleteEvent(event.id); router.refresh(); });
  }

  return (
    <div className="flex justify-end gap-3 text-sm">
      {event.status !== "published" && (
        <button onClick={() => setStatus("published")} disabled={isPending} className="text-royal-700 hover:text-gold-600 font-medium">Publish</button>
      )}
      {event.status === "published" && (
        <button onClick={() => setStatus("cancelled")} disabled={isPending} className="text-amber-700 hover:text-amber-900 font-medium">Cancel</button>
      )}
      <button onClick={handleDelete} disabled={isPending} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
    </div>
  );
}

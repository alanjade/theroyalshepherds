"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markMessageRead, archiveMessage } from "@/app/actions/admin";

export function MessageRowActions({ message }: { message: { id: string; is_read: boolean } }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex justify-end gap-3 text-sm">
      <button disabled={isPending} className="text-royal-700 hover:text-gold-600 font-medium"
        onClick={() => startTransition(async () => { await markMessageRead(message.id, !message.is_read); router.refresh(); })}>
        {message.is_read ? "Mark unread" : "Mark read"}
      </button>
      <button disabled={isPending} className="text-red-600 hover:text-red-800 font-medium"
        onClick={() => startTransition(async () => { await archiveMessage(message.id); router.refresh(); })}>
        Archive
      </button>
    </div>
  );
}

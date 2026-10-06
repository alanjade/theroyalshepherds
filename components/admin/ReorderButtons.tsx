"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";
import { moveLookupItem } from "@/app/actions/admin";

export function ReorderButtons({
  table, id, isFirst, isLast,
}: { table: "ranks" | "units" | "officers"; id: string; isFirst: boolean; isLast: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function move(direction: "up" | "down") {
    startTransition(async () => { await moveLookupItem(table, id, direction); router.refresh(); });
  }

  const btn = "rounded-md border border-royal-200 p-1 text-royal hover:bg-royal-50 disabled:opacity-30 disabled:pointer-events-none";
  return (
    <div className="inline-flex gap-1">
      <button type="button" aria-label="Move up" disabled={pending || isFirst} onClick={() => move("up")} className={btn}>
        <ChevronUp className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Move down" disabled={pending || isLast} onClick={() => move("down")} className={btn}>
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}

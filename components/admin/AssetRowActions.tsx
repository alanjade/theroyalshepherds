"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAssetStatus, deleteAsset } from "@/app/actions/assets";

/** Check out / check in for officers and above; edit, status and delete for admins only. */
export function AssetRowActions({
  asset, canManage, basePath = "/admin/assets",
}: {
  asset: { id: string; status: string; available: number; out: number };
  canManage: boolean;
  basePath?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const link = "text-sm font-medium text-royal-700 hover:text-gold-600";

  function change(status: string) {
    startTransition(async () => {
      const res = await setAssetStatus(asset.id, status);
      if (!res.success) alert(res.error);
      router.refresh();
    });
  }
  function remove() {
    if (!confirm("Delete this asset and its loan history? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteAsset(asset.id);
      if (!res.success) alert(res.error);
      router.push("/admin/assets");
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center gap-4 flex-wrap justify-end">
      {asset.status === "available" && asset.available > 0 && <Link href={`${basePath}?checkout=${asset.id}` as any} className={link}>Check out</Link>}
      {asset.out > 0 && <Link href={`${basePath}?checkin=${asset.id}` as any} className={link}>Check in</Link>}
      {canManage && (
        <>
          <Link href={`${basePath}?edit=${asset.id}` as any} className={link}>Edit</Link>
          {asset.status === "available" && asset.out === 0 && <button onClick={() => change("maintenance")} disabled={pending} className="text-sm font-medium text-amber-700 hover:text-amber-900">Maintenance</button>}
          {(asset.status === "maintenance" || asset.status === "retired") && <button onClick={() => change("available")} disabled={pending} className={link}>Make available</button>}
          {asset.status !== "retired" && asset.out === 0 && <button onClick={() => change("retired")} disabled={pending} className="text-sm font-medium text-charcoal/60 hover:text-charcoal">Retire</button>}
          {asset.out === 0 && <button onClick={remove} disabled={pending} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>}
        </>
      )}
    </div>
  );
}

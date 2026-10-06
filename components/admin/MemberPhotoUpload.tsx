"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateMemberPhoto } from "@/app/actions/admin";

const BUCKET = "company-assets";
const MAX_SIDE = 800; // px — photos are shrunk in the browser before upload

async function shrinkToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.85)
  );
}

export function MemberPhotoUpload({
  memberId, photoUrl, name,
}: { memberId: string; photoUrl: string | null; name: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    setError(null); setBusy(true);
    try {
      const blob = await shrinkToJpeg(file);
      const supabase = createClient();
      const path = `members/${memberId}-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg" });
      if (upErr) throw new Error("upload");
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const res = await updateMemberPhoto(memberId, data.publicUrl);
      if (!res.success) throw new Error(res.error);
      await removeOldFile(photoUrl);
      startTransition(() => router.refresh());
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    if (!confirm("Remove this photo?")) return;
    setBusy(true); setError(null);
    const res = await updateMemberPhoto(memberId, null);
    if (res.success) { await removeOldFile(photoUrl); startTransition(() => router.refresh()); }
    else setError(res.error);
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-24 w-24 rounded-full overflow-hidden bg-royal-100 ring-4 ring-gold-100 shrink-0">
        {photoUrl ? (
          <Image src={photoUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-royal-300"><User className="h-10 w-10" /></div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex gap-3">
          <button type="button" disabled={busy} onClick={() => fileRef.current?.click()}
            className="rounded-lg bg-royal text-white px-3 py-1.5 text-sm font-medium disabled:opacity-50">
            {busy ? "Working…" : photoUrl ? "Change photo" : "Upload photo"}
          </button>
          {photoUrl && (
            <button type="button" disabled={busy} onClick={onRemove} className="text-sm text-red-600 hover:text-red-800 font-medium">Remove</button>
          )}
        </div>
        <p className="text-xs text-charcoal/50">JPG or PNG. Photos are resized automatically.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input ref={fileRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
      </div>
    </div>
  );
}

async function removeOldFile(url: string | null) {
  if (!url) return;
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return;
  const path = url.slice(i + marker.length);
  if (!path.startsWith("members/")) return;
  try { await createClient().storage.from(BUCKET).remove([path]); } catch { /* old file cleanup is best-effort */ }
}

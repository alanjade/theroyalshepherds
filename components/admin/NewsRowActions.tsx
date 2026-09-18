"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteNews } from "@/app/actions/admin";

export function NewsRowActions({ article }: { article: { id: string } }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  function handleDelete() {
    if (!confirm("Delete this article?")) return;
    startTransition(async () => { await deleteNews(article.id); router.refresh(); });
  }
  return <button onClick={handleDelete} disabled={isPending} className="text-sm text-red-600 hover:text-red-800 font-medium">Delete</button>;
}

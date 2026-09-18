import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Pagination({
  page, pageSize, total, basePath, searchParams = {},
}: { page: number; pageSize: number; total: number; basePath: string; searchParams?: Record<string, string | undefined> }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v) as [string, string][]
    );
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn("px-3 py-1.5 rounded-md border text-sm", page === 1 ? "pointer-events-none opacity-40" : "hover:bg-royal-50")}
      >
        Previous
      </Link>
      <span className="text-sm text-charcoal/60 px-2">Page {page} of {totalPages}</span>
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn("px-3 py-1.5 rounded-md border text-sm", page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-royal-50")}
      >
        Next
      </Link>
    </nav>
  );
}

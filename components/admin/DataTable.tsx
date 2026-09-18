import { ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LucideIcon } from "lucide-react";

export function DataTable<T extends { id: string }>({
  columns, rows, emptyIcon, emptyTitle, emptyAction, rowActions,
}: {
  columns: { header: string; render: (row: T) => ReactNode }[];
  rows: T[];
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyAction?: ReactNode;
  rowActions?: (row: T) => ReactNode;
}) {
  if (rows.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} action={emptyAction} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl2 border border-royal-100 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-royal-50/60 text-left">
          <tr>
            {columns.map((c) => <th key={c.header} className="px-4 py-3 font-semibold text-royal-900 whitespace-nowrap">{c.header}</th>)}
            {rowActions && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-royal-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-royal-50/40">
              {columns.map((c) => <td key={c.header} className="px-4 py-3 align-middle">{c.render(row)}</td>)}
              {rowActions && <td className="px-4 py-3 text-right whitespace-nowrap">{rowActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

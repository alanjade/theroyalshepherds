import { ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LucideIcon } from "lucide-react";

/**
 * Admin list view. On tablet/desktop (md+) it renders a table; on phones each row
 * becomes a card: the first column is the card title, the remaining columns are
 * label/value pairs, and the row actions sit at the bottom.
 */
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

  const [titleCol, ...restCols] = columns;

  return (
    <>
      {/* Mobile: cards */}
      <ul className="md:hidden space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl2 border border-royal-100 bg-white p-4 shadow-card">
            <div className="font-semibold text-royal-900 break-words">{titleCol?.render(row)}</div>
            {restCols.length > 0 && (
              <dl className="mt-3 space-y-2 text-sm">
                {restCols.map((c) => (
                  <div key={c.header} className="flex items-center justify-between gap-4">
                    <dt className="text-charcoal/50 shrink-0">{c.header}</dt>
                    <dd className="text-right min-w-0 break-words">{c.render(row)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {rowActions && (
              <div className="mt-3 pt-3 border-t border-royal-100 [&_button]:py-1.5 [&_a]:py-1.5 [&>div]:flex-wrap [&>div]:justify-start">
                {rowActions(row)}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Tablet / desktop: table */}
      <div className="hidden md:block overflow-x-auto rounded-xl2 border border-royal-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-royal-50/60 text-left">
            <tr>
              {columns.map((c) => (
                <th key={c.header} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-royal-900 whitespace-nowrap">{c.header}</th>
              ))}
              {rowActions && <th className="px-4 py-3"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-royal-100">
            {rows.map((row) => (
              <tr key={row.id} className="odd:bg-white even:bg-royal-50/20 hover:bg-royal-50/60">
                {columns.map((c) => <td key={c.header} className="px-4 py-3 align-middle">{c.render(row)}</td>)}
                {rowActions && <td className="px-4 py-3 text-right whitespace-nowrap">{rowActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

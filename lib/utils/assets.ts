const TZ = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Africa/Lagos";

/** Today's date as YYYY-MM-DD in the company's timezone. */
export function todayInTz(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

export function isOverdue(dueDate: string | null | undefined): boolean {
  return !!dueDate && dueDate < todayInTz();
}

export type OpenLoan = {
  id: string; borrower_name: string; quantity: number; due_date: string | null; checked_out_at: string;
};

/**
 * Works out loan totals for an asset row that embeds its checkouts.
 * `display` is the badge to show (bulk stock can be only partly out).
 */
export function summarize(asset: any) {
  const loans: OpenLoan[] = (asset.asset_checkouts ?? []).filter((l: any) => !l.checked_in_at);
  const out = loans.reduce((n, l) => n + (l.quantity ?? 1), 0);
  const available = asset.status === "available" ? Math.max(asset.quantity - out, 0) : 0;
  const overdue = loans.some((l) => isOverdue(l.due_date));

  let display: string = asset.status;
  if (asset.status !== "retired" && asset.status !== "maintenance" && out > 0) {
    display = available === 0 ? "checked_out" : "partly_out";
  }
  if (overdue) display = "overdue";
  return { loans, out, available, overdue, display };
}

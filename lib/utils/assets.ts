const TZ = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Africa/Lagos";

/** Today's date as YYYY-MM-DD in the company's timezone. */
export function todayInTz(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

export function isOverdue(dueDate: string | null | undefined): boolean {
  return !!dueDate && dueDate < todayInTz();
}

import { formatInTimeZone } from "date-fns-tz";

const DEFAULT_TZ = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Africa/Lagos";

export function formatDate(date: string | Date, tz: string = DEFAULT_TZ) {
  return formatInTimeZone(new Date(date), tz, "MMMM d, yyyy");
}

export function formatDateTime(date: string | Date, tz: string = DEFAULT_TZ) {
  return formatInTimeZone(new Date(date), tz, "MMMM d, yyyy 'at' h:mm a");
}

export function formatTime(time: string, tz: string = DEFAULT_TZ) {
  // `time` is a Postgres `time` value like "09:00:00"
  const [h, m] = time.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return formatInTimeZone(d, tz, "h:mm a");
}

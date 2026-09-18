/**
 * Minimal CSV parser — no external dependency. Handles quoted fields
 * (including embedded commas and escaped "" quotes) and CRLF/LF line
 * endings. Returns an array of row objects keyed by the header row.
 * Good enough for admin-uploaded rosters; not a general-purpose RFC 4180
 * parser (e.g. doesn't handle multi-line quoted cells across \n inside a
 * field robustly for every edge case — fine for simple member spreadsheets).
 */
export function parseCsv(text: string): Record<string, string>[] {
  const rows = splitCsvRows(text.replace(/\r\n/g, "\n").replace(/\r/g, "\n"));
  if (rows.length === 0) return [];

  const headers = rows[0]!.map((h) => h.trim());
  return rows.slice(1)
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = (row[i] ?? "").trim(); });
      return obj;
    });
}

function splitCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') { field += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { field += char; }
    } else {
      if (char === '"') inQuotes = true;
      else if (char === ",") { row.push(field); field = ""; }
      else if (char === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else field += char;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

/** Builds a downloadable CSV template matching bulkCreateMembers' expected columns. */
export const MEMBER_IMPORT_TEMPLATE = [
  "full_name,phone,email,date_of_birth,gender,address,church,guardian_name,guardian_phone,emergency_contact,rank,unit,public_profile,short_bio",
  "Jane Doe,08012345678,jane@example.org,2008-04-12,female,\"12 Church Rd, City\",CAC City Assembly,John Doe,08087654321,John Doe - 08087654321,1st Platoon,,yes,Loves choir and outreach",
].join("\n");

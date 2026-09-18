"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkCreateMembers, type BulkImportResult } from "@/app/actions/admin";
import { MEMBER_IMPORT_TEMPLATE } from "@/lib/utils/csv";
import { Button } from "@/components/ui/Button";
import { X, Download, Upload, CheckCircle2, AlertTriangle } from "lucide-react";

export function BulkImportDialog() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function close() {
    router.push("/admin/members");
    router.refresh();
  }

  function downloadTemplate() {
    const blob = new Blob([MEMBER_IMPORT_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "royal-shepherds-member-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await bulkCreateMembers(formData);
      setResult(res);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl2 shadow-card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-royal-100">
          <h2 className="font-display font-bold text-royal-900">Bulk Import Members</h2>
          <button onClick={close} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5 space-y-5">
          <div className="rounded-lg bg-royal-50/60 border border-royal-100 p-4 text-sm text-charcoal/70">
            <p>
              Upload a CSV with a header row. <strong>full_name</strong> is the only required
              column. <code className="text-xs bg-white px-1 py-0.5 rounded border border-royal-100">rank</code> and
              {" "}<code className="text-xs bg-white px-1 py-0.5 rounded border border-royal-100">unit</code> are
              matched by name against your existing ranks/units — leave blank if unsure, or set
              them individually afterwards.
            </p>
            <button onClick={downloadTemplate} className="mt-3 inline-flex items-center gap-1.5 text-royal-700 font-semibold hover:text-gold-600">
              <Download className="h-3.5 w-3.5" /> Download CSV template
            </button>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="csv_file" className="block text-sm font-medium text-royal-900 mb-1">CSV File</label>
              <input ref={fileInputRef} id="csv_file" name="csv_file" type="file" accept=".csv,text/csv" required
                className="w-full text-sm rounded-lg border border-royal-200 px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-royal-900 file:text-white file:px-3 file:py-1.5 file:text-sm" />
            </div>

            {result && result.success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> {result.created} member{result.created === 1 ? "" : "s"} imported successfully.
                </p>
                {result.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="flex items-center gap-2 font-semibold text-amber-700">
                      <AlertTriangle className="h-4 w-4" /> {result.errors.length} row{result.errors.length === 1 ? "" : "s"} skipped:
                    </p>
                    <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto text-charcoal/70">
                      {result.errors.map((e, i) => (
                        <li key={i}>Row {e.row} ({e.name}): {e.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {result && !result.success && (
              <p className="text-sm text-red-600">{result.error}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={close}>
                {result?.success ? "Done" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isPending}>
                <Upload className="h-4 w-4" /> {isPending ? "Importing…" : "Import"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

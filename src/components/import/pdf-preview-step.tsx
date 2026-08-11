"use client"

import * as React from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/import-format"
import { cn } from "@/lib/utils"
import type { ImportRowResult } from "@/types/import"
import type { PdfImportSession } from "@/types/import-pdf"

function humanizeKey(key: string): string {
  const spaced = key.replace(/([A-Z])/g, " $1")
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Row field shape/names aren't fully confirmed for every module yet, so
 * columns are derived from whatever keys the rows actually carry rather than
 * a hardcoded list — and formatted by light heuristics on the key name. */
function formatFieldValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  const lowerKey = key.toLowerCase()
  if (lowerKey.includes("date")) return formatDate(value)
  if (lowerKey.includes("rent") || lowerKey.includes("amount")) return formatCurrency(value)
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "number") return value.toLocaleString()
  return String(value)
}

function RowStatusIcon({ status }: { status: ImportRowResult["status"] }) {
  return status === "VALID" ? (
    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
  ) : (
    <AlertCircle className="h-4 w-4 shrink-0 text-error" />
  )
}

function PdfRowsTable({ title, rows }: { title: string; rows: ImportRowResult[] }) {
  if (rows.length === 0) return null

  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row.data))))

  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
        {title} ({rows.length})
      </h4>
      <div className="overflow-auto rounded-lg border border-outline-variant">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Row</TableHead>
              <TableHead className="w-28 text-center">Status</TableHead>
              {columns.map((key) => (
                <TableHead key={key}>{humanizeKey(key)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <React.Fragment key={row.rowNumber}>
                <TableRow className={cn(row.status === "ERROR" && "bg-error/5 hover:bg-error/10")}>
                  <TableCell className="font-mono text-data-mono text-on-surface-variant">{row.rowNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1.5">
                      <RowStatusIcon status={row.status} />
                      <span className={cn("text-xs font-semibold", row.status === "VALID" ? "text-success" : "text-error")}>
                        {row.status === "VALID" ? "Valid" : "Error"}
                      </span>
                    </div>
                  </TableCell>
                  {columns.map((key) => {
                    const isArabic = key.endsWith("Ar")
                    return (
                      <TableCell key={key} dir={isArabic ? "rtl" : undefined} className={isArabic ? "text-right" : undefined}>
                        {formatFieldValue(key, row.data[key])}
                      </TableCell>
                    )
                  })}
                </TableRow>
                {row.status === "ERROR" && row.errors.length > 0 && (
                  <TableRow className="bg-error/5 hover:bg-error/10">
                    <TableCell colSpan={columns.length + 2} className="py-2 pt-0">
                      <ul className="space-y-1 pl-1">
                        {row.errors.map((error, i) => (
                          <li key={i} className="text-sm text-error">
                            <span className="font-semibold">{error.field}:</span> {error.message}
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function countByStatus(rows: ImportRowResult[]) {
  const errors = rows.filter((row) => row.status === "ERROR").length
  return { total: rows.length, errors, valid: rows.length - errors }
}

export function PdfPreviewStep({
  session,
  onReupload,
  onCancel,
  onContinue,
}: {
  session: PdfImportSession
  onReupload: () => void
  onCancel: () => void
  onContinue: () => void
}) {
  const buildings = countByStatus(session.buildingRows)
  const properties = countByStatus(session.propertyRows)
  const tenants = countByStatus(session.tenantRows)
  const contracts = countByStatus(session.contractRows)
  const totalErrors = buildings.errors + properties.errors + tenants.errors + contracts.errors
  const totalValid = buildings.valid + properties.valid + tenants.valid + contracts.valid

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-sm">
        <span className="flex items-center gap-2 font-semibold text-on-surface">
          <span className="h-2 w-2 rounded-full bg-success" />
          {session.summary.pdfsExtracted} of {session.summary.pdfsUploaded} PDF
          {session.summary.pdfsUploaded === 1 ? "" : "s"} processed
        </span>
        {session.summary.pdfsFailed > 0 && (
          <span className="flex items-center gap-2 font-semibold text-on-surface">
            <span className="h-2 w-2 rounded-full bg-warning" />
            {session.summary.pdfsFailed} failed to extract
          </span>
        )}
        {totalErrors > 0 && (
          <span className="flex items-center gap-2 font-semibold text-on-surface">
            <span className="h-2 w-2 rounded-full bg-error" />
            {totalErrors} row{totalErrors === 1 ? "" : "s"} need attention
          </span>
        )}
      </div>

      <div className="max-h-[420px] space-y-5 overflow-auto pr-1">
        <PdfRowsTable title="Buildings" rows={session.buildingRows} />
        <PdfRowsTable title="Properties" rows={session.propertyRows} />
        <PdfRowsTable title="Tenants" rows={session.tenantRows} />
        <PdfRowsTable title="Contracts" rows={session.contractRows} />
      </div>

      <div className="flex items-center justify-between border-t border-outline-variant pt-4">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onReupload}>
            Back
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
        <Button type="button" onClick={onContinue} disabled={totalValid === 0}>
          {totalErrors > 0 ? `Import ${totalValid} valid row${totalValid === 1 ? "" : "s"} (${totalErrors} skipped)` : `Import ${totalValid} row${totalValid === 1 ? "" : "s"}`}
        </Button>
      </div>
      {totalValid === 0 && (
        <p className="text-right text-sm text-error">Fix the errors above and re-upload — there are no valid rows to import.</p>
      )}
    </div>
  )
}

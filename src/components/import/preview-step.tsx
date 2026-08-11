"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BUILDING_TYPE_LABELS } from "@/lib/building-labels"
import { QUERY_KEYS } from "@/lib/constants"
import { formatCurrency, formatDate, str } from "@/lib/import-format"
import { UNIT_TYPE_LABELS } from "@/lib/property-labels"
import { TENANT_TYPE_LABELS } from "@/lib/tenant-labels"
import { cn } from "@/lib/utils"
import { buildingService } from "@/services/building-service"
import { propertyService } from "@/services/property-service"
import { tenantService } from "@/services/tenant-service"
import type { BuildingType } from "@/types/building"
import type { ImportModuleKey, ImportRowResult, ImportSession } from "@/types/import"
import type { UnitType } from "@/types/property"
import type { TenantType } from "@/types/tenant"

const PAGE_SIZE = 25

/** Buildings/Properties/Tenants/Contracts reference lookups, fetched once per
 * preview so Properties/Contracts rows can show human labels instead of the
 * resolved UUIDs the backend stores in valid rows' `data`. */
function useReferenceLookups(module: ImportModuleKey) {
  const buildingsQuery = useQuery({
    queryKey: QUERY_KEYS.buildings({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" }),
    queryFn: () => buildingService.list({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" }),
    enabled: module === "properties",
  })
  const tenantsQuery = useQuery({
    queryKey: QUERY_KEYS.tenants({ page: 1, limit: 100, sortBy: "nameEn", sortOrder: "asc" }),
    queryFn: () => tenantService.list({ page: 1, limit: 100, sortBy: "nameEn", sortOrder: "asc" }),
    enabled: module === "contracts",
  })
  const propertiesQuery = useQuery({
    queryKey: QUERY_KEYS.properties({ page: 1, limit: 100, sortBy: "unitNumber", sortOrder: "asc" }),
    queryFn: () => propertyService.list({ page: 1, limit: 100, sortBy: "unitNumber", sortOrder: "asc" }),
    enabled: module === "contracts",
  })

  const buildingLabels = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildingsQuery.data?.items ?? []) map.set(building.id, `${building.code} — ${building.name}`)
    return map
  }, [buildingsQuery.data])

  const tenantLabels = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const tenant of tenantsQuery.data?.items ?? []) map.set(tenant.id, tenant.nameEn)
    return map
  }, [tenantsQuery.data])

  const propertyLabels = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const property of propertiesQuery.data?.items ?? []) {
      map.set(property.id, `Unit ${property.unitNumber} — ${property.building.name}`)
    }
    return map
  }, [propertiesQuery.data])

  return { buildingLabels, tenantLabels, propertyLabels }
}

function RowStatusIcon({ status }: { status: ImportRowResult["status"] }) {
  return status === "VALID" ? (
    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
  ) : (
    <AlertCircle className="h-4 w-4 shrink-0 text-error" />
  )
}

export function PreviewStep({
  module,
  session,
  onReupload,
  onCancel,
  onContinue,
}: {
  module: ImportModuleKey
  session: ImportSession
  onReupload: () => void
  onCancel: () => void
  onContinue: () => void
}) {
  const [page, setPage] = React.useState(1)
  const { buildingLabels, tenantLabels, propertyLabels } = useReferenceLookups(module)

  const totalPages = Math.max(1, Math.ceil(session.rows.length / PAGE_SIZE))
  const pageRows = session.rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns = getColumnLabels(module)

  function renderCells(row: ImportRowResult) {
    switch (module) {
      case "buildings":
        return (
          <>
            <TableCell className="font-mono text-data-mono">{str(row.data.code)}</TableCell>
            <TableCell>{str(row.data.name)}</TableCell>
            <TableCell>{BUILDING_TYPE_LABELS[row.data.buildingType as BuildingType] ?? str(row.data.buildingType)}</TableCell>
            <TableCell className="font-mono text-data-mono">{str(row.data.totalFloors)}</TableCell>
          </>
        )
      case "properties":
        return (
          <>
            <TableCell>
              {typeof row.data.buildingId === "string" ? (buildingLabels.get(row.data.buildingId) ?? "—") : "—"}
            </TableCell>
            <TableCell>{str(row.data.unitNumber)}</TableCell>
            <TableCell>{UNIT_TYPE_LABELS[row.data.unitType as UnitType] ?? str(row.data.unitType)}</TableCell>
            <TableCell className="font-mono text-data-mono">{formatCurrency(row.data.monthlyRent)}</TableCell>
          </>
        )
      case "tenants":
        return (
          <>
            <TableCell>{TENANT_TYPE_LABELS[row.data.tenantType as TenantType] ?? str(row.data.tenantType)}</TableCell>
            <TableCell>{str(row.data.nameEn)}</TableCell>
            <TableCell dir="rtl" className="text-right">
              {str(row.data.nameAr)}
            </TableCell>
            <TableCell className="font-mono text-data-mono">{str(row.data.phone)}</TableCell>
          </>
        )
      case "contracts":
        return (
          <>
            <TableCell className="font-mono text-data-mono">{str(row.data.contractNumber)}</TableCell>
            <TableCell>
              {typeof row.data.tenantId === "string" ? (tenantLabels.get(row.data.tenantId) ?? "—") : "—"}
            </TableCell>
            <TableCell>
              {typeof row.data.propertyId === "string" ? (propertyLabels.get(row.data.propertyId) ?? "—") : "—"}
            </TableCell>
            <TableCell className="font-mono text-data-mono">
              {formatDate(row.data.startDate)} – {formatDate(row.data.endDate)}
            </TableCell>
            <TableCell className="font-mono text-data-mono">{formatCurrency(row.data.annualRent)}</TableCell>
          </>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-sm">
        <span className="flex items-center gap-2 font-semibold text-on-surface">
          <span className="h-2 w-2 rounded-full bg-success" />
          {session.validRows} row{session.validRows === 1 ? "" : "s"} ready
        </span>
        {session.errorRows > 0 && (
          <span className="flex items-center gap-2 font-semibold text-on-surface">
            <span className="h-2 w-2 rounded-full bg-error" />
            {session.errorRows} need{session.errorRows === 1 ? "s" : ""} attention
          </span>
        )}
        <span className="text-on-surface-variant">
          out of {session.totalRows} total rows in {session.originalName}
        </span>
      </div>

      <div className="max-h-[420px] overflow-auto rounded-lg border border-outline-variant">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Row</TableHead>
              <TableHead className="w-28 text-center">Status</TableHead>
              {columns.map((label) => (
                <TableHead key={label}>{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => (
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
                  {renderCells(row)}
                </TableRow>
                {row.status === "ERROR" && (
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-body-md text-on-surface-variant">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-outline-variant pt-4">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onReupload}>
            Re-upload a corrected file
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
        <Button type="button" onClick={onContinue} disabled={session.validRows === 0}>
          {session.errorRows > 0
            ? `Import ${session.validRows} valid row${session.validRows === 1 ? "" : "s"} (${session.errorRows} skipped)`
            : `Import ${session.validRows} row${session.validRows === 1 ? "" : "s"}`}
        </Button>
      </div>
      {session.validRows === 0 && (
        <p className="text-right text-sm text-error">Fix the errors above and re-upload — there are no valid rows to import.</p>
      )}
    </div>
  )
}

function getColumnLabels(module: ImportModuleKey): string[] {
  switch (module) {
    case "buildings":
      return ["Building Code", "Name", "Type", "Floors"]
    case "properties":
      return ["Building", "Unit Number", "Type", "Monthly Rent"]
    case "tenants":
      return ["Type", "Name (English)", "Name (Arabic)", "Phone"]
    case "contracts":
      return ["Contract #", "Tenant", "Unit (Building)", "Start – End", "Annual Rent"]
  }
}

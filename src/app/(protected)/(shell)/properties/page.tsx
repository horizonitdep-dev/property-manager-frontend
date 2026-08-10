"use client"

import * as React from "react"
import Link from "next/link"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeletePropertyDialog } from "@/components/properties/delete-property-dialog"
import { ImportButton } from "@/components/import/import-button"
import { RoleGate } from "@/components/role-gate"
import { useProperties } from "@/hooks/queries/use-properties"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePageHeader } from "@/hooks/use-page-header"
import { QUERY_KEYS, ROUTES } from "@/lib/constants"
import {
  PROPERTY_STATUS_BADGE_CLASSNAME,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_OPTIONS,
  UNIT_TYPE_LABELS,
  UNIT_TYPE_OPTIONS,
} from "@/lib/property-labels"
import { buildingService } from "@/services/building-service"
import type { Property, PropertySortField, PropertyStatus, UnitType } from "@/types/property"

const PAGE_SIZE = 10

function formatRent(amount: number) {
  return `AED ${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function formatAnnualRent(monthlyRent: number) {
  return formatRent(Math.round(Number(monthlyRent) * 12))
}

export default function PropertiesListPage() {
  const [search, setSearch] = React.useState("")
  const [buildingId, setBuildingId] = React.useState<string | "ALL">("ALL")
  const [unitType, setUnitType] = React.useState<UnitType | "ALL">("ALL")
  const [status, setStatus] = React.useState<PropertyStatus | "ALL">("ALL")
  const [page, setPage] = React.useState(1)
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "unitNumber", desc: false }])
  const [propertyPendingDelete, setPropertyPendingDelete] = React.useState<Property | null>(null)

  const debouncedSearch = useDebouncedValue(search, 350)

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, buildingId, unitType, status])

  const buildingsListQuery = { page: 1, limit: 100, sortBy: "name" as const, sortOrder: "asc" as const }
  const buildingsQuery = useQuery({
    queryKey: QUERY_KEYS.buildings(buildingsListQuery),
    queryFn: () => buildingService.list(buildingsListQuery),
  })
  const buildings = buildingsQuery.data?.items ?? []

  const sort = sorting[0]
  const query = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    buildingId: buildingId === "ALL" ? undefined : buildingId,
    unitType: unitType === "ALL" ? undefined : unitType,
    status: status === "ALL" ? undefined : status,
    sortBy: (sort?.id as PropertySortField) ?? "unitNumber",
    sortOrder: (sort?.desc ? "desc" : "asc") as "asc" | "desc",
  }

  const propertiesQuery = useProperties(query)

  const columns = React.useMemo<ColumnDef<Property>[]>(
    () => [
      {
        accessorKey: "unitNumber",
        header: "Unit Number",
        enableSorting: true,
        cell: ({ row }) => (
          <Link href={ROUTES.propertyDetail(row.original.id)} className="font-medium text-on-surface hover:text-secondary">
            {row.original.unitNumber}
          </Link>
        ),
      },
      {
        id: "building",
        header: "Building",
        enableSorting: false,
        cell: ({ row }) => (
          <Link
            href={ROUTES.buildingDetail(row.original.buildingId)}
            className="text-on-surface-variant hover:text-secondary"
          >
            {row.original.building?.name ?? "—"}
          </Link>
        ),
      },
      {
        accessorKey: "floor",
        header: "Floor",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono">{row.original.floor}</span>,
      },
      {
        accessorKey: "unitType",
        header: "Unit Type",
        enableSorting: false,
        cell: ({ row }) => <Badge variant="secondary">{UNIT_TYPE_LABELS[row.original.unitType]}</Badge>,
      },
      {
        accessorKey: "monthlyRent",
        header: "Monthly Rent",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono">{formatRent(row.original.monthlyRent)}</span>,
      },
      {
        id: "annualRent",
        header: "Annual Rent",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-mono text-data-mono">{formatAnnualRent(row.original.monthlyRent)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge className={PROPERTY_STATUS_BADGE_CLASSNAME[row.original.status]}>
            {PROPERTY_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button asChild variant="ghost" size="icon" aria-label={`View unit ${row.original.unitNumber}`}>
              <Link href={ROUTES.propertyDetail(row.original.id)}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <RoleGate allowedRoles={["MANAGER"]}>
              <Button asChild variant="ghost" size="icon" aria-label={`Edit unit ${row.original.unitNumber}`}>
                <Link href={ROUTES.propertyEdit(row.original.id)}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete unit ${row.original.unitNumber}`}
                onClick={() => setPropertyPendingDelete(row.original)}
              >
                <Trash2 className="h-4 w-4 text-error" />
              </Button>
            </RoleGate>
          </div>
        ),
      },
    ],
    []
  )

  const items = propertiesQuery.data?.items ?? []
  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  const total = propertiesQuery.data?.meta.total ?? 0
  const totalPages = propertiesQuery.data?.meta.totalPages ?? 1
  const hasActiveFilters = Boolean(debouncedSearch) || buildingId !== "ALL" || unitType !== "ALL" || status !== "ALL"

  usePageHeader({
    title: "Properties",
    subtitle: `${total} unit${total === 1 ? "" : "s"} in your portfolio`,
    actions: (
      <div className="flex gap-2">
        <ImportButton module="properties" />
        <RoleGate allowedRoles={["MANAGER"]}>
          <Button asChild>
            <Link href={ROUTES.propertyNew}>
              <Plus className="h-4 w-4" /> Register New Unit
            </Link>
          </Button>
        </RoleGate>
      </div>
    ),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
          <Input
            placeholder="Search by unit number…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={buildingId} onValueChange={(value) => setBuildingId(value)}>
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="All buildings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All buildings</SelectItem>
            {buildings.map((building) => (
              <SelectItem key={building.id} value={building.id}>
                {building.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={unitType} onValueChange={(value) => setUnitType(value as UnitType | "ALL")}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {UNIT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(value) => setStatus(value as PropertyStatus | "ALL")}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {PROPERTY_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-outline-variant">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortDir = header.column.getIsSorted()
                  return (
                    <TableHead key={header.id} className={header.id === "actions" ? "w-28" : undefined}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          className="flex items-center gap-1 hover:text-on-surface"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : sortDir === "desc" ? (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {propertiesQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : propertiesQuery.isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center">
                  <p className="mb-3 text-body-md text-error">Failed to load properties.</p>
                  <Button variant="outline" size="sm" onClick={() => propertiesQuery.refetch()}>
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-on-surface-variant">
                  {hasActiveFilters ? "No property units match your filters." : "No property units registered yet."}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-body-md text-on-surface-variant">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
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

      <DeletePropertyDialog
        property={propertyPendingDelete}
        onOpenChange={(open) => !open && setPropertyPendingDelete(null)}
      />
    </div>
  )
}

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
import { keepPreviousData, useQuery } from "@tanstack/react-query"
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
import { DeleteBuildingDialog } from "@/components/buildings/delete-building-dialog"
import { ImportButton } from "@/components/import/import-button"
import { RoleGate } from "@/components/role-gate"
import { BUILDING_TYPE_LABELS, BUILDING_TYPE_OPTIONS, CONSTRUCTION_STATUS_LABELS } from "@/lib/building-labels"
import { QUERY_KEYS, ROUTES } from "@/lib/constants"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePageHeader } from "@/hooks/use-page-header"
import { buildingService } from "@/services/building-service"
import type { Building, BuildingSortField, BuildingType } from "@/types/building"

const PAGE_SIZE = 25

export default function BuildingsListPage() {
  const [search, setSearch] = React.useState("")
  const [buildingType, setBuildingType] = React.useState<BuildingType | "ALL">("ALL")
  const [page, setPage] = React.useState(1)
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [buildingPendingDelete, setBuildingPendingDelete] = React.useState<Building | null>(null)

  const debouncedSearch = useDebouncedValue(search, 350)

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, buildingType])

  const sort = sorting[0]
  const query = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    buildingType: buildingType === "ALL" ? undefined : buildingType,
    sortBy: (sort?.id as BuildingSortField) ?? "name",
    sortOrder: (sort?.desc ? "desc" : "asc") as "asc" | "desc",
  }

  const buildingsQuery = useQuery({
    queryKey: QUERY_KEYS.buildings(query),
    queryFn: () => buildingService.list(query),
    placeholderData: keepPreviousData,
  })

  const columns = React.useMemo<ColumnDef<Building>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Building Name",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-on-surface">{row.original.name}</span>
            <span className="text-xs text-on-surface-variant">{row.original.address}</span>
          </div>
        ),
      },
      {
        accessorKey: "code",
        header: "Code",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono text-on-surface">{row.original.code}</span>,
      },
      {
        accessorKey: "buildingType",
        header: "Type",
        enableSorting: false,
        cell: ({ row }) => <Badge variant="secondary">{BUILDING_TYPE_LABELS[row.original.buildingType]}</Badge>,
      },
      {
        accessorKey: "city",
        header: "City",
        enableSorting: true,
      },
      {
        accessorKey: "totalFloors",
        header: "Floors",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono">{row.original.totalFloors}</span>,
      },
      {
        accessorKey: "yearBuilt",
        header: "Year Built",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono">{row.original.yearBuilt ?? "—"}</span>,
      },
      {
        accessorKey: "totalUnits",
        header: "Total Units",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-mono text-data-mono">{row.original.totalUnits ?? "—"}</span>
        ),
      },
      {
        accessorKey: "constructionStatus",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant={row.original.constructionStatus === "COMPLETE" ? "success" : "warning"}>
            {CONSTRUCTION_STATUS_LABELS[row.original.constructionStatus]}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button asChild variant="ghost" size="icon" aria-label={`View ${row.original.name}`}>
              <Link href={ROUTES.buildingDetail(row.original.id)}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <RoleGate allowedRoles={["MANAGER"]}>
              <Button asChild variant="ghost" size="icon" aria-label={`Edit ${row.original.name}`}>
                <Link href={ROUTES.buildingEdit(row.original.id)}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${row.original.name}`}
                onClick={() => setBuildingPendingDelete(row.original)}
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

  const items = buildingsQuery.data?.items ?? []
  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  const total = buildingsQuery.data?.meta.total ?? 0
  const totalPages = buildingsQuery.data?.meta.totalPages ?? 1

  usePageHeader({
    title: "Buildings",
    subtitle: `${total} building${total === 1 ? "" : "s"} in your portfolio`,
    actions: (
      <div className="flex gap-2">
        <ImportButton module="buildings" />
        <RoleGate allowedRoles={["MANAGER"]}>
          <Button asChild>
            <Link href={ROUTES.buildingNew}>
              <Plus className="h-4 w-4" /> Register New Building
            </Link>
          </Button>
        </RoleGate>
      </div>
    ),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
          <Input
            placeholder="Search by name or code…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={buildingType} onValueChange={(value) => setBuildingType(value as BuildingType | "ALL")}>
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {BUILDING_TYPE_OPTIONS.map((option) => (
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
                    <TableHead key={header.id} className={header.id === "actions" ? "w-32" : undefined}>
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
            {buildingsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : buildingsQuery.isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center">
                  <p className="mb-3 text-body-md text-error">Failed to load buildings.</p>
                  <Button variant="outline" size="sm" onClick={() => buildingsQuery.refetch()}>
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-on-surface-variant">
                  {debouncedSearch || buildingType !== "ALL"
                    ? "No buildings match your filters."
                    : "No buildings registered yet."}
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

      <DeleteBuildingDialog building={buildingPendingDelete} onOpenChange={(open) => !open && setBuildingPendingDelete(null)} />
    </div>
  )
}

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
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import { DeleteChequeDialog } from "@/components/finance/delete-cheque-dialog"
import { RoleGate } from "@/components/role-gate"
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
import { useCheques } from "@/hooks/queries/use-cheques"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePageHeader } from "@/hooks/use-page-header"
import { QUERY_KEYS, ROUTES } from "@/lib/constants"
import { CHEQUE_STATUS_BADGE_CLASSNAME, CHEQUE_STATUS_LABELS, CHEQUE_STATUS_OPTIONS } from "@/lib/finance-labels"
import { formatMoney } from "@/lib/money"
import { buildingService } from "@/services/building-service"
import type { ChequeListItem, ChequeSortField, ChequeStatus } from "@/types/cheque"

const PAGE_SIZE = 25

function formatDate(value: string): string {
  const date = new Date(value)
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  return `${day}-${month}-${date.getUTCFullYear()}`
}

export default function ChequesListPage() {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<ChequeStatus | "ALL">("ALL")
  const [buildingId, setBuildingId] = React.useState<string | "ALL">("ALL")
  const [chequeDateFrom, setChequeDateFrom] = React.useState("")
  const [chequeDateTo, setChequeDateTo] = React.useState("")
  const [page, setPage] = React.useState(1)
  // Oldest first — when investigating you want what's due soonest at the top.
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "chequeDate", desc: false }])
  const [chequePendingDelete, setChequePendingDelete] = React.useState<ChequeListItem | null>(null)

  const debouncedSearch = useDebouncedValue(search, 350)

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, buildingId, chequeDateFrom, chequeDateTo])

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
    status: status === "ALL" ? undefined : status,
    buildingId: buildingId === "ALL" ? undefined : buildingId,
    chequeDateFrom: chequeDateFrom || undefined,
    chequeDateTo: chequeDateTo || undefined,
    sortBy: (sort?.id as ChequeSortField) ?? "chequeDate",
    sortOrder: (sort?.desc ? "desc" : "asc") as "asc" | "desc",
  }

  const chequesQuery = useCheques(query)

  const columns = React.useMemo<ColumnDef<ChequeListItem>[]>(
    () => [
      {
        accessorKey: "chequeDate",
        header: "Cheque Date",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono">{formatDate(row.original.chequeDate)}</span>,
      },
      {
        accessorKey: "bankName",
        header: "Bank",
        enableSorting: false,
        cell: ({ row }) => <span className="text-on-surface">{row.original.bankName}</span>,
      },
      {
        accessorKey: "chequeNumber",
        header: "Cheque #",
        enableSorting: false,
        cell: ({ row }) => (
          <Link
            href={ROUTES.chequeDetail(row.original.id)}
            className="font-mono text-data-mono text-on-surface hover:text-secondary"
          >
            {row.original.chequeNumber}
          </Link>
        ),
      },
      {
        id: "contract",
        header: "Contract #",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.contract ? (
            <Link
              href={ROUTES.contractDetail(row.original.contract.id)}
              className="font-mono text-data-mono text-on-surface-variant hover:text-secondary"
            >
              {row.original.contract.contractNumber}
            </Link>
          ) : (
            <span className="text-on-surface-variant">—</span>
          ),
      },
      {
        id: "tenant",
        header: "Tenant",
        enableSorting: false,
        cell: ({ row }) => {
          const tenant = row.original.contract?.tenant
          if (!tenant) return <span className="text-on-surface-variant">—</span>
          return (
            <Link href={ROUTES.tenantDetail(tenant.id)} className="text-on-surface hover:text-secondary">
              {tenant.nameEn}
            </Link>
          )
        },
      },
      {
        id: "property",
        header: "Property",
        enableSorting: false,
        cell: ({ row }) => {
          const property = row.original.contract?.property
          if (!property) return <span className="text-on-surface-variant">—</span>
          return (
            <Link
              href={ROUTES.propertyDetail(property.id)}
              className="text-on-surface-variant hover:text-secondary"
            >
              Unit {property.unitNumber}
            </Link>
          )
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono">{formatMoney(row.original.amount)}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge className={CHEQUE_STATUS_BADGE_CLASSNAME[row.original.status]}>
              {CHEQUE_STATUS_LABELS[row.original.status]}
            </Badge>
            {/* Amber attention dot until a bounced cheque is replaced or resolved. */}
            {row.original.status === "BOUNCED" && !row.original.replacedByChequeId && (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-warning"
                title="Bounced — needs a replacement"
                aria-label="Needs attention"
              />
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          // Delete is only offered where the backend allows it.
          const canDelete = row.original.status === "HELD" || row.original.status === "CANCELLED"
          return (
            <div className="flex justify-end gap-1">
              <Button asChild variant="ghost" size="icon" aria-label="View cheque">
                <Link href={ROUTES.chequeDetail(row.original.id)}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <RoleGate allowedRoles={["MANAGER"]}>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete cheque"
                    onClick={() => setChequePendingDelete(row.original)}
                  >
                    <Trash2 className="h-4 w-4 text-error" />
                  </Button>
                )}
              </RoleGate>
            </div>
          )
        },
      },
    ],
    []
  )

  const items = chequesQuery.data?.items ?? []
  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  const total = chequesQuery.data?.meta.total ?? 0
  const totalPages = chequesQuery.data?.meta.totalPages ?? 1
  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    status !== "ALL" ||
    buildingId !== "ALL" ||
    Boolean(chequeDateFrom) ||
    Boolean(chequeDateTo)

  usePageHeader({
    title: "Cheques",
    subtitle: `${total} cheque${total === 1 ? "" : "s"} on file`,
    actions: (
      <RoleGate allowedRoles={["MANAGER"]}>
        <Button asChild>
          <Link href={ROUTES.chequeNew}>
            <Plus className="h-4 w-4" /> Record Cheque
          </Link>
        </Button>
      </RoleGate>
    ),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
          <Input
            placeholder="Search by cheque number…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value as ChequeStatus | "ALL")}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {CHEQUE_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={buildingId} onValueChange={(value) => setBuildingId(value)}>
          <SelectTrigger className="sm:w-48">
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
        <div className="flex items-center gap-2">
          <Input
            type="date"
            aria-label="Cheque date from"
            className="sm:w-40"
            value={chequeDateFrom}
            onChange={(e) => setChequeDateFrom(e.target.value)}
          />
          <span className="text-on-surface-variant">–</span>
          <Input
            type="date"
            aria-label="Cheque date to"
            className="sm:w-40"
            value={chequeDateTo}
            onChange={(e) => setChequeDateTo(e.target.value)}
          />
        </div>
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
                    <TableHead key={header.id} className={header.id === "actions" ? "w-24" : undefined}>
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
            {chequesQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : chequesQuery.isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center">
                  <p className="mb-3 text-body-md text-error">Failed to load cheques.</p>
                  <Button variant="outline" size="sm" onClick={() => chequesQuery.refetch()}>
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-on-surface-variant">
                  {hasActiveFilters ? "No cheques match your filters." : "No cheques recorded yet."}
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

      <DeleteChequeDialog
        cheque={chequePendingDelete}
        onOpenChange={(open) => !open && setChequePendingDelete(null)}
      />
    </div>
  )
}

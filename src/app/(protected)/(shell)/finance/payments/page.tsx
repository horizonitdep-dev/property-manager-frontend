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
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Trash2,
} from "lucide-react"

import { DeletePaymentDialog } from "@/components/finance/delete-payment-dialog"
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
import { usePayments } from "@/hooks/queries/use-payments"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePageHeader } from "@/hooks/use-page-header"
import { QUERY_KEYS, ROUTES } from "@/lib/constants"
import {
  PAYMENT_KIND_BADGE_CLASSNAME,
  PAYMENT_KIND_LABELS,
  PAYMENT_KIND_OPTIONS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_OPTIONS,
} from "@/lib/finance-labels"
import { formatMoney } from "@/lib/money"
import { buildingService } from "@/services/building-service"
import type { PaymentMethod } from "@/types/finance"
import type { PaymentKind, PaymentListItem, PaymentSortField } from "@/types/payment"

const PAGE_SIZE = 25

function formatDate(value: string): string {
  const date = new Date(value)
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const year = date.getUTCFullYear()
  return `${day}-${month}-${year}`
}

type ChequeFilter = "ALL" | "LINKED" | "MANUAL"

export default function PaymentsListPage() {
  const [search, setSearch] = React.useState("")
  const [buildingId, setBuildingId] = React.useState<string | "ALL">("ALL")
  const [kind, setKind] = React.useState<PaymentKind | "ALL">("ALL")
  const [method, setMethod] = React.useState<PaymentMethod | "ALL">("ALL")
  const [chequeFilter, setChequeFilter] = React.useState<ChequeFilter>("ALL")
  const [paidOnFrom, setPaidOnFrom] = React.useState("")
  const [paidOnTo, setPaidOnTo] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "paidOn", desc: true }])
  const [paymentPendingDelete, setPaymentPendingDelete] = React.useState<PaymentListItem | null>(null)

  const debouncedSearch = useDebouncedValue(search, 350)

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, buildingId, kind, method, chequeFilter, paidOnFrom, paidOnTo])

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
    kind: kind === "ALL" ? undefined : kind,
    method: method === "ALL" ? undefined : method,
    linkedToCheque: chequeFilter === "ALL" ? undefined : chequeFilter === "LINKED",
    paidOnFrom: paidOnFrom || undefined,
    paidOnTo: paidOnTo || undefined,
    sortBy: (sort?.id as PaymentSortField) ?? "paidOn",
    sortOrder: (sort?.desc ? "desc" : "asc") as "asc" | "desc",
  }

  const paymentsQuery = usePayments(query)

  const columns = React.useMemo<ColumnDef<PaymentListItem>[]>(
    () => [
      {
        accessorKey: "paidOn",
        header: "Paid On",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono">{formatDate(row.original.paidOn)}</span>,
      },
      {
        id: "contract",
        header: "Contract #",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.contract ? (
            <Link
              href={ROUTES.contractDetail(row.original.contract.id)}
              className="font-mono text-data-mono text-on-surface hover:text-secondary"
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
            <Link href={ROUTES.tenantDetail(tenant.id)} className="group flex flex-col">
              <span className="text-on-surface group-hover:text-secondary">{tenant.nameEn}</span>
              {tenant.nameAr && (
                <span dir="rtl" className="text-right text-xs text-on-surface-variant">
                  {tenant.nameAr}
                </span>
              )}
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
              Unit {property.unitNumber} — {property.building.name}
            </Link>
          )
        },
      },
      {
        accessorKey: "kind",
        header: "Kind",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge className={PAYMENT_KIND_BADGE_CLASSNAME[row.original.kind]}>
            {PAYMENT_KIND_LABELS[row.original.kind]}
          </Badge>
        ),
      },
      {
        accessorKey: "method",
        header: "Method",
        enableSorting: false,
        cell: ({ row }) => <Badge variant="secondary">{PAYMENT_METHOD_LABELS[row.original.method]}</Badge>,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono">{formatMoney(row.original.amount)}</span>,
      },
      {
        id: "cheque",
        header: "Cheque",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.cheque ? (
            <Link
              href={ROUTES.chequeDetail(row.original.cheque.id)}
              className="flex items-center gap-1.5 text-on-surface-variant hover:text-secondary"
            >
              <ReceiptText className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono text-data-mono">{row.original.cheque.chequeNumber}</span>
            </Link>
          ) : (
            <span className="text-on-surface-variant">—</span>
          ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button asChild variant="ghost" size="icon" aria-label="View payment">
              <Link href={ROUTES.paymentDetail(row.original.id)}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <RoleGate allowedRoles={["MANAGER"]}>
              <Button asChild variant="ghost" size="icon" aria-label="Edit payment">
                <Link href={ROUTES.paymentEdit(row.original.id)}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete payment"
                onClick={() => setPaymentPendingDelete(row.original)}
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

  const items = paymentsQuery.data?.items ?? []
  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  const total = paymentsQuery.data?.meta.total ?? 0
  const totalPages = paymentsQuery.data?.meta.totalPages ?? 1
  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    buildingId !== "ALL" ||
    kind !== "ALL" ||
    method !== "ALL" ||
    chequeFilter !== "ALL" ||
    Boolean(paidOnFrom) ||
    Boolean(paidOnTo)

  usePageHeader({
    title: "Payments",
    subtitle: `${total} payment${total === 1 ? "" : "s"} recorded`,
    actions: (
      <RoleGate allowedRoles={["MANAGER"]}>
        <Button asChild>
          <Link href={ROUTES.paymentNew}>
            <Plus className="h-4 w-4" /> Record Payment
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
            placeholder="Search by reference number…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={kind} onValueChange={(value) => setKind(value as PaymentKind | "ALL")}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All kinds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All kinds</SelectItem>
            {PAYMENT_KIND_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod | "ALL")}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All methods</SelectItem>
            {PAYMENT_METHOD_OPTIONS.map((option) => (
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
        <Select value={chequeFilter} onValueChange={(value) => setChequeFilter(value as ChequeFilter)}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All sources</SelectItem>
            <SelectItem value="LINKED">From cheques</SelectItem>
            <SelectItem value="MANUAL">Manual only</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            aria-label="Paid on from"
            className="sm:w-40"
            value={paidOnFrom}
            onChange={(e) => setPaidOnFrom(e.target.value)}
          />
          <span className="text-on-surface-variant">–</span>
          <Input
            type="date"
            aria-label="Paid on to"
            className="sm:w-40"
            value={paidOnTo}
            onChange={(e) => setPaidOnTo(e.target.value)}
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
            {paymentsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paymentsQuery.isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center">
                  <p className="mb-3 text-body-md text-error">Failed to load payments.</p>
                  <Button variant="outline" size="sm" onClick={() => paymentsQuery.refetch()}>
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-on-surface-variant">
                  {hasActiveFilters ? "No payments match your filters." : "No payments recorded yet."}
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

      <DeletePaymentDialog
        payment={paymentPendingDelete}
        onOpenChange={(open) => !open && setPaymentPendingDelete(null)}
      />
    </div>
  )
}

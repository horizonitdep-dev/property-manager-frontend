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
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"

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
import { DeleteContractDialog } from "@/components/contracts/delete-contract-dialog"
import { ImportButton } from "@/components/import/import-button"
import { TerminateContractDialog } from "@/components/contracts/terminate-contract-dialog"
import { RoleGate } from "@/components/role-gate"
import { useContracts } from "@/hooks/queries/use-contracts"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePageHeader } from "@/hooks/use-page-header"
import {
  CONTRACT_STATUS_BADGE_CLASSNAME,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_OPTIONS,
  PAYMENT_FREQUENCY_LABELS,
  PAYMENT_FREQUENCY_OPTIONS,
} from "@/lib/contract-labels"
import { QUERY_KEYS, ROUTES } from "@/lib/constants"
import { buildingService } from "@/services/building-service"
import type { ContractListItem, ContractSortField, ContractStatus, PaymentFrequency } from "@/types/contract"

const PAGE_SIZE = 10

function formatDate(value: string): string {
  const date = new Date(value)
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const year = date.getUTCFullYear()
  return `${day}-${month}-${year}`
}

function formatRent(amount: number) {
  return `AED ${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export default function ContractsListPage() {
  const [search, setSearch] = React.useState("")
  const [buildingId, setBuildingId] = React.useState<string | "ALL">("ALL")
  const [status, setStatus] = React.useState<ContractStatus | "ALL">("ALL")
  const [paymentFrequency, setPaymentFrequency] = React.useState<PaymentFrequency | "ALL">("ALL")
  const [startDateFrom, setStartDateFrom] = React.useState("")
  const [startDateTo, setStartDateTo] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "startDate", desc: true }])
  const [contractPendingDelete, setContractPendingDelete] = React.useState<ContractListItem | null>(null)
  const [contractPendingTerminate, setContractPendingTerminate] = React.useState<ContractListItem | null>(null)

  const debouncedSearch = useDebouncedValue(search, 350)

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, buildingId, status, paymentFrequency, startDateFrom, startDateTo])

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
    status: status === "ALL" ? undefined : status,
    paymentFrequency: paymentFrequency === "ALL" ? undefined : paymentFrequency,
    startDateFrom: startDateFrom || undefined,
    startDateTo: startDateTo || undefined,
    sortBy: (sort?.id as ContractSortField) ?? "startDate",
    sortOrder: (sort?.desc ? "desc" : "asc") as "asc" | "desc",
  }

  const contractsQuery = useContracts(query)

  const columns = React.useMemo<ColumnDef<ContractListItem>[]>(
    () => [
      {
        accessorKey: "contractNumber",
        header: "Contract #",
        enableSorting: true,
        cell: ({ row }) => (
          <Link
            href={ROUTES.contractDetail(row.original.id)}
            className="font-mono text-data-mono text-on-surface hover:text-secondary"
          >
            {row.original.contractNumber}
          </Link>
        ),
      },
      {
        id: "tenant",
        header: "Tenant",
        enableSorting: false,
        cell: ({ row }) => (
          <Link href={ROUTES.tenantDetail(row.original.tenant.id)} className="group flex flex-col">
            <span className="text-on-surface group-hover:text-secondary">{row.original.tenant.nameEn}</span>
            {row.original.tenant.nameAr && (
              <span dir="rtl" className="text-right text-xs text-on-surface-variant">
                {row.original.tenant.nameAr}
              </span>
            )}
          </Link>
        ),
      },
      {
        id: "property",
        header: "Property",
        enableSorting: false,
        cell: ({ row }) => (
          <Link href={ROUTES.propertyDetail(row.original.property.id)} className="text-on-surface-variant hover:text-secondary">
            Unit {row.original.property.unitNumber} — {row.original.property.building.name}
          </Link>
        ),
      },
      {
        accessorKey: "startDate",
        header: "Start",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono">{formatDate(row.original.startDate)}</span>,
      },
      {
        accessorKey: "endDate",
        header: "End",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono">{formatDate(row.original.endDate)}</span>,
      },
      {
        accessorKey: "annualRent",
        header: "Annual Rent",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono">{formatRent(row.original.annualRent)}</span>,
      },
      {
        accessorKey: "paymentFrequency",
        header: "Frequency",
        enableSorting: false,
        cell: ({ row }) => <Badge variant="secondary">{PAYMENT_FREQUENCY_LABELS[row.original.paymentFrequency]}</Badge>,
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge className={CONTRACT_STATUS_BADGE_CLASSNAME[row.original.status]}>
            {CONTRACT_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const canRenew = row.original.status === "EXPIRING_SOON" || row.original.status === "EXPIRED"
          const canTerminate = row.original.status === "ACTIVE" || row.original.status === "EXPIRING_SOON"
          return (
            <div className="flex justify-end gap-1">
              <Button asChild variant="ghost" size="icon" aria-label={`View contract ${row.original.contractNumber}`}>
                <Link href={ROUTES.contractDetail(row.original.id)}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <RoleGate allowedRoles={["MANAGER"]}>
                <Button asChild variant="ghost" size="icon" aria-label={`Edit contract ${row.original.contractNumber}`}>
                  <Link href={ROUTES.contractEdit(row.original.id)}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                {canRenew && (
                  <Button asChild variant="ghost" size="icon" aria-label={`Renew contract ${row.original.contractNumber}`}>
                    <Link href={`${ROUTES.contractNew}?renewFromId=${row.original.id}`}>
                      <RefreshCw className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {canTerminate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Terminate contract ${row.original.contractNumber}`}
                    onClick={() => setContractPendingTerminate(row.original)}
                  >
                    <Ban className="h-4 w-4 text-warning" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete contract ${row.original.contractNumber}`}
                  onClick={() => setContractPendingDelete(row.original)}
                >
                  <Trash2 className="h-4 w-4 text-error" />
                </Button>
              </RoleGate>
            </div>
          )
        },
      },
    ],
    []
  )

  const items = contractsQuery.data?.items ?? []
  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  const total = contractsQuery.data?.meta.total ?? 0
  const totalPages = contractsQuery.data?.meta.totalPages ?? 1
  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    buildingId !== "ALL" ||
    status !== "ALL" ||
    paymentFrequency !== "ALL" ||
    Boolean(startDateFrom) ||
    Boolean(startDateTo)

  usePageHeader({
    title: "Contracts",
    subtitle: `${total} contract${total === 1 ? "" : "s"} on file`,
    actions: (
      <div className="flex gap-2">
        <ImportButton module="contracts" />
        <RoleGate allowedRoles={["MANAGER"]}>
          <Button asChild>
            <Link href={ROUTES.contractNew}>
              <Plus className="h-4 w-4" /> Register New Contract
            </Link>
          </Button>
        </RoleGate>
      </div>
    ),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
          <Input
            placeholder="Search by contract number…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value as ContractStatus | "ALL")}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {CONTRACT_STATUS_OPTIONS.map((option) => (
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
        <Select value={paymentFrequency} onValueChange={(value) => setPaymentFrequency(value as PaymentFrequency | "ALL")}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All frequencies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All frequencies</SelectItem>
            {PAYMENT_FREQUENCY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            aria-label="Start date from"
            className="sm:w-40"
            value={startDateFrom}
            onChange={(e) => setStartDateFrom(e.target.value)}
          />
          <span className="text-on-surface-variant">–</span>
          <Input
            type="date"
            aria-label="Start date to"
            className="sm:w-40"
            value={startDateTo}
            onChange={(e) => setStartDateTo(e.target.value)}
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
                    <TableHead key={header.id} className={header.id === "actions" ? "w-40" : undefined}>
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
            {contractsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : contractsQuery.isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center">
                  <p className="mb-3 text-body-md text-error">Failed to load contracts.</p>
                  <Button variant="outline" size="sm" onClick={() => contractsQuery.refetch()}>
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-on-surface-variant">
                  {hasActiveFilters ? "No contracts match your filters." : "No contracts registered yet."}
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

      <DeleteContractDialog
        contract={contractPendingDelete}
        onOpenChange={(open) => !open && setContractPendingDelete(null)}
      />
      <TerminateContractDialog
        contract={contractPendingTerminate}
        onOpenChange={(open) => !open && setContractPendingTerminate(null)}
      />
    </div>
  )
}

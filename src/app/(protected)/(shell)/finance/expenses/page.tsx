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
  Search,
  Trash2,
} from "lucide-react"

import { DeleteExpenseDialog } from "@/components/finance/delete-expense-dialog"
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
import { useExpenses } from "@/hooks/queries/use-expenses"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePageHeader } from "@/hooks/use-page-header"
import { QUERY_KEYS, ROUTES } from "@/lib/constants"
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_OPTIONS,
  EXPENSE_SOURCE_TYPE_LABELS,
  EXPENSE_SOURCE_TYPE_OPTIONS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_OPTIONS,
} from "@/lib/finance-labels"
import { formatMoney } from "@/lib/money"
import { buildingService } from "@/services/building-service"
import type { ExpenseCategory, ExpenseListItem, ExpenseSortField, ExpenseSourceType } from "@/types/expense"
import type { PaymentMethod } from "@/types/finance"

const PAGE_SIZE = 25

function formatDate(value: string): string {
  const date = new Date(value)
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const year = date.getUTCFullYear()
  return `${day}-${month}-${year}`
}

export default function ExpensesListPage() {
  const [search, setSearch] = React.useState("")
  const [buildingId, setBuildingId] = React.useState<string | "ALL">("ALL")
  const [category, setCategory] = React.useState<ExpenseCategory | "ALL">("ALL")
  const [method, setMethod] = React.useState<PaymentMethod | "ALL">("ALL")
  const [sourceType, setSourceType] = React.useState<ExpenseSourceType | "ALL">("ALL")
  const [incurredOnFrom, setIncurredOnFrom] = React.useState("")
  const [incurredOnTo, setIncurredOnTo] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "incurredOn", desc: true }])
  const [expensePendingDelete, setExpensePendingDelete] = React.useState<ExpenseListItem | null>(null)

  const debouncedSearch = useDebouncedValue(search, 350)

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, buildingId, category, method, sourceType, incurredOnFrom, incurredOnTo])

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
    category: category === "ALL" ? undefined : category,
    method: method === "ALL" ? undefined : method,
    sourceType: sourceType === "ALL" ? undefined : sourceType,
    incurredOnFrom: incurredOnFrom || undefined,
    incurredOnTo: incurredOnTo || undefined,
    sortBy: (sort?.id as ExpenseSortField) ?? "incurredOn",
    sortOrder: (sort?.desc ? "desc" : "asc") as "asc" | "desc",
  }

  const expensesQuery = useExpenses(query)

  const columns = React.useMemo<ColumnDef<ExpenseListItem>[]>(
    () => [
      {
        accessorKey: "incurredOn",
        header: "Incurred On",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono">{formatDate(row.original.incurredOn)}</span>,
      },
      {
        accessorKey: "category",
        header: "Category",
        enableSorting: true,
        cell: ({ row }) => <Badge variant="secondary">{EXPENSE_CATEGORY_LABELS[row.original.category]}</Badge>,
      },
      {
        id: "building",
        header: "Building",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.building ? (
            <Link
              href={ROUTES.buildingDetail(row.original.building.id)}
              className="text-on-surface hover:text-secondary"
            >
              {row.original.building.name}
            </Link>
          ) : (
            <span className="text-on-surface-variant">—</span>
          ),
      },
      {
        id: "property",
        header: "Property",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.property ? (
            <Link
              href={ROUTES.propertyDetail(row.original.property.id)}
              className="text-on-surface-variant hover:text-secondary"
            >
              Unit {row.original.property.unitNumber}
            </Link>
          ) : (
            <span className="text-on-surface-variant">Building-wide</span>
          ),
      },
      {
        accessorKey: "vendorName",
        header: "Vendor",
        enableSorting: false,
        cell: ({ row }) => <span className="text-on-surface">{row.original.vendorName}</span>,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-data-mono">{formatMoney(row.original.amount)}</span>,
      },
      {
        accessorKey: "method",
        header: "Method",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-on-surface-variant">{PAYMENT_METHOD_LABELS[row.original.method]}</span>
        ),
      },
      {
        accessorKey: "sourceType",
        header: "Source",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant="outline">{EXPENSE_SOURCE_TYPE_LABELS[row.original.sourceType]}</Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button asChild variant="ghost" size="icon" aria-label="View expense">
              <Link href={ROUTES.expenseDetail(row.original.id)}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <RoleGate allowedRoles={["MANAGER"]}>
              {/* Non-GENERAL expenses are owned by another module — no edit affordance. */}
              {row.original.isEditable && (
                <Button asChild variant="ghost" size="icon" aria-label="Edit expense">
                  <Link href={ROUTES.expenseEdit(row.original.id)}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete expense"
                onClick={() => setExpensePendingDelete(row.original)}
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

  const items = expensesQuery.data?.items ?? []
  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  const total = expensesQuery.data?.meta.total ?? 0
  const totalPages = expensesQuery.data?.meta.totalPages ?? 1
  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    buildingId !== "ALL" ||
    category !== "ALL" ||
    method !== "ALL" ||
    sourceType !== "ALL" ||
    Boolean(incurredOnFrom) ||
    Boolean(incurredOnTo)

  usePageHeader({
    title: "Expenses",
    subtitle: `${total} expense${total === 1 ? "" : "s"} recorded`,
    actions: (
      <RoleGate allowedRoles={["MANAGER"]}>
        <Button asChild>
          <Link href={ROUTES.expenseNew}>
            <Plus className="h-4 w-4" /> Record Expense
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
            placeholder="Search by vendor…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory | "ALL")}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {EXPENSE_CATEGORY_OPTIONS.map((option) => (
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
        <Select value={sourceType} onValueChange={(value) => setSourceType(value as ExpenseSourceType | "ALL")}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All sources</SelectItem>
            {EXPENSE_SOURCE_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            aria-label="Incurred on from"
            className="sm:w-40"
            value={incurredOnFrom}
            onChange={(e) => setIncurredOnFrom(e.target.value)}
          />
          <span className="text-on-surface-variant">–</span>
          <Input
            type="date"
            aria-label="Incurred on to"
            className="sm:w-40"
            value={incurredOnTo}
            onChange={(e) => setIncurredOnTo(e.target.value)}
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
            {expensesQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : expensesQuery.isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center">
                  <p className="mb-3 text-body-md text-error">Failed to load expenses.</p>
                  <Button variant="outline" size="sm" onClick={() => expensesQuery.refetch()}>
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-on-surface-variant">
                  {hasActiveFilters ? "No expenses match your filters." : "No expenses recorded yet."}
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

      <DeleteExpenseDialog
        expense={expensePendingDelete}
        onOpenChange={(open) => !open && setExpensePendingDelete(null)}
      />
    </div>
  )
}

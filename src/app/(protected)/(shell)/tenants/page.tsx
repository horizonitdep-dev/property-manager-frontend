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
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Eye, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react"

import { DeleteTenantDialog } from "@/components/tenants/delete-tenant-dialog"
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
import { useTenants } from "@/hooks/queries/use-tenants"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePageHeader } from "@/hooks/use-page-header"
import { ROUTES } from "@/lib/constants"
import {
  TENANT_STATUS_BADGE_CLASSNAME,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_OPTIONS,
  TENANT_TYPE_LABELS,
  TENANT_TYPE_OPTIONS,
} from "@/lib/tenant-labels"
import type { TenantListItem, TenantSortField, TenantStatus, TenantType } from "@/types/tenant"

const PAGE_SIZE = 10

export default function TenantsListPage() {
  const [search, setSearch] = React.useState("")
  const [tenantType, setTenantType] = React.useState<TenantType | "ALL">("ALL")
  const [status, setStatus] = React.useState<TenantStatus | "ALL">("ALL")
  const [page, setPage] = React.useState(1)
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "nameEn", desc: false }])
  const [tenantPendingDelete, setTenantPendingDelete] = React.useState<TenantListItem | null>(null)

  // No normalization/stripping — Arabic input must reach the backend untouched.
  const debouncedSearch = useDebouncedValue(search, 350)

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, tenantType, status])

  const sort = sorting[0]
  const query = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    tenantType: tenantType === "ALL" ? undefined : tenantType,
    status: status === "ALL" ? undefined : status,
    sortBy: (sort?.id as TenantSortField) ?? "nameEn",
    sortOrder: (sort?.desc ? "desc" : "asc") as "asc" | "desc",
  }

  const tenantsQuery = useTenants(query)

  const columns = React.useMemo<ColumnDef<TenantListItem>[]>(
    () => [
      {
        accessorKey: "nameEn",
        header: "Name",
        enableSorting: true,
        cell: ({ row }) => (
          <Link href={ROUTES.tenantDetail(row.original.id)} className="group flex flex-col">
            <span className="font-medium text-on-surface group-hover:text-secondary">{row.original.nameEn}</span>
            {row.original.nameAr && (
              <span dir="rtl" className="text-right text-xs text-on-surface-variant">
                {row.original.nameAr}
              </span>
            )}
          </Link>
        ),
      },
      {
        accessorKey: "tenantType",
        header: "Type",
        enableSorting: false,
        cell: ({ row }) => <Badge variant="secondary">{TENANT_TYPE_LABELS[row.original.tenantType]}</Badge>,
      },
      {
        accessorKey: "phone",
        header: "Phone",
        enableSorting: false,
        cell: ({ row }) => <span className="font-mono text-data-mono">{row.original.phone}</span>,
      },
      {
        accessorKey: "email",
        header: "Email",
        enableSorting: false,
        cell: ({ row }) => row.original.email ?? "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge className={TENANT_STATUS_BADGE_CLASSNAME[row.original.status]}>
            {TENANT_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "documentCount",
        header: "Documents",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="flex items-center gap-1.5 font-mono text-data-mono">
            <FileText className="h-3.5 w-3.5 text-on-surface-variant" />
            {row.original.documentCount}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button asChild variant="ghost" size="icon" aria-label={`View ${row.original.nameEn}`}>
              <Link href={ROUTES.tenantDetail(row.original.id)}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <RoleGate allowedRoles={["MANAGER"]}>
              <Button asChild variant="ghost" size="icon" aria-label={`Edit ${row.original.nameEn}`}>
                <Link href={ROUTES.tenantEdit(row.original.id)}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${row.original.nameEn}`}
                onClick={() => setTenantPendingDelete(row.original)}
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

  const items = tenantsQuery.data?.items ?? []
  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  const total = tenantsQuery.data?.meta.total ?? 0
  const totalPages = tenantsQuery.data?.meta.totalPages ?? 1
  const hasActiveFilters = Boolean(debouncedSearch) || tenantType !== "ALL" || status !== "ALL"

  usePageHeader({
    title: "Tenants",
    subtitle: `${total} tenant${total === 1 ? "" : "s"} on file`,
    actions: (
      <RoleGate allowedRoles={["MANAGER"]}>
        <Button asChild>
          <Link href={ROUTES.tenantNew}>
            <Plus className="h-4 w-4" /> Register New Tenant
          </Link>
        </Button>
      </RoleGate>
    ),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
          <Input
            placeholder="Search by name (English or Arabic)…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={tenantType} onValueChange={(value) => setTenantType(value as TenantType | "ALL")}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {TENANT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(value) => setStatus(value as TenantStatus | "ALL")}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {TENANT_STATUS_OPTIONS.map((option) => (
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
            {tenantsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : tenantsQuery.isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center">
                  <p className="mb-3 text-body-md text-error">Failed to load tenants.</p>
                  <Button variant="outline" size="sm" onClick={() => tenantsQuery.refetch()}>
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-on-surface-variant">
                  {hasActiveFilters ? "No tenants match your filters." : "No tenants registered yet."}
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

      <DeleteTenantDialog
        tenant={tenantPendingDelete}
        onOpenChange={(open) => !open && setTenantPendingDelete(null)}
      />
    </div>
  )
}

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Building2, FileText, Wallet } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { BuildingCombobox } from "@/components/properties/building-combobox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateExpense, useUpdateExpense } from "@/hooks/queries/use-expenses"
import { QUERY_KEYS, ROUTES } from "@/lib/constants"
import { EXPENSE_CATEGORY_OPTIONS, PAYMENT_METHOD_OPTIONS } from "@/lib/finance-labels"
import { getErrorMessage } from "@/lib/get-error-message"
import { moneyToInputValue } from "@/lib/money"
import { expenseSchema, type ExpenseFormInput, type ExpenseFormValues } from "@/lib/validation/expense"
import { buildingService } from "@/services/building-service"
import { propertyService } from "@/services/property-service"
import type { Expense } from "@/types/expense"

function toDateInputValue(value?: string | null): string {
  return value ? value.slice(0, 10) : ""
}

export function ExpenseForm({
  expense,
  defaultBuildingId,
  defaultPropertyId,
}: {
  expense?: Expense
  defaultBuildingId?: string
  defaultPropertyId?: string
}) {
  const router = useRouter()
  const isEdit = !!expense

  const buildingsListQuery = { page: 1, limit: 100, sortBy: "name" as const, sortOrder: "asc" as const }
  const buildingsQuery = useQuery({
    queryKey: QUERY_KEYS.buildings(buildingsListQuery),
    queryFn: () => buildingService.list(buildingsListQuery),
  })
  const buildings = buildingsQuery.data?.items ?? []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      buildingId: expense?.buildingId ?? defaultBuildingId ?? "",
      propertyId: expense?.propertyId ?? defaultPropertyId ?? "",
      category: expense?.category ?? "MAINTENANCE",
      amount: moneyToInputValue(expense?.amount),
      incurredOn: toDateInputValue(expense?.incurredOn),
      vendorName: expense?.vendorName ?? "",
      description: expense?.description ?? "",
      method: expense?.method ?? "BANK_TRANSFER",
      invoiceNumber: expense?.invoiceNumber ?? "",
      notes: expense?.notes ?? "",
    },
  })

  const buildingId = watch("buildingId")

  // The property list is scoped to the chosen building, which is what keeps the
  // backend's "property must belong to building" rule satisfied.
  const propertiesListQuery = {
    page: 1,
    limit: 100,
    buildingId: buildingId || undefined,
    sortBy: "unitNumber" as const,
    sortOrder: "asc" as const,
  }
  const propertiesQuery = useQuery({
    queryKey: QUERY_KEYS.properties(propertiesListQuery),
    queryFn: () => propertyService.list(propertiesListQuery),
    enabled: !!buildingId,
  })
  const properties = propertiesQuery.data?.items ?? []

  // Changing building invalidates any unit already picked under the old one.
  const previousBuildingId = React.useRef(buildingId)
  React.useEffect(() => {
    if (previousBuildingId.current && previousBuildingId.current !== buildingId) {
      setValue("propertyId", "", { shouldValidate: false })
    }
    previousBuildingId.current = buildingId
  }, [buildingId, setValue])

  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()
  const isPending = createMutation.isPending || updateMutation.isPending

  const [formError, setFormError] = React.useState<string | null>(null)

  function onSubmit(values: ExpenseFormValues) {
    setFormError(null)
    const dto = {
      buildingId: values.buildingId,
      propertyId: values.propertyId || undefined,
      category: values.category,
      amount: values.amount,
      incurredOn: values.incurredOn,
      vendorName: values.vendorName,
      description: values.description,
      method: values.method,
      invoiceNumber: values.invoiceNumber || undefined,
      notes: values.notes || undefined,
    }

    const action = isEdit
      ? updateMutation.mutateAsync({ id: expense.id, dto })
      : createMutation.mutateAsync(dto)

    action
      .then((saved) => {
        toast.success(isEdit ? "Expense updated." : "Expense recorded.")
        router.push(ROUTES.expenseDetail(saved.id))
      })
      .catch((error) => {
        setFormError(getErrorMessage(error, "Failed to save expense."))
      })
  }

  function goBack() {
    router.push(isEdit ? ROUTES.expenseDetail(expense.id) : ROUTES.expenses)
  }

  return (
    <form className="space-y-stack-lg" onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError && (
        <p role="alert" className="rounded-lg bg-error/10 px-4 py-3 text-sm font-medium text-error">
          {formError}
        </p>
      )}

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <Building2 className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Scope</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="buildingId">Building</Label>
            <BuildingCombobox
              id="buildingId"
              buildings={buildings}
              value={buildingId}
              onChange={(value) => setValue("buildingId", value, { shouldValidate: true })}
              isLoading={buildingsQuery.isLoading}
            />
            {errors.buildingId && <p className="text-sm text-error">{errors.buildingId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyId">Property (optional)</Label>
            <Select
              value={watch("propertyId") || "NONE"}
              disabled={!buildingId}
              onValueChange={(value) =>
                setValue("propertyId", value === "NONE" ? "" : value, { shouldValidate: true })
              }
            >
              <SelectTrigger id="propertyId">
                <SelectValue placeholder="Building-wide" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Building-wide</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    Unit {property.unitNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-on-surface-variant">
              {buildingId ? "Leave as building-wide if the cost isn't unit-specific." : "Pick a building first."}
            </p>
            {errors.propertyId && <p className="text-sm text-error">{errors.propertyId.message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <Wallet className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Expense</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={watch("category")}
              onValueChange={(value) =>
                setValue("category", value as ExpenseFormValues["category"], { shouldValidate: true })
              }
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-error">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (AED)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
              aria-invalid={!!errors.amount}
            />
            {errors.amount && <p className="text-sm text-error">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="incurredOn">Incurred On</Label>
            <Input id="incurredOn" type="date" {...register("incurredOn")} aria-invalid={!!errors.incurredOn} />
            {errors.incurredOn && <p className="text-sm text-error">{errors.incurredOn.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Method</Label>
            <Select
              value={watch("method")}
              onValueChange={(value) =>
                setValue("method", value as ExpenseFormValues["method"], { shouldValidate: true })
              }
            >
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.method && <p className="text-sm text-error">{errors.method.message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <FileText className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Vendor &amp; Invoice</h3>
        </div>
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Input
                id="vendorName"
                placeholder="e.g. Al Reem Maintenance LLC"
                {...register("vendorName")}
                aria-invalid={!!errors.vendorName}
              />
              {errors.vendorName && <p className="text-sm text-error">{errors.vendorName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number (optional)</Label>
              <Input
                id="invoiceNumber"
                placeholder="e.g. INV-2026-0042"
                {...register("invoiceNumber")}
                aria-invalid={!!errors.invoiceNumber}
              />
              {errors.invoiceNumber && <p className="text-sm text-error">{errors.invoiceNumber.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="e.g. Replaced the lobby AC compressor"
              rows={3}
              {...register("description")}
              aria-invalid={!!errors.description}
            />
            {errors.description && <p className="text-sm text-error">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Add any notes about this expense…" rows={3} {...register("notes")} />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-4 rounded-xl border border-outline-variant bg-surface p-6">
        <Button type="button" variant="outline" onClick={goBack}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isPending}>
          {isPending ? "Saving…" : isEdit ? "Save Expense" : "Record Expense"}
        </Button>
      </div>
    </form>
  )
}

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { CalendarRange, FileText, Info, Wallet } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { AnimatedFieldGroup } from "@/components/tenants/animated-field-group"
import { PropertyCombobox } from "@/components/contracts/property-combobox"
import { TenantCombobox } from "@/components/contracts/tenant-combobox"
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
import { useCreateContract, useRenewContract, useUpdateContract } from "@/hooks/queries/use-contracts"
import { CONTRACT_FORM_STATUS_OPTIONS, PAYMENT_FREQUENCY_OPTIONS } from "@/lib/contract-labels"
import { QUERY_KEYS, ROUTES } from "@/lib/constants"
import { getErrorMessage } from "@/lib/get-error-message"
import { cn } from "@/lib/utils"
import { contractSchema, type ContractFormInput, type ContractFormValues } from "@/lib/validation/contract"
import { propertyService } from "@/services/property-service"
import { tenantService } from "@/services/tenant-service"
import type { Contract } from "@/types/contract"

function toDateInputValue(value?: string | null): string {
  return value ? value.slice(0, 10) : ""
}

const RENT_MISMATCH_THRESHOLD = 0.15

export function ContractForm({
  contract,
  renewFrom,
  defaultTenantId,
  defaultPropertyId,
}: {
  contract?: Contract
  renewFrom?: Contract
  defaultTenantId?: string
  defaultPropertyId?: string
}) {
  const router = useRouter()
  const isEdit = !!contract
  const isRenew = !!renewFrom
  const source = contract ?? renewFrom

  const tenantsListQuery = { page: 1, limit: 100, sortBy: "nameEn" as const, sortOrder: "asc" as const }
  const tenantsQuery = useQuery({
    queryKey: QUERY_KEYS.tenants(tenantsListQuery),
    queryFn: () => tenantService.list(tenantsListQuery),
  })
  const tenants = tenantsQuery.data?.items ?? []

  const propertiesListQuery = { page: 1, limit: 100, sortBy: "unitNumber" as const, sortOrder: "asc" as const }
  const propertiesQuery = useQuery({
    queryKey: QUERY_KEYS.properties(propertiesListQuery),
    queryFn: () => propertyService.list(propertiesListQuery),
  })
  const properties = propertiesQuery.data?.items ?? []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormInput, unknown, ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contractNumber: isRenew ? "" : (contract?.contractNumber ?? ""),
      tenantId: source?.tenant.id ?? defaultTenantId ?? "",
      propertyId: source?.property.id ?? defaultPropertyId ?? "",
      startDate: isRenew ? toDateInputValue(renewFrom.endDate) : toDateInputValue(contract?.startDate),
      endDate: isRenew ? "" : toDateInputValue(contract?.endDate),
      annualRent: source?.annualRent,
      monthlyRent: source?.monthlyRent,
      paymentFrequency: source?.paymentFrequency ?? "MONTHLY",
      numberOfCheques: isRenew ? (renewFrom.numberOfCheques ?? undefined) : (contract?.numberOfCheques ?? undefined),
      securityDeposit: isRenew ? (renewFrom.securityDeposit ?? undefined) : (contract?.securityDeposit ?? undefined),
      status: isRenew
        ? "DRAFT"
        : contract && contract.storedStatus !== "TERMINATED"
          ? contract.storedStatus
          : "DRAFT",
      notes: isRenew ? "" : (contract?.notes ?? ""),
    },
  })

  const paymentFrequency = watch("paymentFrequency")
  const isCheques = paymentFrequency === "CHEQUES"

  React.useEffect(() => {
    if (!isCheques) {
      setValue("numberOfCheques", undefined, { shouldValidate: false, shouldDirty: false })
    }
  }, [isCheques, setValue])

  const annualRent = watch("annualRent")
  const monthlyRent = watch("monthlyRent")
  const showRentHint =
    !!annualRent &&
    !!monthlyRent &&
    Math.abs(Number(monthlyRent) * 12 - Number(annualRent)) / Number(annualRent) > RENT_MISMATCH_THRESHOLD

  const createMutation = useCreateContract()
  const updateMutation = useUpdateContract()
  const renewMutation = useRenewContract()
  const isPending = createMutation.isPending || updateMutation.isPending || renewMutation.isPending

  const [formError, setFormError] = React.useState<string | null>(null)

  function onSubmit(values: ContractFormValues) {
    setFormError(null)
    const action = isEdit
      ? updateMutation.mutateAsync({ id: contract.id, dto: values })
      : isRenew
        ? renewMutation.mutateAsync({ id: renewFrom.id, dto: values })
        : createMutation.mutateAsync(values)

    action
      .then((saved) => {
        toast.success(isEdit ? "Contract updated." : isRenew ? "Contract renewed." : "Contract registered.")
        router.push(ROUTES.contractDetail(saved.id))
      })
      .catch((error) => {
        setFormError(getErrorMessage(error, "Failed to save contract."))
      })
  }

  function goBack() {
    router.push(isEdit ? ROUTES.contractDetail(contract.id) : ROUTES.contracts)
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
          <Info className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Parties</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="contractNumber">Contract Number</Label>
            <Input
              id="contractNumber"
              placeholder="e.g. CT-2026-001"
              {...register("contractNumber")}
              aria-invalid={!!errors.contractNumber}
            />
            {errors.contractNumber && <p className="text-sm text-error">{errors.contractNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantId">Tenant</Label>
            <TenantCombobox
              id="tenantId"
              tenants={tenants}
              value={watch("tenantId")}
              onChange={(tenantId) => setValue("tenantId", tenantId, { shouldValidate: true })}
              isLoading={tenantsQuery.isLoading}
            />
            {errors.tenantId && <p className="text-sm text-error">{errors.tenantId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyId">Property</Label>
            <PropertyCombobox
              id="propertyId"
              properties={properties}
              value={watch("propertyId")}
              onChange={(propertyId) => setValue("propertyId", propertyId, { shouldValidate: true })}
              isLoading={propertiesQuery.isLoading}
            />
            {errors.propertyId && <p className="text-sm text-error">{errors.propertyId.message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <CalendarRange className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Term</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" {...register("startDate")} aria-invalid={!!errors.startDate} />
            {errors.startDate && <p className="text-sm text-error">{errors.startDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" {...register("endDate")} aria-invalid={!!errors.endDate} />
            {errors.endDate && <p className="text-sm text-error">{errors.endDate.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="status">Status</Label>
            <div id="status" className="flex gap-2 rounded-lg bg-surface-container p-1 md:w-1/2">
              {CONTRACT_FORM_STATUS_OPTIONS.map((option) => {
                const isActive = watch("status") === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue("status", option.value, { shouldValidate: true })}
                    className={cn(
                      "flex-1 rounded-md py-2 text-xs font-bold transition-colors",
                      isActive
                        ? "border border-outline-variant bg-surface text-primary shadow-sm"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <Wallet className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Financials (Agreed Terms)</h3>
        </div>
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="annualRent">Annual Rent (AED)</Label>
              <Input
                id="annualRent"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                {...register("annualRent")}
                aria-invalid={!!errors.annualRent}
              />
              {errors.annualRent && <p className="text-sm text-error">{errors.annualRent.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Monthly Rent (AED)</Label>
              <Input
                id="monthlyRent"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                {...register("monthlyRent")}
                aria-invalid={!!errors.monthlyRent}
              />
              {errors.monthlyRent && <p className="text-sm text-error">{errors.monthlyRent.message}</p>}
            </div>
          </div>

          {showRentHint && (
            <p className="text-sm text-warning">
              Heads up: monthly rent × 12 differs quite a bit from the annual rent. This is fine for
              non-standard leases — just double-check the numbers.
            </p>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paymentFrequency">Payment Frequency</Label>
              <Select
                value={watch("paymentFrequency")}
                onValueChange={(value) =>
                  setValue("paymentFrequency", value as ContractFormValues["paymentFrequency"], { shouldValidate: true })
                }
              >
                <SelectTrigger id="paymentFrequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentFrequency && <p className="text-sm text-error">{errors.paymentFrequency.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityDeposit">Security Deposit (AED)</Label>
              <Input
                id="securityDeposit"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                {...register("securityDeposit")}
                aria-invalid={!!errors.securityDeposit}
              />
              {errors.securityDeposit && <p className="text-sm text-error">{errors.securityDeposit.message}</p>}
            </div>
          </div>

          <AnimatedFieldGroup activeKey={isCheques ? "cheques" : "none"}>
            {isCheques ? (
              <div className="max-w-xs space-y-2">
                <Label htmlFor="numberOfCheques">Number of Cheques</Label>
                <Input
                  id="numberOfCheques"
                  type="number"
                  min={1}
                  placeholder="e.g. 4"
                  {...register("numberOfCheques")}
                  aria-invalid={!!errors.numberOfCheques}
                />
                {errors.numberOfCheques && <p className="text-sm text-error">{errors.numberOfCheques.message}</p>}
              </div>
            ) : (
              <div />
            )}
          </AnimatedFieldGroup>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <FileText className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Notes</h3>
        </div>
        <div className="p-6">
          <Textarea id="notes" placeholder="Add any specific lease notes…" rows={3} {...register("notes")} />
        </div>
      </section>

      <div className="flex items-center justify-end gap-4 rounded-xl border border-outline-variant bg-surface p-6">
        <Button type="button" variant="outline" onClick={goBack}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isPending}>
          {isPending ? "Saving…" : isRenew ? "Renew Contract" : "Save Contract"}
        </Button>
      </div>
    </form>
  )
}

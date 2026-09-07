"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { CalendarRange, FileText, Info, Lock, Wallet } from "lucide-react"
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
import { useContract, usePropertyContracts } from "@/hooks/queries/use-contracts"
import { useCreatePayment, useUpdatePayment } from "@/hooks/queries/use-payments"
import { usePropertiesByBuilding } from "@/hooks/queries/use-properties"
import { QUERY_KEYS, ROUTES } from "@/lib/constants"
import { PAYMENT_KIND_OPTIONS, PAYMENT_METHOD_OPTIONS } from "@/lib/finance-labels"
import { getErrorMessage } from "@/lib/get-error-message"
import { moneyToInputValue } from "@/lib/money"
import { paymentSchema, type PaymentFormInput, type PaymentFormValues } from "@/lib/validation/payment"
import { buildingService } from "@/services/building-service"
import type { Payment } from "@/types/payment"

function toDateInputValue(value?: string | null): string {
  return value ? value.slice(0, 10) : ""
}

export function PaymentForm({
  payment,
  defaultContractId,
}: {
  payment?: Payment
  defaultContractId?: string
}) {
  const router = useRouter()
  const isEdit = !!payment

  /**
   * A payment created by a cheque clearing is owned by that cheque: the backend
   * rejects amount/paidOn/kind/method edits with a 409. Lock those fields rather
   * than letting the user discover it on submit.
   */
  const isChequeLocked = !!payment?.isChequeLinked

  // The contract is picked in three steps — building, then unit, then that
  // unit's contracts. Building and unit are local state: only contractId is
  // part of the payment itself.
  const [buildingId, setBuildingId] = React.useState("")
  const [propertyId, setPropertyId] = React.useState("")

  const buildingsListQuery = { page: 1, limit: 100, sortBy: "name" as const, sortOrder: "asc" as const }
  const buildingsQuery = useQuery({
    queryKey: QUERY_KEYS.buildings(buildingsListQuery),
    queryFn: () => buildingService.list(buildingsListQuery),
    enabled: !isEdit,
  })
  const buildings = buildingsQuery.data?.items ?? []

  const propertiesQuery = usePropertiesByBuilding(buildingId, { enabled: !isEdit && !!buildingId })
  const properties = propertiesQuery.data ?? []

  const contractsQuery = usePropertyContracts(propertyId, { enabled: !isEdit && !!propertyId })
  const contracts = contractsQuery.data ?? []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      contractId: payment?.contractId ?? defaultContractId ?? "",
      kind: payment?.kind ?? "RENT",
      amount: moneyToInputValue(payment?.amount),
      paidOn: toDateInputValue(payment?.paidOn),
      method: payment?.method ?? "BANK_TRANSFER",
      periodStart: toDateInputValue(payment?.periodStart),
      periodEnd: toDateInputValue(payment?.periodEnd),
      referenceNumber: payment?.referenceNumber ?? "",
      notes: payment?.notes ?? "",
    },
  })

  // For a cheque payment the reference number IS the cheque number, so the same
  // field is labelled for what it actually holds.
  const isCheque = watch("method") === "CHEQUE"

  // "Record payment" deep-links from a contract with ?contractId=… — fetch that
  // contract so the building and unit above it start out selected too.
  const prefillQuery = useContract(defaultContractId ?? "", {
    enabled: !isEdit && !!defaultContractId,
  })
  const prefillContract = prefillQuery.data
  React.useEffect(() => {
    if (!prefillContract) return
    setBuildingId(prefillContract.property.building.id)
    setPropertyId(prefillContract.property.id)
  }, [prefillContract])

  function selectBuilding(nextBuildingId: string) {
    setBuildingId(nextBuildingId)
    setPropertyId("")
    setValue("contractId", "", { shouldValidate: false })
  }

  function selectProperty(nextPropertyId: string) {
    setPropertyId(nextPropertyId)
    setValue("contractId", "", { shouldValidate: false })
  }

  const createMutation = useCreatePayment()
  const updateMutation = useUpdatePayment()
  const isPending = createMutation.isPending || updateMutation.isPending

  const [formError, setFormError] = React.useState<string | null>(null)

  function onSubmit(values: PaymentFormValues) {
    setFormError(null)

    // On a locked payment only notes and reference number are sent — anything
    // else would be rejected, and we never try to detach the cheque.
    const action = isEdit
      ? updateMutation.mutateAsync({
          id: payment.id,
          dto: isChequeLocked
            ? { referenceNumber: values.referenceNumber || undefined, notes: values.notes || undefined }
            : {
                kind: values.kind,
                amount: values.amount,
                paidOn: values.paidOn,
                method: values.method,
                periodStart: values.periodStart || undefined,
                periodEnd: values.periodEnd || undefined,
                referenceNumber: values.referenceNumber || undefined,
                notes: values.notes || undefined,
              },
        })
      : createMutation.mutateAsync({
          contractId: values.contractId,
          kind: values.kind,
          amount: values.amount,
          paidOn: values.paidOn,
          method: values.method,
          periodStart: values.periodStart || undefined,
          periodEnd: values.periodEnd || undefined,
          referenceNumber: values.referenceNumber || undefined,
          notes: values.notes || undefined,
        })

    action
      .then((saved) => {
        toast.success(isEdit ? "Payment updated." : "Payment recorded.")
        router.push(ROUTES.paymentDetail(saved.id))
      })
      .catch((error) => {
        setFormError(getErrorMessage(error, "Failed to save payment."))
      })
  }

  function goBack() {
    router.push(isEdit ? ROUTES.paymentDetail(payment.id) : ROUTES.payments)
  }

  return (
    <form className="space-y-stack-lg" onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError && (
        <p role="alert" className="rounded-lg bg-error/10 px-4 py-3 text-sm font-medium text-error">
          {formError}
        </p>
      )}

      {isChequeLocked && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-5">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <p className="text-body-md text-on-surface">
            This payment came from a cleared cheque and cannot be edited directly. Manage the cheque
            instead
            {payment?.cheque && (
              <>
                {" — "}
                <Link href={ROUTES.chequeDetail(payment.cheque.id)} className="text-secondary hover:underline">
                  cheque {payment.cheque.chequeNumber}
                </Link>
              </>
            )}
            . Only the reference number and notes can be changed here.
          </p>
        </div>
      )}

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <Info className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Contract</h3>
        </div>
        {isEdit ? (
          // The contract can never move after creation — the backend omits it
          // from the update DTO entirely — so it is shown, not offered.
          <div className="space-y-4 p-6">
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <dt className="text-sm text-on-surface-variant">Building</dt>
                <dd className="text-body-md text-on-surface">
                  {payment.contract
                    ? `${payment.contract.property.building.name} (${payment.contract.property.building.code})`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-on-surface-variant">Unit</dt>
                <dd className="text-body-md text-on-surface">
                  {payment.contract ? `Unit ${payment.contract.property.unitNumber}` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-on-surface-variant">Contract</dt>
                <dd className="text-body-md text-on-surface">
                  {payment.contract
                    ? `${payment.contract.contractNumber} — ${payment.contract.tenant.nameEn}`
                    : "—"}
                </dd>
              </div>
            </dl>
            <p className="text-sm text-on-surface-variant">
              A payment cannot be moved to another contract. Delete it and re-enter instead.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="buildingId">Building</Label>
              <BuildingCombobox
                id="buildingId"
                buildings={buildings}
                value={buildingId}
                onChange={selectBuilding}
                isLoading={buildingsQuery.isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyId">Unit</Label>
              <Select value={propertyId} disabled={!buildingId} onValueChange={selectProperty}>
                <SelectTrigger id="propertyId">
                  <SelectValue placeholder={buildingId ? "Select a unit…" : "Pick a building first"} />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      Unit {property.unitNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {buildingId && !propertiesQuery.isLoading && properties.length === 0 && (
                <p className="text-sm text-on-surface-variant">This building has no units yet.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractId">Contract</Label>
              <Select
                value={watch("contractId")}
                disabled={!propertyId}
                onValueChange={(contractId) => setValue("contractId", contractId, { shouldValidate: true })}
              >
                <SelectTrigger id="contractId">
                  <SelectValue placeholder={propertyId ? "Select a contract…" : "Pick a unit first"} />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.contractNumber} — {contract.tenant.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {propertyId && !contractsQuery.isLoading && contracts.length === 0 && (
                <p className="text-sm text-on-surface-variant">This unit has no contracts yet.</p>
              )}
              {errors.contractId && <p className="text-sm text-error">{errors.contractId.message}</p>}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <Wallet className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Payment</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (AED)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              disabled={isChequeLocked}
              {...register("amount")}
              aria-invalid={!!errors.amount}
            />
            {errors.amount && <p className="text-sm text-error">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidOn">Paid On</Label>
            <Input
              id="paidOn"
              type="date"
              disabled={isChequeLocked}
              {...register("paidOn")}
              aria-invalid={!!errors.paidOn}
            />
            {errors.paidOn && <p className="text-sm text-error">{errors.paidOn.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kind">Kind</Label>
            <Select
              value={watch("kind")}
              disabled={isChequeLocked}
              onValueChange={(value) =>
                setValue("kind", value as PaymentFormValues["kind"], { shouldValidate: true })
              }
            >
              <SelectTrigger id="kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_KIND_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.kind && <p className="text-sm text-error">{errors.kind.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Method</Label>
            <Select
              value={watch("method")}
              disabled={isChequeLocked}
              onValueChange={(value) =>
                setValue("method", value as PaymentFormValues["method"], { shouldValidate: true })
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

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="referenceNumber">{isCheque ? "Cheque Number" : "Reference Number"}</Label>
            <Input
              id="referenceNumber"
              placeholder={isCheque ? "e.g. 000451" : "e.g. TRX-99881"}
              {...register("referenceNumber")}
              aria-invalid={!!errors.referenceNumber}
            />
            {errors.referenceNumber && <p className="text-sm text-error">{errors.referenceNumber.message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <CalendarRange className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Period Covered</h3>
          <span className="text-sm text-on-surface-variant">(optional)</span>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="periodStart">Period Start</Label>
            <Input
              id="periodStart"
              type="date"
              disabled={isChequeLocked}
              {...register("periodStart")}
              aria-invalid={!!errors.periodStart}
            />
            {errors.periodStart && <p className="text-sm text-error">{errors.periodStart.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="periodEnd">Period End</Label>
            <Input
              id="periodEnd"
              type="date"
              disabled={isChequeLocked}
              {...register("periodEnd")}
              aria-invalid={!!errors.periodEnd}
            />
            {errors.periodEnd && <p className="text-sm text-error">{errors.periodEnd.message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <FileText className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Notes</h3>
        </div>
        <div className="p-6">
          <Textarea id="notes" placeholder="Add any notes about this payment…" rows={3} {...register("notes")} />
        </div>
      </section>

      <div className="flex items-center justify-end gap-4 rounded-xl border border-outline-variant bg-surface p-6">
        <Button type="button" variant="outline" onClick={goBack}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isPending}>
          {isPending ? "Saving…" : isEdit ? "Save Payment" : "Record Payment"}
        </Button>
      </div>
    </form>
  )
}
